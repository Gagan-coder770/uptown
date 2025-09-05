import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const AuthDialog: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "rgba(20, 24, 38, 0.85)",
      }}>
        <div style={{
          background: "#232946",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          padding: 32,
          minWidth: 320,
          color: "#fff",
          textAlign: "center",
          fontFamily: "'Press Start 2P', 'VT323', 'monospace', sans-serif"
        }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Welcome, {user.email}!</p>
          <button onClick={handleSignOut} style={{
            background: "#16ff99",
            color: "#232946",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: "bold",
            fontFamily: "inherit",
            cursor: "pointer"
          }}>Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "rgba(20, 24, 38, 0.85)",
    }}>
      <div style={{
        background: "#232946",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        padding: 32,
        minWidth: 320,
        color: "#fff",
        textAlign: "center",
        fontFamily: "'Press Start 2P', 'VT323', 'monospace', sans-serif"
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 24 }}>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "10px 8px",
              borderRadius: 8,
              border: "1px solid #121629",
              background: "#121629",
              color: "#fff",
              fontFamily: "inherit"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "10px 8px",
              borderRadius: 8,
              border: "1px solid #121629",
              background: "#121629",
              color: "#fff",
              fontFamily: "inherit"
            }}
          />
          <button type="submit" style={{
            width: "100%",
            background: "#16ff99",
            color: "#232946",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: "bold",
            fontFamily: "inherit",
            cursor: "pointer",
            marginBottom: 8
          }}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={{
          width: "100%",
          background: "#eebbc3",
          color: "#232946",
          border: "none",
          borderRadius: 8,
          padding: "10px 0",
          fontWeight: "bold",
          fontFamily: "inherit",
          cursor: "pointer",
          marginBottom: 8
        }}>
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
        </button>
        {error && <p style={{ color: "#ff4f4f", marginTop: 8 }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthDialog;