// MultiSelectDropdown.jsx
import { useRef, useEffect, useState } from "react";
import "./MultiSelectDropdown.css";

export default function MultiSelectDropdown({
  label,
  options = [],          // <- Fallback damit options NIE undefined ist!
  selected = [],
  onChange
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Schließt das Menü, wenn man außerhalb klickt
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = (opt) => {
    let arr = Array.isArray(selected) ? [...selected] : [];
    if (arr.includes(opt)) {
      arr = arr.filter(o => o !== opt);
    } else {
      arr.push(opt);
    }
    if (arr.length === 0 && options.length > 0) arr = [options[0]];
    onChange(arr);
  };

  return (
    <div className="msd-outer" ref={menuRef}>
      <label className="msd-label">{label}</label>
      <button
        type="button"
        className="msd-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <div className="msd-value">
          {selected.length === options.length
            ? "Alle Kategorien"
            : selected.length === 0
              ? <span style={{ color: "#ccc" }}>Bitte wählen…</span>
              : selected.join(", ")}
        </div>
        <span className="msd-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="msd-menu" tabIndex={-1}>
          {options.map(opt => (
            <div
              className="msd-option"
              key={opt}
              tabIndex={0}
              onClick={() => handleSelect(opt)}
              style={{
                background: selected.includes(opt) ? "#e0e7ff" : "#fff",
                color: selected.includes(opt) ? "#2563eb" : "#253255",
                fontWeight: selected.includes(opt) ? 600 : 400,
              }}
            >
              <span style={{
                display: "inline-block",
                width: 22,
                height: 22,
                marginRight: 10,
                borderRadius: "50%",
                background: selected.includes(opt) ? "#6366f1" : "#e5e7eb",
                border: selected.includes(opt) ? "2px solid #2563eb" : "2px solid #d1d5db",
                transition: "background 0.16s, border 0.16s",
                verticalAlign: "middle"
              }}>
                {selected.includes(opt) &&
                  <span style={{
                    display: "block",
                    width: 10,
                    height: 10,
                    margin: "5px auto",
                    borderRadius: "50%",
                    background: "#fff",
                  }}></span>
                }
              </span>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
