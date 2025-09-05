import React, { useState, useEffect } from "react";

interface MemoryGameProps {
  onGameOver: (score: number) => void;
}

const icons = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍋"];
const shuffledIcons = [...icons, ...icons].sort(() => Math.random() - 0.5);

const MemoryGame: React.FC<MemoryGameProps> = ({ onGameOver }) => {
  const [cards, setCards] = useState(
    shuffledIcons.map((icon, idx) => ({ icon, id: idx, flipped: false, matched: false }))
  );
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (flippedIdxs.length === 2) {
      setMoves(m => m + 1);
      const [i1, i2] = flippedIdxs;
      if (cards[i1].icon === cards[i2].icon) {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === i1 || idx === i2 ? { ...card, matched: true } : card
          ));
          setScore(s => s + 1);
          setFlippedIdxs([]);
        }, 700);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === i1 || idx === i2 ? { ...card, flipped: false } : card
          ));
          setFlippedIdxs([]);
        }, 700);
      }
    }
  }, [flippedIdxs, cards]);

  useEffect(() => {
    if (cards.every(card => card.matched)) {
      onGameOver(score);
    }
  }, [cards, score, onGameOver]);

  function handleFlip(idx: number) {
    if (flippedIdxs.length < 2 && !cards[idx].flipped && !cards[idx].matched) {
      setCards(prev => prev.map((card, i) => i === idx ? { ...card, flipped: true } : card));
      setFlippedIdxs(prev => [...prev, idx]);
    }
  }

  return (
    <div style={{
      width: 320,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(4, 70px)",
      gridGap: 8,
      background: "#121629",
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
    }}>
      {cards.map((card, idx) => (
        <button
          key={card.id}
          onClick={() => handleFlip(idx)}
          style={{
            width: 70,
            height: 70,
            fontSize: 32,
            background: card.flipped || card.matched ? "#eebbc3" : "#232946",
            color: card.flipped || card.matched ? "#232946" : "#16ff99",
            border: "2px solid #16ff99",
            borderRadius: 8,
            fontFamily: "inherit",
            cursor: card.flipped || card.matched ? "default" : "pointer"
          }}
        >
          {card.flipped || card.matched ? card.icon : "?"}
        </button>
      ))}
      <div style={{ gridColumn: "span 4", textAlign: "center", color: "#fff", marginTop: 8 }}>
        Score: {score} | Moves: {moves}
      </div>
    </div>
  );
};

export default MemoryGame;
