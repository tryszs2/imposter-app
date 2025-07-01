// src/LobbyList.jsx
import React from "react";
import { socket } from "./socket";

export default function LobbyList({
  players,
  playerName,
  lobbySettings,
  onKickPlayer,
  onSetHost
}) {
  return (
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
              <button className="kick-btn" title="Rauswerfen" onClick={() => onKickPlayer(name)}>
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
                onClick={() => onSetHost(name)}
              >
                <span role="img" aria-label="Krone">👑</span>
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
