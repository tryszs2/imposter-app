import React, { useState } from "react";
import { WordsProvider } from "./wordsContext";
import OnlineGame from "./OnlineGame";
import HotseatGame from "./HotseatGame";
import "./App.css";

function MainApp() {
  const [mode, setMode] = useState(null);

  if (!mode) {
    return (
      <div className="main-menu">
        <div className="main-card">
          <h2>Spielmodus wählen</h2>
          <button className="card" onClick={() => setMode("online")}>🌐 Online (Lobby)</button>
          <button className="card" onClick={() => setMode("hotseat")}>📱 Hotseat-Modus</button>
        </div>
      </div>
    );
  }

  if (mode === "hotseat") return <HotseatGame goBack={() => setMode(null)} />;
  if (mode === "online") return <OnlineGame goBack={() => setMode(null)} />;

  return null;
}

export default function App() {
  return (
    <WordsProvider>
      <MainApp />
    </WordsProvider>
  );
}
