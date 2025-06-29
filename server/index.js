const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });


const words = {
  Tiere: [
    'Hund', 'Katze', 'Maus', 'Pferd', 'Kuh', 'Schaf', 'Ziege', 'Schwein',
    'Huhn', 'Hahn', 'Ente', 'Gans', 'Kaninchen', 'Hamster', 'Goldfisch',
    'Papagei', 'Wellensittich', 'Taube', 'Rabe', 'Spatz', 'Amsel', 'Storch',
    'Adler', 'Eule', 'Pfau', 'Pinguin', 'Seehund', 'Wal', 'Delfin', 'Hai',
    'Krabbe', 'Qualle', 'Krokodil', 'Nilpferd', 'Giraffe', 'Löwe', 'Tiger',
    'Bär', 'Wolf', 'Fuchs', 'Eichhörnchen', 'Igel', 'Wildschwein', 'Reh',
    'Hirsch', 'Affe', 'Gorilla', 'Känguru', 'Koala', 'Panda', 'Waschbär',
    'Otter', 'Dachs', 'Maulwurf', 'Fledermaus', 'Schmetterling', 'Biene',
    'Wespe', 'Hummel', 'Ameise', 'Marienkäfer', 'Käfer', 'Libelle',
    'Grashüpfer', 'Schnecke', 'Wurm', 'Spinne', 'Fisch', 'Karpfen',
    'Forelle', 'Barsch', 'Hecht', 'Lachs', 'Seepferdchen', 'Muschel',
    'Seestern', 'Kamel', 'Esel', 'Schlange', 'Frosch', 'Kröte',
    'Kakerlake', 'Mücke', 'Zecke', 'Floh', 'Krebs', 'Hummer', 'Garnele',
    'Robbe', 'Faultier', 'Zebra', 'Lama', 'Oktopus', 'Seelöwe', 'Yak',
    'Alpaka', 'Meerschweinchen', 'Marder', 'Delfin', 'Flamingo', 'Strauß',
    'Schwan', 'Emu', 'Pelikan', 'Nashorn', 'Leopard', 'Gepard', 'Bison',
    'Stachelschwein', 'Luchs', 'Wombat', 'Pavian',
    'Waschbär', 'Ameisenbär', 'Waran', 'Capybara',
    'Kakadu', 'Lemur'],
  Länder: [ "Deutschland",
  "Italien",
  "Spanien",
  "Frankreich",
  "Schweden",
  "Norwegen",
  "Australien",
  "Kanada",
  "Brasilien",
  "Schweiz",
  "Japan",
  "Türkei",
  "Indien",
  "Südafrika",
  "USA",
  "Ostfriesland",
  "Bayern",
  "Sibirien",
  "Vatikanstadt",
  "Kleinwalsertal",
  "Nordkorea",
  "Mittelmeerinsel",
  "Transsilvanien",
  "Himalaya",
  "Texas",
  "Hollywood",
  "Alaska",
  "Grönland",
  "Korsika",
  "Mallorca",
  "Ibiza",
  "Sylt",
  "Monaco",
  "Luxemburg",
  "Liechtenstein",
  "San Marino",
  "Kongo",
  "Hongkong",
  "New York",
  "Dubai",
  "Südpol",
  "Nordpol",
  "Andorra",
  "Malediven",
  "Malediven",
  "Mallorca",
  "Kenia",
  "Tokio",
  "Singapur",
  "Hawaii",
  "Bermuda",
  "Kreml", 
  "Atlantis",
  "Silicon Valley",
  "Antarktis",
  "Sahara",
  "Westerwald",
  "Eifel",
  "Moskau",
  "Toskana",
  "Schwarzwald",
  "Amazonas",
  "Karibik",
  "Route 66",
  "Balkan",
  "Bretagne",
  "Fußballnation",
  "Einkaufsparadies",
  "Weihnachtsland",
  "Märchenland",
  "Paradiesinsel" ],
  Berufe: [
  "Bestattungsunternehmer",
  "Leichenwäscher",
  "Matratzen-Tester",
  "Influencer",
  "OnlyFans-Star",
  "Dosenpfand-Sammler",
  "Dönerbudenbesitzer",
  "Shisha-Bar-Betreiber",
  "Wurstfachverkäufer",
  "Politiker",
  "Klofrau",
  "Mülltaucher",
  "Stripper",
  "Hochstapler",
  "Arbeitsloser",
  "TikToker",
  "Hausmeister",
  "Wasserrutschentester",
  "Pizzabote",
  "Imbissbudenwart",
  "Schornsteinfeger",
  "Hausfrau",
  "Möchtegern-Rapper",
  "Steuerhinterzieher",
  "YouTuber",
  "Bierbrauer",
  "Schnapsbrenner",
  "Puffbesitzer",
  "Alkoholtester",
  "FIFA-Präsident",
  "Reichsbürger",
  "Lotto-Millionär",
  "Fortnite-Streamer",
  "Schwarzfahrer",
  "Kioskbesitzer",
  "Kiffer",
  "Praktikant",
  "Weihnachtsmann",
  "Geldwäscher",
  "Schulschwänzer",
  "Motivationscoach",
  "Fake-Prinz"
  ],
  Random: ["Megaritter", "Mercy-Main", "König Thomas", "Saarland", "Bob Tschigerillo", "Radiant", "Inder", "GTI-Fahrer", "Abbelschorle", "Gooner", "Make-a-Wish", "Poposex", "Arbeitszeitbetrug", "Emochaya", "Andrew Tate", "Rainer Winkler", "Nougatbits", "Carbonat Erol", "Türkentasche", "ApoRed", "Schoko Crossaint", "Lidl",  , "Renegade Raider", "Bob Ross", "ChatGPT", "Taube", "Paulaner Spezi", "Spotify", "Tiktok", "Digda", "Die Olchis", "Elektrogiant", "Geoguessr", "BTD 6", "GTA 6", "2.6", "Discord", "Chicken Jockey", "McDonaldas", "Golem", "Monster AG", "Durstlöscher", "Sprudel Wasser", "Skibidi Toilet", "20 Chicken Nuggets", "Rothschild", "KFC Bucket", "Saturn", "Wehinachtsmann und Co.KG", "Epic Games", "Weißer Monster", "Redbull grün", "Himbeeren", "Jägermeister", "Airfryer", "Sonnenblumenkerne", "Nutella", "Airpods", "Stand Up Comedy", "Squid Game", "Friedhof", "Ariel 3 in 1 Pods", "Lays Chips", "Wii Sport"],
  Promis: ["Angela Merkel", "Donald Trump", "Elon Musk", "Jeff Bezos", "Kanye West", "Friedrich Merz", "Olaf Scholz", "Joe Biden", "Vladimir Putin", "Xi Jinping", "Dwayne Johnson (The Rock)", "Marc Andre Ter Stegen", "Julius Caesar", "Napoleon Bonaparte", "Bojack Horseman", "Albert Einstein", "Karin Ritter", "Gurkensohn", "Moneyboy", "Coldmirror", "Boss Baby", "Ralf Schumacher", "Helene Fischer", "ApoRed", "Y-Titty", "Simon Desue", "ConCrafter", "BastiGHG", "Mrs. Incredible", "Kim Possible", "MrWissen2go", "Willi wills wissen", "Rezo", "Gronkh", "Unge", "Paluten", "MontanaBlack", "Katja Krasavice", "BibisBeautyPalace", "Shirin David", "Thomas Gottschalk", "Steve", "Shaggy", "Franz Kafka", "Martin Luther", "Christian Wolf", "Justus Jonas", "Donald Duck", "Homer Simpson", "Maggy Simpson", "Rodrick Hefffley (Gregs großer Bruder)", "Peter Lustig", "Stewie", "Bernd das Brot", "Merkel", "Gzuz", "Kollegah", "Richterin Barbara Salesch", "Adin Ross", "Icarly", "Logan Paul", "Lester (GTA)", "Dream", "Young Sheldon", "Sensei Wu", "Po (Kongfu Panda)", "Master Shifu", "Steven Hawking", "Peter Griffin", "Alexander der Große", "Dobby", "Gini Wesley", "Padme Amidala", "C3PO", "Mort (Fuße)", "King Julien", "Egon Kowalski", "Skipper", "Wall-E", "Gru", "Baby Groot", "Thanos", "Ryan Reynolds", "Adam Sandler", "Lebron", "Walter White", "Morgan Freeman", "Ashoka", "Phineas", "Candice", "Dr. Dofenschmirz", "Robin Hood", "Lightning McQueen", "Daniel Jung", "Shrek", "Rick Sanchez", "Relaxo", "Jesus", "Messi", "CR7", "Kobe Bryant", "Lego Batman", "Manetti", "Sherwood", "Mr. Crabs", "Gelbes M&M", "Chewbacca", "John F. Kennedy", "Kelvin (Prankbros)", "Maggus Rühl", "Bob Tschigerillo", "Michael Scofield", "Dumbledore", "Kleiner Roter Tracktor", "Tom (Tom und das Erdbeermarmeladenbrot mit Honig)", "John Pork", "Magnus Carlsen", "Zenyatta", "Marcel Davis", "Tung Tung Tung Tung Sahur", "Reyna", "Guller BBQ", "Lewis Hamilton", "Otto Waalkes", "Elyas M'barek", "George Floyd", "Speed", "Militante Veganerin", ],
  Dinge: ["Sand", "Kariertes Papier", "Bierdeckel", "Sales", "Kreide", "Fußboden", "Verstärker", "Zahnbürste", "Wii Nunchucks", "Hochdruckreiniger", "7 Up", "Triangel", "Yoguhrt", "Plastikflaschen", "Sagrotan", "Blobfisch", "Bürostuhl (kein Lederstuhl)", "Autos mit USB Port", "Katzenzungen", "Türstopper", "Tuba", "Aspirin", "Tennis Ball", "Batmobil", "Hubba Bubba", "Batterien", "Rasierschaum", "Pummelparty", "Dackel", "Mond", "Hockey", "Knöpfe", "Badelatschen", "Shampoo", "Schottländer", "Leopard", "Socken", "Eis", "Pappe", "Trainspotter", "Stoppschild", "Tortillas", "Vor dem Wecker aufwachen", "Schlüssel", "Erdbeeren", "Metrisches System", "instant Nudeln"]
  

};

