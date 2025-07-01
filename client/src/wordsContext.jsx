// src/wordsContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const WordsContext = createContext();

export function WordsProvider({ children }) {
  const [words, setWords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/words') // <--- HIER auf /words
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
        setLoading(false);
      });
  }, []);

  return (
    <WordsContext.Provider value={{ words, loading }}>
      {children}
    </WordsContext.Provider>
  );
}

export function useWords() {
  return useContext(WordsContext);
}
