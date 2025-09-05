import React, { useEffect, useState, useRef } from "react";
import { Client, Room } from "colyseus.js";
import { RoomType } from "../../../types/Rooms";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";


interface TicTacToeGameProps {
  onGameOver: (score: number) => void;
}

interface ServerState {
  board: (string | null)[];
  turn: string;
  winner: string | null;
  players: string[];
}

const initialBoard = Array(9).fill(null);

// Client-side winner check for fallback
function calculateWinner(board: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ onGameOver }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [board, setBoard] = useState<(string | null)[]>(initialBoard);
  const [turn, setTurn] = useState<string>("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [mySymbol, setMySymbol] = useState<string>("");
  const [isDraw, setIsDraw] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const joinedRef = useRef(false);

  useEffect(() => {
    let active = true;
    const client = new Client("ws://localhost:2567");
    client.joinOrCreate(RoomType.TICTACTOE).then((joinedRoom) => {
      if (!active) return;
      setRoom(joinedRoom);
      joinedRef.current = true;

      // Listen for state changes
      joinedRoom.onStateChange((state: any) => {
        setBoard([...state.board]);
        setTurn(state.turn);
        setWinner(state.winner);
        setPlayers([...state.players]);
        setIsDraw(state.board.every((cell: any) => cell) && !state.winner);
        setLoading(false);
      });

      // Assign symbol
      joinedRoom.onMessage("player_symbol", (symbol: string) => {
        setMySymbol(symbol);
      });
    });
    return () => {
      active = false;
      if (joinedRef.current && room) room.leave();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if ((winner || isDraw) && mySymbol) {
      // Score: 1 for win, 0 for draw, -1 for loss
      let score = 0;
      if (winner === mySymbol) score = 1;
      else if (isDraw) score = 0;
      else if (winner && winner !== mySymbol) score = -1;
      onGameOver(score);
      // Submit score to Firebase
      if (user) {
        setDoc(doc(db, "tictactoe_scores", user.uid), {
          score,
          date: new Date().toISOString(),
        }, { merge: true });
      }
    }
  }, [winner, isDraw, mySymbol, onGameOver, user]);

  function handleClick(idx: number) {
    if (!room || board[idx] || winner || mySymbol !== turn) return;
    room.send("move", { idx });
  }

  if (loading) {
    return <div style={{ color: "#fff", textAlign: "center" }}>Joining room...</div>;
  }

  return (
    <div style={{
      width: 240,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(3, 80px)",
      gridGap: 4,
      background: "#121629",
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
    }}>
      {board.map((cell, idx) => (
        <button
          key={idx}
          onClick={() => handleClick(idx)}
          style={{
            width: 80,
            height: 80,
            fontSize: 32,
            background: cell ? "#eebbc3" : "#232946",
            color: cell ? "#232946" : "#16ff99",
            border: "2px solid #16ff99",
            borderRadius: 8,
            fontFamily: "inherit",
            cursor: cell || winner || mySymbol !== turn ? "default" : "pointer"
          }}
        >
          {cell}
        </button>
      ))}
      <div style={{ gridColumn: "span 3", textAlign: "center", color: "#fff", marginTop: 8 }}>
        {winner ? `Winner: ${winner}` : isDraw ? "Draw!" : `Next: ${turn}`}
        <br />
        {mySymbol ? `You are: ${mySymbol}` : "Waiting for assignment..."}
      </div>
    </div>
  );
};

export default TicTacToeGame;
