// src/WordListDisplay.jsx
import React from "react";

export default function WordListDisplay({ wordSubmissions }) {
  if (!wordSubmissions || wordSubmissions.length === 0) {
    return (
      <div style={{
        marginTop: 18,
        padding: 10,
        background: "#f3f4f6",
        borderRadius: 8,
        color: "#6b7280",
        textAlign: "center"
      }}>
        Noch keine Wörter eingereicht.
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 18,
      padding: 10,
      background: "#f9fafb",
      borderRadius: 8,
      boxShadow: "0 0 0 1px #e5e7eb"
    }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Abgegebene Wörter:</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {wordSubmissions.map((entry, idx) => (
          <li key={idx} style={{
            padding: "6px 0",
            borderBottom: idx !== wordSubmissions.length - 1 ? "1px solid #e5e7eb" : "none",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <span style={{
              color: "#2563eb",
              fontWeight: 500,
              minWidth: 80,
              display: "inline-block"
            }}>
              {entry.playerName}
            </span>
            <span style={{ color: "#253255" }}>
              {entry.word}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
