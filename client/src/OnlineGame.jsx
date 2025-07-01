// src/OnlineGame.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "./socket";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { useWords } from "./wordsContext";
import LobbyList from "./LobbyList";
import ChatComponent from "./ChatComponent";
import WordSubmission from "./WordSubmission";
import WordListDisplay from "./WordListDisplay";

export default function OnlineGame({ goBack }) {
  // Lobby/Spiel-States
  const [playerName, setPlayerName] = useState('');
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [lobbySettings, setLobbySettings] = useState(null);
  const [role, setRole] = useState(null);
  const [word, setWord] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [starter, setStarter] = useState('');

  // Game-spezifische States (nur per Socket setzen!)
  const [chatMessages, setChatMessages] = useState([]);
  const [wordSubmissions, setWordSubmissions] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);

  // Wörter / Kategorien aus dem Backend
  const { words: wordsObj, loading } = useWords();
  const categories = wordsObj ? Object.keys(wordsObj) : [];

  const resetAllState = useCallback((keepPlayerName = false) => {
    setMyCode('');
    setLobbySettings(null);
    setPlayers([]);
    setRole(null);
    setWord('');
    setCountdown(null);
    setStarter('');
    setInputCode('');
    setChatMessages([]);
    setWordSubmissions([]);
    setTurnOrder([]);
    setTurnIndex(0);
    if (!keepPlayerName) {
      setPlayerName('');
    }
  }, []);

  // Helper
  const myTurn = !!turnOrder.length && turnOrder[turnIndex] === playerName;
  const alreadySubmitted = !!wordSubmissions.find(w => w.player === playerName);

  const playerNameRef = useRef(playerName);
  playerNameRef.current = playerName;

  // --- SOCKET EVENTS ---
  useEffect(() => {
    let countdownInterval = null;

    // LOBBY-LOGIK
    socket.on('lobbyCreated', (code) => setMyCode(code));
    socket.on('updateLobby', (data) => {
      if (data.players && playerNameRef.current && data.players.includes(playerNameRef.current)) {
        setPlayers(data.players);
        setLobbySettings(data.settings);
        if (!myCode) setMyCode(data.code);
      } else if (data.players && playerNameRef.current && !data.players.includes(playerNameRef.current)) {
        alert('Du wurdest aus der Lobby entfernt oder die Lobby wurde geschlossen.');
        resetAllState(true);
      }
    });
    socket.on('lobbyNotFound', () => {
      alert('Lobby nicht gefunden.');
      resetAllState(true);
    });

    // GAME-LOGIK
    socket.on('gameStart', ({ role, word, impostersList }) => {
      setCountdown(3);
      setRole(null);
      setWord(null);
      setStarter('');
      setChatMessages([]);
      setWordSubmissions([]);
      setTurnOrder([]);
      setTurnIndex(0);

      let timer = 3;
      countdownInterval = setInterval(() => {
        timer -= 1;
        setCountdown(timer);
        if (timer === 0) {
          clearInterval(countdownInterval);
          setRole(role);
          setWord(word);
          setCountdown(null);
        }
      }, 1000);

      if (impostersList) setLobbySettings(ls => ({ ...ls, impostersList }));
    });

    socket.on('starterChosen', (name) => setStarter(name));

    socket.on('turnOrderUpdate', ({ wordOrder, currentTurnIndex }) => {
      setTurnOrder(wordOrder || []);
      setTurnIndex(typeof currentTurnIndex === 'number' ? currentTurnIndex : 0);
    });

    // CHAT/WORD
    socket.on('chatMessage', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });
    socket.on('wordSubmission', (entry) => {
      setWordSubmissions(prev => [...prev, entry]);
    });

    // **NEU**: Runde ist vorbei – zurücksetzen!
    socket.on('newRound', () => {
      setWordSubmissions([]);  // Wortabgaben zurücksetzen
    });

    return () => {
      socket.off('lobbyCreated');
      socket.off('updateLobby');
      socket.off('lobbyNotFound');
      socket.off('gameStart');
      socket.off('starterChosen');
      socket.off('turnOrderUpdate');
      socket.off('chatMessage');
      socket.off('wordSubmission');
      socket.off('newRound'); // Cleanup für das neue Event!
      if (countdownInterval) clearInterval(countdownInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // --- SOCKET SENDS ---
  const sendChatMessage = (text) => {
    if (!myCode) return;
    const msg = { player: playerName, text, time: Date.now() };
    socket.emit('chatMessage', { code: myCode, msg });
  };
  const submitWord = (wordText) => {
    if (!myCode) return;
    const entry = { player: playerName, word: wordText };
    socket.emit('wordSubmission', { code: myCode, entry });
  };

  // --- LOBBY FUNKTIONEN ---
  const createLobby = () => {
    if (!playerName.trim()) return alert('Bitte gib einen Namen ein.');
    socket.emit('createLobby', playerName.trim());
  };
  const joinLobby = () => {
    if (!playerName.trim()) return alert('Bitte gib einen Namen ein.');
    if (!inputCode.trim()) return alert('Bitte gib einen Lobbycode ein.');
    socket.emit('joinLobby', { code: inputCode.trim(), name: playerName.trim() });
  };
  const startGame = () => {
    if (!lobbySettings) return;
    if (players.length < 3) return alert('Mindestens 3 Spieler erforderlich!');
    if (lobbySettings.numImposters >= players.length) return alert('Zu viele Imposter! Weniger als Spieleranzahl wählen.');
    socket.emit('startGame', {
      code: myCode,
      settings: lobbySettings
    });
  };
  const updateCategory = (arr) => updateSetting('category', arr);
  const updateSetting = (key, value) => {
    if (!lobbySettings) return;
    const newSettings = { ...lobbySettings, [key]: value };
    setLobbySettings(newSettings);
    socket.emit('updateSettings', { code: myCode, settings: newSettings });
  };
  const kickPlayer = (name) => socket.emit('kickPlayer', { code: myCode, playerName: name });
  const setAsHost = (name) => socket.emit('setHost', { code: myCode, playerName: name });
  const leaveLobby = () => {
    if (myCode) socket.emit('leaveLobby', { code: myCode });
    resetAllState();
  };
  const resetToLobby = () => {
    setRole(null);
    setWord('');
    setCountdown(null);
    setStarter('');
    setChatMessages([]);
    setWordSubmissions([]);
    setTurnOrder([]);
    setTurnIndex(0);
  };

  const inLobby = !!myCode && lobbySettings && !role && countdown === null;

  if (loading) return <div>Wörter & Kategorien werden geladen...</div>;

  let infoText = "";
    if (lobbySettings?.noTalking && turnOrder.length > 0) {
      const myPos = turnOrder.indexOf(playerName);
      const diff = (myPos - turnIndex + turnOrder.length) % turnOrder.length;

      if (turnOrder[turnIndex] === playerName) {
        infoText = "Du bist dran!";
      } else if (diff === 1) {
        infoText = `Aktuell: ${turnOrder[turnIndex]} ist dran. Du bist als Nächstes dran.`;
      } else if (diff > 1) {
        infoText = `Aktuell: ${turnOrder[turnIndex]} ist dran. Du bist in ${diff} Zügen dran.`;
      }
    }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: '#f6f8fa'
    }}>
      <div className="main-card">

        {/* Zurück zum Hauptmenü */}
        <button
          className="card"
          style={{
            marginBottom: 16,
            background: "#eceffd",
            color: "#253255",
            fontSize: 15,
            width: "100%"
          }}
          onClick={() => {
            leaveLobby();
            goBack();
          }}
        >
          ← Zurück zum Hauptmenü
        </button>

        {/* Lobbysuche/-erstellung */}
        {!myCode && (
          <form className="lobby-form" onSubmit={e => e.preventDefault()} style={{ marginTop: 20 }}>
            <input
              placeholder="Dein Name"
              value={playerName}
              autoComplete="off"
              maxLength={15}
              onChange={e => setPlayerName(e.target.value)}
              style={{ textAlign: 'center' }}
            />
            <button style={{ width: "100%" }} type="button" onClick={createLobby}>Lobby erstellen</button>
            <input
              placeholder="Lobbycode"
              value={inputCode}
              autoComplete="off"
              maxLength={6}
              onChange={e => setInputCode(e.target.value)}
              style={{ textAlign: 'center' }}
            />
            <button style={{ width: "100%" }} type="button" onClick={joinLobby}>Lobby beitreten</button>
          </form>
        )}

        {/* In Lobby */}
        {inLobby && (
          <>
            <div style={{
              fontSize: '1.3rem', marginBottom: 14,
              fontWeight: 600, letterSpacing: '0.01em'
            }}>
              Lobby-Code: <b style={{ fontFamily: 'monospace', color: '#2563eb' }}>{myCode}</b>
            </div>
            <div style={{
              fontSize: '1.08rem', color: '#253255', marginBottom: 7,
              fontWeight: 400
            }}>
              Spieler in der Lobby:
            </div>
            <LobbyList
              players={players}
              playerName={playerName}
              lobbySettings={lobbySettings}
              onKickPlayer={kickPlayer}
              onSetHost={setAsHost}
            />

            {/* Host: Settings anpassen */}
            {lobbySettings && lobbySettings.hostId === socket.id && (
              <div className="settings-form" style={{ marginBottom: 12, marginTop: 12 }}>
                <MultiSelectDropdown
                  label="Kategorien"
                  options={categories}
                  selected={Array.isArray(lobbySettings.category) ? lobbySettings.category : [lobbySettings.category]}
                  onChange={updateCategory}
                />
                <label className="settings-label">
                  Anzahl Imposter:
                  <input
                    type="number"
                    min={1}
                    max={Math.max(players.length - 1, 1)}
                    value={lobbySettings.numImposters}
                    onChange={e => updateSetting('numImposters', Number(e.target.value))}
                    style={{ width: 65, marginLeft: 8, textAlign: 'center' }}
                  />
                </label>
                <label className="settings-label" style={{ display: 'block', marginTop: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!lobbySettings.noTalking}
                    onChange={e => updateSetting("noTalking", e.target.checked)}
                  />{" "}
                  Ohne Reden (nur Chat-Modus)
                </label>
                <label className="settings-label" style={{ display: 'block', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={!!lobbySettings.impostersKnowEachOther}
                    onChange={e => updateSetting("impostersKnowEachOther", e.target.checked)}
                  />{" "}
                  Imposter sehen andere Imposter
                </label>
                <button style={{ marginTop: 10 }} onClick={startGame}>
                  Spiel starten
                </button>
              </div>
            )}

            {/* Gäste: Kategorien-Anzeige */}
            {lobbySettings.hostId !== socket.id && (
              <div style={{
                background: '#f7f9ff',
                borderRadius: '1.2rem',
                padding: '1rem',
                marginBottom: 14,
                marginTop: 12,
                fontSize: '1.06rem'
              }}>
                <div>
                  Kategorien: <b>
                    {Array.isArray(lobbySettings.category)
                      ? lobbySettings.category.join(', ')
                      : lobbySettings.category}
                  </b>
                </div>
                <div>Anzahl Imposter: <b>{lobbySettings.numImposters}</b></div>
                <div className="italic text-gray-500" style={{ color: '#838ca8', marginTop: 5 }}>Warten auf den Host...</div>
              </div>
            )}

            <button className="card" onClick={leaveLobby} style={{ marginTop: 12, background: "#6366f1", color: "#fff" }}>
              Lobby verlassen
            </button>
          </>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div className="countdown">{countdown > 0 ? countdown : "Start!"}</div>
        )}

        {/* --- GAME PHASE --- */}
          {role && countdown === null && (
          <div style={{ width: "100%" }}>
            {/* Rolle & Wort */}
            <div className={role === 'Imposter' ? 'role-imposter' : 'role-word'}>
              {role === 'Imposter'
                ? 'Du bist der Imposter!'
                : `Dein Wort: ${word}`}
            </div>
            {/* Imposter sehen andere Imposter */}
            {role === 'Imposter' && lobbySettings?.impostersKnowEachOther && lobbySettings?.impostersList?.length > 1 && (
              <div style={{ margin: '12px 0', color: '#ca8a04' }}>
                <b>Andere Imposter:</b> {lobbySettings.impostersList.filter(name => name !== playerName).join(", ")}
              </div>
            )}
            {/* Reihenfolge + Hinweis wer dran ist */}
            {lobbySettings?.noTalking && (
              <div style={{ margin: "16px 0 0 0", color: "#64748b", fontSize: "1.1rem" }}>
                <b>Reihenfolge:</b> {turnOrder.join(" → ")}<br />
                <span style={{ color: "#2563eb", fontWeight: 600 }}>
                  {infoText}
                </span>
              </div>
            )}
            {/* Chat immer sichtbar */}
            <ChatComponent
              chatMessages={chatMessages}
              onSendMessage={sendChatMessage}
              disabled={false}
            />
            {/* Wort-Eingabe nur für Spieler an der Reihe */}
            {lobbySettings?.noTalking && (
              <WordSubmission
                onSubmit={submitWord}
                disabled={!myTurn}
              />
            )}
            {/* Liste der abgegebenen Wörter */}
            {lobbySettings?.noTalking && (
              <WordListDisplay wordSubmissions={wordSubmissions} />
            )}
            {/* "Normale" Variante: nur Buttons */}
            {!lobbySettings?.noTalking && (
              <div style={{ color: "#64748b", marginTop: 20 }}>
                Sprecht miteinander und findet die Imposter!
              </div>
            )}
            {starter && (
              <div style={{
                marginTop: 22,
                fontWeight: 500,
                fontSize: '1.28rem',
                textAlign: 'center'
              }}>
                <span style={{ color: '#2563eb' }}>
                  {starter === playerName
                    ? 'Du beginnst!'
                    : `${starter} beginnt!`}
                </span>
              </div>
            )}
            <button
              className="card"
              style={{ background: "#eceffd", color: "#253255" }}
              onClick={resetToLobby}
            >
              Zurück zur Lobby
            </button>
            <button
              className="card"
              style={{ background: "#6366f1", color: "#fff", marginTop: 10 }}
              onClick={leaveLobby}
            >
              Lobby verlassen
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
