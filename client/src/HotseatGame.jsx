import { useState } from 'react';
import { useWords } from "./wordsContext";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HotseatGame({ goBack }) {
  const { words, loading } = useWords();
  const categories = words ? Object.keys(words) : [];

  const [step, setStep] = useState('setup');
  const [numPlayers, setNumPlayers] = useState(5);
  const [numImposters, setNumImposters] = useState(1);
  const [category, setCategory] = useState(categories.length > 0 ? [categories[0]] : []);
  const [assigned, setAssigned] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [starter, setStarter] = useState(null);

  // Neu: Kategorien erst updaten, wenn geladen!
  // Wenn Kategorien geladen, aber Auswahl noch leer → vorauswählen
  if (!loading && categories.length > 0 && category.length === 0) {
    setCategory([categories[0]]);
  }

  if (loading) return <div>Wörter & Kategorien werden geladen...</div>;

  // Vorbereitung der Runde
  const startRound = () => {
    // Wörterpool
    let pool = [];
    for (const cat of category) {
      pool = pool.concat(words[cat] || []);
    }
    if (pool.length === 0) pool = ['Fehler'];
    // Zufallswort für diese Runde
    const word = pool[Math.floor(Math.random() * pool.length)];
    // Imposter auslosen
    const playersArr = Array(numPlayers).fill(null).map((_, i) => ({ player: i + 1, role: 'Word', word }));
    const shuffled = shuffle([...playersArr]);
    for (let i = 0; i < numImposters; i++) shuffled[i].role = 'Imposter';
    // Spieler-Array wieder in Originalreihenfolge
    shuffled.sort((a, b) => a.player - b.player);
    setAssigned(shuffled);
    setPlayerIndex(0);
    setShowWord(false);
    setStarter(null);
    setStep('show');
  };

  const nextPlayer = () => {
    if (playerIndex + 1 < numPlayers) {
      setPlayerIndex(playerIndex + 1);
      setShowWord(false);
    } else {
      // Starter losen
      setStarter(Math.floor(Math.random() * numPlayers) + 1);
      setStep('starter');
    }
  };

  // === UI ===
  if (step === 'setup') {
    return (
      <div className="main-card" style={{ minWidth: 340 }}>
        <h2>Hotseat-Modus</h2>
        <div>
          <label>Anzahl Spieler:
            <input type="number" min={3} max={20} value={numPlayers} onChange={e => setNumPlayers(Number(e.target.value))} />
          </label>
        </div>
        <div>
          <label>Anzahl Imposter:
            <input type="number" min={1} max={Math.max(numPlayers - 1, 1)} value={numImposters} onChange={e => setNumImposters(Number(e.target.value))} />
          </label>
        </div>
        <div>
          <label>Kategorien:</label>
          <select multiple value={category} onChange={e => setCategory([...e.target.selectedOptions].map(o => o.value))}>
            {categories.map(cat =>
              <option value={cat} key={cat}>{cat}</option>
            )}
          </select>
        </div>
        <button style={{ marginTop: 18 }} onClick={startRound}>Spiel starten</button>
        <button style={{ marginTop: 10, background: "#eceffd" }} onClick={goBack}>Zurück zum Hauptmenü</button>
      </div>
    );
  }

  if (step === 'show') {
    const current = assigned[playerIndex];
    return (
      <div className="main-card" style={{ minWidth: 340 }}>
        <div style={{ fontSize: '1.25rem', marginBottom: 15 }}>Gib das Handy an <b>Spieler {current.player}</b></div>
        {!showWord ? (
          <button onClick={() => setShowWord(true)} style={{ fontSize: 20, padding: '2rem' }}>Karte aufdecken</button>
        ) : (
          <div>
            <div style={{
              fontSize: '1.45rem',
              margin: '25px 0 20px 0',
              color: current.role === 'Imposter' ? "#dc2626" : "#2563eb"
            }}>
              {current.role === 'Imposter' ? "Du bist der Imposter!" : `Dein Wort: ${current.word}`}
            </div>
            <button onClick={nextPlayer} style={{ fontSize: 18, marginTop: 20 }}>
              {playerIndex + 1 === numPlayers ? "Alle fertig – Starter auslosen" : "Nächster Spieler"}
            </button>
            <button style={{ marginLeft: 14, background: "#eceffd" }} onClick={goBack}>Zurück zum Hauptmenü</button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'starter') {
    return (
      <div className="main-card" style={{ minWidth: 340 }}>
        <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>Alle haben ihr Wort!</div>
        <div style={{ fontSize: "1.25rem" }}>Der Startspieler ist:</div>
        <div style={{ fontSize: "2rem", color: "#2563eb", fontWeight: 600, margin: "20px 0" }}>
          Spieler {starter}
        </div>
        <button onClick={() => setStep('setup')}>Neue Runde</button>
        <button style={{ marginLeft: 14, background: "#eceffd" }} onClick={goBack}>Zurück zum Hauptmenü</button>
      </div>
    );
  }

  return null;
}
