import React, { useState } from "react";

export default function WordSubmission({ onSubmit, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
    setText(""); // Eingabe leeren
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 10,
        display: "flex",
        gap: 8,
        alignItems: "center"
      }}
    >
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Dein Wort eingeben…"
        disabled={disabled}
        style={{
          flex: 1,
          borderRadius: 4,
          border: "1px solid #d1d5db",
          padding: "0.3rem 0.5rem",
          opacity: disabled ? 0.55 : 1,
          background: disabled ? "#f1f1f1" : "#fff"
        }}
        maxLength={40}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "0.32rem 0.8rem",
          fontWeight: 500,
          cursor: disabled || !text.trim() ? "not-allowed" : "pointer",
          opacity: disabled || !text.trim() ? 0.6 : 1
        }}
      >
        Abschicken
      </button>
    </form>
  );
}
