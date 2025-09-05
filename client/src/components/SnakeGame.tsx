import React, { useRef, useEffect, useState } from "react";

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };

function getRandomFood() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const moveRef = useRef(direction);

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (moveRef.current.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (moveRef.current.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (moveRef.current.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (moveRef.current.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };
        // Check collision
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE ||
          prev.some(seg => seg.x === head.x && seg.y === head.y)
        ) {
          setGameOver(true);
          setTimeout(() => onGameOver(score), 5000); // Show score for 5 seconds
          return prev;
        }
        let newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(getRandomFood());
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [direction, food, score, onGameOver, gameOver]);

  return (
    <div style={{
      width: 400,
      height: 400,
      background: "#121629",
      borderRadius: 12,
      margin: "0 auto",
      position: "relative",
      boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 8, left: 8, color: "#16ff99", fontWeight: "bold" }}>
        Score: {score}
      </div>
      {Array.from({ length: GRID_SIZE }).map((_, y) =>
        Array.from({ length: GRID_SIZE }).map((_, x) => {
          const isSnake = snake.some(seg => seg.x === x && seg.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={x + "," + y}
              style={{
                position: "absolute",
                left: x * 20,
                top: y * 20,
                width: 20,
                height: 20,
                background: isHead ? "#16ff99" : isSnake ? "#eebbc3" : isFood ? "#ff4f4f" : "transparent",
                borderRadius: isHead || isFood ? "50%" : "6px",
                border: isSnake ? "1px solid #232946" : "none"
              }}
            />
          );
        })
      )}
      {gameOver && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(35,41,70,0.95)",
          color: "#fff",
          padding: 24,
          borderRadius: 12,
          textAlign: "center"
        }}>
          <h3>Game Over!</h3>
          <p>Your score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
