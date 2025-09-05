import React, { useState } from "react";
function getRandomName() {
  const names = [
    "CoolCat42", "PixelHero", "Speedster", "MemoryMaster", "SnakeChamp", "TypeWizard", "GameGuru", "JoyfulJelly", "NinjaFox", "StarCoder",
    "BlazeFalcon", "QuantumQuokka", "PixelPirate", "TurboTiger", "MysticMole", "RocketRaccoon", "CyberCobra", "AstroApe", "NeonNarwhal", "VortexViper",
    "EchoEagle", "ShadowShark", "FrostFox", "SolarSwan", "ThunderToad", "LunarLynx", "NovaNinja", "ZenZebra", "HyperHawk", "CosmoCrab",
    "GigaGoose", "StealthSeal", "RoboRabbit", "PlasmaPanda", "TurboTurtle", "PixelPenguin", "BlitzBat", "OrbitOtter", "FlashFerret", "CometCat",
    "SparkSpider", "JoltJaguar", "GlitchGiraffe", "ByteBuffalo", "DashDog", "PulseParrot", "WiredWolf", "CircuitCheetah", "LogicLemur", "DataDuck"
  ];
  return names[Math.floor(Math.random() * names.length)];
}
import { useLobbyInfo } from "../hooks";
import { auth, db } from "../firebase";
import { signInAnonymously } from "firebase/auth";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import SnakeGame from "./SnakeGame";
import MemoryGame from "./MemoryGame";
import SpeedTypingTest from "./SpeedTypingTest";
import LeaderboardModal from "./LeaderboardModal";

interface GameSnackDialogProps {
  onClose: () => void;
  onScoreSubmit: (score: number) => void;
}

const GameSnackDialog: React.FC<GameSnackDialogProps> = ({ onClose, onScoreSubmit }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [snack, setSnack] = useState<string>("");
  const [user, setUser] = useState(() => auth.currentUser);

  // Automatically sign in anonymously if not authenticated
  React.useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).then(() => {
        setUser(auth.currentUser);
      });
    } else {
      setUser(auth.currentUser);
    }
  }, []);
  // Assign a random name for this session
  const [playerName] = useState(getRandomName());
  const { roomType, lobbyName } = useLobbyInfo();

  // Store scores in Firebase for all games
  async function handleScoreSubmit(game: string, score: number) {
    setScore(score);
    onScoreSubmit(score);
    if (user && score > 0) {
      let collection = "";
      if (game === "Snake") collection = "snake_scores";
      else if (game === "Memory") collection = "memory_scores";
      else if (game === "Speed Typing Test") collection = "typingtest_scores";
      // Always use the session's random name
      const chosenName = playerName;
      if (collection) {
        await setDoc(doc(db, collection, user.uid), {
          score,
          date: new Date().toISOString(),
          name: user.displayName || user.email || user.uid,
          playerName: chosenName,
          lobbyType: roomType,
          lobbyName,
        }, { merge: true });
      }
    }
  }

  function handleLogout() {
    signOut(auth);
    onClose();
  }
  // Example games list
  const games = ["Speed Typing Test", "Memory", "Snake"];
  const randomNames = [
    "CoolCat42", "PixelHero", "Speedster", "MemoryMaster", "SnakeChamp", "TypeWizard", "GameGuru", "JoyfulJelly", "NinjaFox", "StarCoder"
  ];
  const snacks = ["Chips", "Soda", "Candy Bar", "Sandwich"];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
  width: "100vw",
      background: "rgba(20, 24, 38, 0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
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
        {/* Logout button, top-right, minimal UI impact */}
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#eebbc3",
            color: "#232946",
            border: "none",
            borderRadius: 8,
            padding: "6px 14px",
            fontWeight: "bold",
            fontFamily: "inherit",
            cursor: "pointer",
            fontSize: 13
          }}
          onClick={handleLogout}
        >Logout</button>
        <h2 style={{ fontSize: 22, marginBottom: 18 }}>Games & Snacks</h2>
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 16 }}>Choose a Game:</h3>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            {games.map(game => (
              <button
                key={game}
                style={{
                  margin: "6px",
                  background: selectedGame === game ? "#16ff99" : "#eebbc3",
                  color: "#232946",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: "bold",
                  fontFamily: "inherit",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedGame(game)}
              >
                {game}
              </button>
            ))}
            {/* Trophy Scores button */}
            {selectedGame && (
              <button
                style={{
                  background: "#eebbc3",
                  color: "#232946",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: "bold",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={() => setShowLeaderboard(true)}
                title="View Scores"
              >
                <span role="img" aria-label="trophy">🏆</span> Scores
              </button>
            )}
          </div>
        </div>
        {selectedGame === "Snake" && (
          <div style={{ marginBottom: 18 }}>
            <SnakeGame onGameOver={score => handleScoreSubmit("Snake", score)} />
          </div>
        )}
        {selectedGame === "Speed Typing Test" && (
          <div style={{ marginBottom: 18 }}>
            <SpeedTypingTest onGameOver={score => handleScoreSubmit("Speed Typing Test", score)} />
          </div>
        )}
        {selectedGame === "Memory" && (
          <div style={{ marginBottom: 18 }}>
            <MemoryGame onGameOver={score => handleScoreSubmit("Memory", score)} />
          </div>
        )}
  {/* Name Prompt Modal removed for random name assignment */}
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 16 }}>Order from:</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              style={{
                background: "#eebbc3",
                color: "#232946",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontWeight: "bold",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
              onClick={() => window.open('https://www.swiggy.com/', '_blank')}
            >Swiggy</button>
            <button
              style={{
                background: "#eebbc3",
                color: "#232946",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontWeight: "bold",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
              onClick={() => window.open('https://www.zomato.com/', '_blank')}
            >Zomato</button>
            <button
              style={{
                background: "#eebbc3",
                color: "#232946",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontWeight: "bold",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
              onClick={() => window.open('https://www.zepto.com/', '_blank')}
            >Zepto</button>
            <button
              style={{
                background: "#eebbc3",
                color: "#232946",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontWeight: "bold",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
              onClick={() => window.open('https://blinkit.com/', '_blank')}
            >Blinkit</button>
          </div>
        </div>
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
        >
          Close
        </button>
      {/* Leaderboard Modal */}
      {showLeaderboard && selectedGame && (
        <LeaderboardModal game={selectedGame} onClose={() => setShowLeaderboard(false)} />
      )}
      </div>
    </div>
  );
};

export default GameSnackDialog;
