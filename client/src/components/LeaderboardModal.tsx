import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

interface LeaderboardModalProps {
  game: string;
  onClose: () => void;
}

const GAME_COLLECTIONS: Record<string, string> = {
  "Speed Typing Test": "typingtest_scores",
  "Snake": "snake_scores",
  "Memory": "memory_scores",
};

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ game, onClose }) => {
  const [scores, setScores] = useState<{ user: string; score: number; date: string; name?: string; playerName?: string; lobbyType?: string; lobbyName?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      const collName = GAME_COLLECTIONS[game];
      if (!collName) return;
      const querySnapshot = await getDocs(collection(db, collName));
      const data: { user: string; score: number; date: string; name?: string; playerName?: string; lobbyType?: string; lobbyName?: string }[] = [];
      querySnapshot.forEach(docSnap => {
        const d = docSnap.data();
        data.push({
          user: docSnap.id,
          score: d.score,
          date: d.date,
          name: d.name,
          playerName: d.playerName,
          lobbyType: d.lobbyType,
          lobbyName: d.lobbyName,
        });
      });
      // Filter out scores of 0 and duplicate player names
      const filtered: typeof data = [];
      const seenNames = new Set<string>();
      for (const entry of data) {
        const name = entry.playerName || entry.name || entry.user;
        if (entry.score > 0 && !seenNames.has(name)) {
          filtered.push(entry);
          seenNames.add(name);
        }
      }
      filtered.sort((a, b) => b.score - a.score);
      setScores(filtered.slice(0, 10)); // Top 10
      setLoading(false);
    }
    fetchScores();
  }, [game]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(20, 24, 38, 0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000
    }}>
      <div style={{
        background: "#232946",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        padding: 32,
        minWidth: 340,
        color: "#fff",
        textAlign: "center",
        fontFamily: "'Press Start 2P', 'VT323', 'monospace', sans-serif",
        position: "relative"
      }}>
        <h2 style={{ fontSize: 22, marginBottom: 18 }}>🏆 {game} Leaderboard</h2>
        {loading ? (
          <div style={{ color: "#fff" }}>Loading...</div>
        ) : scores.length === 0 ? (
          <div style={{ color: "#fff" }}>No scores yet.</div>
        ) : (
          <table style={{ width: "100%", color: "#fff", marginBottom: 18 }}>
            <thead>
              <tr style={{ color: "#16ff99" }}>
                <th style={{ textAlign: "left" }}>Player</th>
                <th style={{ textAlign: "left" }}>Lobby</th>
                <th style={{ textAlign: "right" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={s.user} style={{ background: i === 0 ? "#eebbc3" : "inherit", color: i === 0 ? "#232946" : "#fff" }}>
                  <td style={{ textAlign: "left", fontWeight: i === 0 ? "bold" : "normal" }}>{
                    s.playerName && s.playerName.length > 0
                      ? s.playerName
                      : (s.name && s.name.length > 0
                          ? s.name
                          : (["CoolCat42", "PixelHero", "Speedster", "MemoryMaster", "SnakeChamp", "TypeWizard", "GameGuru", "JoyfulJelly", "NinjaFox", "StarCoder"][Math.floor(Math.random()*10)]))
                  }</td>
                  <td style={{ textAlign: "left" }}>{s.lobbyType === 'private' ? `Private: ${s.lobbyName}` : 'Public'}</td>
                  <td style={{ textAlign: "right", fontWeight: i === 0 ? "bold" : "normal" }}>{
                    typeof s.score === "number" && !isNaN(s.score) ? s.score : 0
                  }</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          style={{
            background: "#eebbc3",
            color: "#232946",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: "bold",
            fontFamily: "inherit",
            cursor: "pointer"
          }}
          onClick={onClose}
        >Close</button>
      </div>
    </div>
  );
};

export default LeaderboardModal;
