// index.js (Node.js Backend)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const words = require('./words'); // <-- Dein Wörter-Objekt hier importieren!

const app = express();
app.use(cors());

// API-Endpunkt für Wortpool (für das Frontend)
app.get('/words', (req, res) => res.json(words));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const lobbies = new Map();

// Hilfsfunktion: zufällig mischen
function shuffle(array) {
  return array
    .map(x => [Math.random(), x])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1]);
}

// Lobby-Code immer 4-stellig
function generateLobbyCode() {
  return (Math.floor(1000 + Math.random() * 9000)).toString();
}

io.on('connection', (socket) => {
  // LOBBY ANLEGEN
  socket.on('createLobby', (name) => {
    const code = generateLobbyCode();
    lobbies.set(code, {
      host: socket.id,
      players: [{ id: socket.id, name }],
      settings: {
        category: ['Tiere'],
        numImposters: 1,
        hostId: socket.id,
        hostName: name,
        noTalking: false,
        impostersKnowEachOther: false,
      },
      game: null
    });
    socket.join(code);
    socket.emit('lobbyCreated', code);
    io.to(code).emit('updateLobby', {
      code,
      players: lobbies.get(code).players.map(p => p.name),
      settings: lobbies.get(code).settings
    });
  });

  // LOBBY BEITRETEN
  socket.on('joinLobby', ({ code, name }) => {
    const lobby = lobbies.get(code);
    if (!lobby) return socket.emit('lobbyNotFound');
    if (!lobby.players.find(p => p.id === socket.id)) {
      lobby.players.push({ id: socket.id, name });
    }
    socket.join(code);
    io.to(code).emit('updateLobby', {
      code,
      players: lobby.players.map(p => p.name),
      settings: lobby.settings
    });
  });

  // LOBBY EINSTELLUNGEN ÄNDERN
  socket.on('updateSettings', ({ code, settings }) => {
    const lobby = lobbies.get(code);
    if (lobby && lobby.host === socket.id) {
      lobby.settings = { ...lobby.settings, ...settings };
      io.to(code).emit('updateLobby', {
        code,
        players: lobby.players.map(p => p.name),
        settings: lobby.settings
      });
    }
  });

  // SPIEL STARTEN
  socket.on('startGame', ({ code, settings }) => {
    const lobby = lobbies.get(code);
    if (!lobby) return;

    const chosenCategories = Array.isArray(settings.category) ? settings.category : [settings.category];
    let pool = [];
    for (const cat of chosenCategories) {
      if (words[cat]) pool = pool.concat(words[cat]);
    }
    if (pool.length === 0) pool = ['Fehler'];
    const word = pool[Math.floor(Math.random() * pool.length)];

    const playerIDs = lobby.players.map(p => p.id);
    const playerNames = lobby.players.map(p => p.name);

    const numImposters = Math.max(1, Math.min(settings.numImposters, playerIDs.length - 1));
    const shuffled = shuffle(playerIDs);
    const imposters = shuffled.slice(0, numImposters);
    const wordOrder = shuffle(playerNames);
    const currentTurnIndex = 0;

    lobby.game = {
      word,
      imposters,
      wordOrder,
      currentTurnIndex,
      submissions: [],
      chat: [],
    };

    // Imposter-Namen für Know-Each-Other
    const impostersNames = lobby.players.filter(p => imposters.includes(p.id)).map(p => p.name);

    // Spielerrollen senden
    lobby.players.forEach(player => {
      io.to(player.id).emit('gameStart', {
        role: imposters.includes(player.id) ? 'Imposter' : 'Word',
        word,
        impostersList: settings.impostersKnowEachOther ? impostersNames : undefined,
      });
    });
    // Reihenfolge senden
    io.to(code).emit('turnOrderUpdate', {
      wordOrder,
      currentTurnIndex
    });
    // Starter-Name senden (optional)
    io.to(code).emit('starterChosen', wordOrder[0]);
  });

  // WORT-ABGABE (Hier: Unendlich viele Runden möglich)
  socket.on('wordSubmission', ({ code, entry }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !lobby.game) return;

    const currName = lobby.game.wordOrder[lobby.game.currentTurnIndex];
    if (entry.player !== currName) return;
    // Prüfe ob dieser Spieler schon abgegeben hat (Doppel-Submit vermeiden, innerhalb der aktuellen Runde)
    if (lobby.game.submissions.find(e => e.player === entry.player)) return;

    lobby.game.submissions.push(entry);
    lobby.game.currentTurnIndex += 1;

    io.to(code).emit('wordSubmission', entry);
    io.to(code).emit('turnOrderUpdate', {
      wordOrder: lobby.game.wordOrder,
      currentTurnIndex: lobby.game.currentTurnIndex
    });

    // Prüfe: Ist die Runde zu Ende? (Alle haben abgegeben)
    if (lobby.game.currentTurnIndex >= lobby.game.wordOrder.length) {
      lobby.game.currentTurnIndex = 0;
      lobby.game.submissions = [];
      io.to(code).emit('newRound'); // Client: Felder zurücksetzen
      io.to(code).emit('turnOrderUpdate', {
        wordOrder: lobby.game.wordOrder,
        currentTurnIndex: 0
      });
    }
  });

  // CHAT-NACHRICHT
  socket.on('chatMessage', ({ code, msg }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !lobby.game) return;
    lobby.game.chat.push(msg);
    io.to(code).emit('chatMessage', msg);
  });

  // LOBBY VERLASSEN
  socket.on('leaveLobby', ({ code }) => {
    const lobby = lobbies.get(code);
    if (lobby) {
      const idx = lobby.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leftWasHost = lobby.host === socket.id;
        lobby.players.splice(idx, 1);
        if (leftWasHost && lobby.players.length > 0) {
          const randomIdx = Math.floor(Math.random() * lobby.players.length);
          lobby.host = lobby.players[randomIdx].id;
          lobby.settings.hostId = lobby.players[randomIdx].id;
          lobby.settings.hostName = lobby.players[randomIdx].name;
        }
        io.to(code).emit('updateLobby', {
          code,
          players: lobby.players.map(p => p.name),
          settings: lobby.settings
        });
        if (lobby.players.length === 0) lobbies.delete(code);
      }
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    lobbies.forEach((lobby, code) => {
      const idx = lobby.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leftWasHost = lobby.host === socket.id;
        lobby.players.splice(idx, 1);
        if (leftWasHost && lobby.players.length > 0) {
          lobby.host = lobby.players[0].id;
          lobby.settings.hostId = lobby.players[0].id;
          lobby.settings.hostName = lobby.players[0].name;
        }
        io.to(code).emit('updateLobby', {
          code,
          players: lobby.players.map(p => p.name),
          settings: lobby.settings
        });
        if (lobby.players.length === 0) lobbies.delete(code);
      }
    });
  });

  // Spieler aus Lobby werfen
  socket.on('kickPlayer', ({ code, playerName }) => {
    const lobby = lobbies.get(code);
    if (!lobby || socket.id !== lobby.host) return;
    const player = lobby.players.find(p => p.name === playerName);
    if (player) {
      lobby.players = lobby.players.filter(p => p.id !== player.id);
      io.to(player.id).emit('lobbyNotFound');
      io.to(code).emit('updateLobby', {
        code,
        players: lobby.players.map(p => p.name),
        settings: lobby.settings
      });
      if (lobby.players.length === 0) lobbies.delete(code);
    }
  });

  // Host ändern
  socket.on('setHost', ({ code, playerName }) => {
    const lobby = lobbies.get(code);
    if (!lobby || socket.id !== lobby.host) return;
    const newHost = lobby.players.find(p => p.name === playerName);
    if (newHost) {
      lobby.host = newHost.id;
      lobby.settings.hostId = newHost.id;
      lobby.settings.hostName = newHost.name;
      io.to(code).emit('updateLobby', {
        code,
        players: lobby.players.map(p => p.name),
        settings: lobby.settings
      });
    }
  });

  socket.on('notFound', () => {
    socket.emit('lobbyNotFound');
  });
});

server.listen(3001, () => console.log('Server läuft auf http://localhost:3001'));
