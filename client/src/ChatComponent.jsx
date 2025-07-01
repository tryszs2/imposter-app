// src/ChatComponent.jsx
import React, { useRef, useEffect, useState } from "react";

export default function ChatComponent({ chatMessages, onSendMessage, disabled }) {
  const [text, setText] = useState("");
  const endRef = useRef();

  console.log("ChatComponent rendered with messages:", chatMessages);

  // Automatisch nach unten scrollen, wenn neue Nachrichten kommen
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: 12,
      padding: '12px 16px',
      marginTop: 20,
      marginBottom: 12,
      border: "1px solid #e2e8f0"
    }}>
      <div style={{
        height: 250,
        maxHeight: 250,
        overflowY: 'auto',
        marginBottom: 12,
        padding: '8px 12px',
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8
      }}>
        {chatMessages.length === 0 && (
          <div style={{ color: "#a1a1aa", textAlign: "center", paddingTop: '1rem' }}>
            Noch keine Nachrichten… der Chat beginnt hier!
          </div>
        )}
        {chatMessages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: "#2563eb" }}>{msg.player}:</span>{" "}
            <span style={{ color: "#18181b" }}>{msg.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (text.trim()) {
            onSendMessage(text);
            setText("");
          }
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Nachricht schreiben..."
          disabled={disabled}
          style={{
            flex: 1,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            padding: "0.5rem 0.75rem",
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            fontWeight: 500,
            fontSize: '1rem',
            cursor: disabled || !text.trim() ? "not-allowed" : "pointer",
            opacity: disabled || !text.trim() ? 0.6 : 1
          }}
        >
          Senden
        </button>
      </form>
    </div>
  );
}
