import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const TEST_TEXT = "The quick brown fox jumps over the lazy dog.";

interface SpeedTypingTestProps {
  onGameOver: (score: number) => void;
}

const SpeedTypingTest: React.FC<SpeedTypingTestProps> = ({ onGameOver }) => {
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [playerName, setPlayerName] = useState<string>(() => localStorage.getItem('playerName') || '');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!startTime) {
      // Prompt for name if not set
      if (!playerName) {
        let name = '';
        while (!name) {
          name = window.prompt('Please enter your name:')?.trim() || '';
          if (!name) window.alert('Name is required to play!');
        }
        setPlayerName(name);
        localStorage.setItem('playerName', name);
      }
      setStartTime(Date.now());
    }
    setInput(e.target.value);
    if (e.target.value === TEST_TEXT) {
      setEndTime(Date.now());
      setFinished(true);
      inputRef.current?.blur();
    }
  }

  useEffect(() => {
    if (finished && startTime && endTime) {
      const timeMinutes = (endTime - startTime) / 60000;
      const wordCount = TEST_TEXT.split(" ").length;
      const wpm = Math.round(wordCount / timeMinutes);
      onGameOver(wpm);
      // Store score in Firebase with playerName
      if (playerName) {
        setDoc(doc(db, "typingtest_scores", playerName), {
          score: wpm,
          date: new Date().toISOString(),
          playerName,
        }, { merge: true });
      }
    }
  }, [finished, startTime, endTime, onGameOver, playerName]);

  return (
    <div style={{ textAlign: "center", marginBottom: 18 }}>
      <h3 style={{ color: "#fff" }}>Speed Typing Test</h3>
      <p style={{ color: "#ffb86b", fontWeight: "bold", fontSize: 15, marginBottom: 8 }}>
        Please type the text exactly as shown below.
      </p>
      <p style={{ color: "#eebbc3", fontSize: 16 }}>{TEST_TEXT}</p>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        disabled={finished}
        style={{
          width: "90%",
          padding: "10px",
          fontSize: 18,
          borderRadius: 8,
          border: "2px solid #16ff99",
          marginTop: 12,
          fontFamily: "inherit"
        }}
        placeholder="Type here..."
      />
      {finished && startTime && endTime && (
        <>
          {window.alert(`Finished! Your score: ${Math.round(TEST_TEXT.split(" ").length / ((endTime - startTime) / 60000))} WPM`)}
          <div style={{ color: "#fff", marginTop: 16, fontSize: 18, fontWeight: "bold" }}>
            🏆 Words per minute: {Math.round(TEST_TEXT.split(" ").length / ((endTime - startTime) / 60000))}
          </div>
        </>
      )}
    </div>
  );
};

export default SpeedTypingTest;