const lobbies = new Map();

io.on('connection', (socket) => {
  socket.on('createLobby', (name) => {
    const code = Math.random().toString().slice(2, 6); // 4-stellig
    lobbies.set(code, {
      host: socket.id,
      players: [{ id: socket.id, name }],
      settings: {
        category: ['Tiere'],
        numImposters: 1,
        hostId: socket.id,
        hostName: name
      }
    });
    socket.join(code);
    socket.emit('lobbyCreated', code);
    io.to(code).emit('updateLobby', {
      code,
      players: lobbies.get(code).players.map(p => p.name),
      settings: lobbies.get(code).settings
    });
  });

  socket.on('joinLobby', ({ code, name }) => {
    const lobby = lobbies.get(code);
    if (lobby) {
      if (!lobby.players.find(p => p.id === socket.id)) {
        lobby.players.push({ id: socket.id, name });
      }
      socket.join(code);
      io.to(code).emit('updateLobby', {
        code,
        players: lobby.players.map(p => p.name),
        settings: lobby.settings
      });
    } else {
      socket.emit('lobbyNotFound');
    }
  });

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

  socket.on('kickPlayer', ({ code, playerName }) => {
    const lobby = lobbies.get(code);
    if (lobby && socket.id === lobby.host) {
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
    }
  });

  socket.on('setHost', ({ code, playerName }) => {
    const lobby = lobbies.get(code);
    if (lobby && socket.id === lobby.host) {
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
    }
  });

  socket.on('startGame', ({ code, settings }) => {
    const lobby = lobbies.get(code);
    if (!lobby) return;
    const chosenCategories = Array.isArray(settings.category) ? settings.category : [settings.category];

    // Pool für alle gewählten Kategorien sammeln
    let pool = [];
    for (const cat of chosenCategories) {
      if (words[cat]) {
        pool = pool.concat(words[cat]);
      }
    }
    if (pool.length === 0) pool = ['Fehler'];
    const word = pool[Math.floor(Math.random() * pool.length)];

    const playerIDs = lobby.players.map(p => p.id);
    const numImposters = Math.max(1, Math.min(settings.numImposters, playerIDs.length - 1));
    const shuffled = [...playerIDs].sort(() => 0.5 - Math.random());
    const imposters = shuffled.slice(0, numImposters);

    lobby.players.forEach((player) => {
      io.to(player.id).emit('gameStart', {
        role: imposters.includes(player.id) ? 'Imposter' : 'Word',
        word: word
      });
    });

    // Starter
    const starter = lobby.players[Math.floor(Math.random() * lobby.players.length)];
    io.to(code).emit('starterChosen', starter.name);
  });

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
});

server.listen(3001, () => console.log('Server läuft auf http://localhost:3001'));
