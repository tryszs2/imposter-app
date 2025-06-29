import { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.css';
import MultiSelectDropdown from './MultiSelectDropdown';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [lobbySettings, setLobbySettings] = useState(null);
  const [role, setRole] = useState(null);
  const [word, setWord] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [starter, setStarter] = useState('');
  const [categories, setCategories] = useState([
    // Fallback falls Backend nicht erreichbar
    'Tiere', 'Länder', 'Berufe', 'Random', 'Promis', 'Dinge'
  ]);

  useEffect(() => {
    // Kategorien einmalig vom Server laden
    fetch('http://localhost:3001/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {}); // Bei Fehler bleibt der Fallback erhalten

    let countdownInterval = null;
    socket.on('lobbyCreated', (code) => setMyCode(code));

    socket.on('updateLobby', (data) => {
      if (
        data.players &&
        playerName &&
        !data.players.includes(playerName)
      ) {
        resetAllState();
        return;
      }
      setPlayers(data.players);
      setLobbySettings(data.settings);
      if (!myCode) setMyCode(data.code);
    });

    socket.on('gameStart', ({ role, word }) => {
      setCountdown(3);
      setRole(null);
      setWord(null);
      setStarter('');
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
    });

    socket.on('starterChosen', (name) => setStarter(name));

    socket.on('lobbyNotFound', () => {
      alert('Lobby nicht gefunden oder du wurdest rausgeworfen.');
      resetAllState();
    });

    return () => {
      socket.off('lobbyCreated');
      socket.off('updateLobby');
      socket.off('gameStart');
      socket.off('lobbyNotFound');
      socket.off('starterChosen');
      if (countdownInterval) clearInterval(countdownInterval);
    };
    // eslint-disable-next-line
  }, [myCode, playerName]);

  const createLobby = () => {
    if (!playerName.trim()) {
      alert('Bitte gib einen Namen ein.');
      return;
    }
    socket.emit('createLobby', playerName.trim());
  };

  const joinLobby = () => {
    if (!playerName.trim()) {
      alert('Bitte gib einen Namen ein.');
      return;
    }
    if (!inputCode.trim()) {
      alert('Bitte gib einen Lobbycode ein.');
      return;
    }
    socket.emit('joinLobby', { code: inputCode.trim(), name: playerName.trim() });
  };

  const startGame = () => {
    if (!lobbySettings) return;
    if (players.length < 3) {
      alert('Mindestens 3 Spieler erforderlich!');
      return;
    }
    if (lobbySettings.numImposters >= players.length) {
      alert('Zu viele Imposter! Weniger als Spieleranzahl wählen.');
      return;
    }
    socket.emit('startGame', {
      code: myCode,
      settings: lobbySettings
    });
  };

  // Dropdown-Mehrfachauswahl für Kategorien
  const updateCategory = (arr) => {
    updateSetting('category', arr);
  };

  const updateSetting = (key, value) => {
    if (!lobbySettings) return;
    const newSettings = { ...lobbySettings, [key]: value };
    setLobbySettings(newSettings);
    socket.emit('updateSettings', { code: myCode, settings: newSettings });
  };

  const kickPlayer = (name) => {
    socket.emit('kickPlayer', { code: myCode, playerName: name });
  };

  const setAsHost = (name) => {
    socket.emit('setHost', { code: myCode, playerName: name });
  };

  const resetAllState = () => {
    setMyCode('');
    setLobbySettings(null);
    setPlayers([]);
    setRole(null);
    setWord('');
    setCountdown(null);
    setStarter('');
    setInputCode('');
  };

  const leaveLobby = () => {
    if (myCode) {
      socket.emit('leaveLobby', { code: myCode });
    }
    resetAllState();
  };

  const resetToLobby = () => {
    setRole(null);
    setWord('');
    setCountdown(null);
    setStarter('');
  };

  const inLobby = !!myCode && lobbySettings && !role && countdown === null;

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: '#f6f8fa'
    }}>
      <div className="main-card">

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
            <ul className="lobby-list">
              {players.map((name, idx) => (
                <li key={idx} style={{ gap: 10 }}>
                  <span style={{ fontWeight: name === playerName ? 600 : 400 }}>
                    {name}
                  </span>
                  {lobbySettings && name === lobbySettings.hostName && (
                    <span className="host-label">
                      <span role="img" aria-label="host">👑</span> Host
                    </span>
                  )}
                  {lobbySettings && lobbySettings.hostId === socket.id && name !== playerName && (
                    <>
                      <button className="kick-btn" title="Rauswerfen" onClick={() => kickPlayer(name)}>
                        <span role="img" aria-label="kick">❌</span>
                      </button>
                      <button
                        style={{
                          fontSize: '1rem',
                          background: '#a7f3d0',
                          color: '#065f46',
                          marginLeft: '0.5rem',
                          border: 'none',
                          borderRadius: '1rem',
                          padding: '0.2rem 0.85rem',
                          cursor: 'pointer',
                        }}
                        title="Zum Host machen"
                        onClick={() => setAsHost(name)}
                      >
                        <span role="img" aria-label="Krone">👑</span>
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {/* Host: Settings anpassen */}
            {lobbySettings.hostId === socket.id && (
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
                <div>Schwierigkeit: <b>{lobbySettings.difficulty}</b></div>
                <div>Anzahl Imposter: <b>{lobbySettings.numImposters}</b></div>
                <div className="italic text-gray-500" style={{ color: '#838ca8', marginTop: 5 }}>Warten auf den Host...</div>
              </div>
            )}

            <button className="card" onClick={leaveLobby} style={{ marginTop: 12, background: "#6366f1", color: "#fff" }}>
              Lobby verlassen
            </button>
          </>
        )}

        {countdown !== null && (
          <div className="countdown">{countdown > 0 ? countdown : "Start!"}</div>
        )}

        {role && countdown === null && (
          <div style={{ width: "100%" }}>
            <div className={role === 'Imposter' ? 'role-imposter' : 'role-word'}>
              {role === 'Imposter'
                ? 'Du bist der Imposter!'
                : `Dein Wort: ${word}`}
            </div>
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

export default App;
