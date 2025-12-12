// AdminPanel.jsx
import React, { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

const AdminPanel = () => {
  const [currentMatch, setCurrentMatch] = useState(null);

  const [team1Bets, setTeam1Bets] = useState([]);
  const [team2Bets, setTeam2Bets] = useState([]);
  const [team1Total, setTeam1Total] = useState(0);
  const [team2Total, setTeam2Total] = useState(0);

  /* --------------------------------------------------
     LIVE MATCH LISTENER
  -------------------------------------------------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "game", "currentMatch"), (snap) => {
      if (snap.exists()) setCurrentMatch(snap.data());
    });

    return () => unsubscribe();
  }, []);

  /* --------------------------------------------------
     LIVE BETS LISTENER (fixes refresh issue)
  -------------------------------------------------- */
  useEffect(() => {
    const betsRef = collection(db, "game", "currentMatch", "bets");

    const unsubscribe = onSnapshot(betsRef, (snap) => {
      let t1 = [];
      let t2 = [];
      let total1 = 0;
      let total2 = 0;

      snap.forEach((d) => {
        const bet = { id: d.id, ...d.data() };

        if (bet.cartId === 1) {
          t1.push(bet);
          total1 += bet.amount || 0;
        } else if (bet.cartId === 2) {
          t2.push(bet);
          total2 += bet.amount || 0;
        }
      });

      setTeam1Bets(t1);
      setTeam2Bets(t2);
      setTeam1Total(total1);
      setTeam2Total(total2);
    });

    return () => unsubscribe();
  }, []);

  /* --------------------------------------------------
     START NEW MATCH
  -------------------------------------------------- */
  const startNewMatch = async () => {
    try {
      await runTransaction(db, async (tx) => {
        const now = Date.now();

        // delete old bets
        const betsSnap = await getDocs(collection(db, "game", "currentMatch", "bets"));
        betsSnap.forEach((d) => tx.delete(d.ref));

        const startsAt = now + 20000;
        const endsAt = startsAt + 25000;

        tx.set(doc(db, "game", "currentMatch"), {
          matchId: `m_${Math.floor(now / 1000)}`,
          createdAt: serverTimestamp(),
          bettingOpen: true,
          startsAt,
          endsAt,
          winner: null,
        });
      });

      alert("New match started!");
    } catch (e) {
      console.error(e);
      alert("Error starting new match");
    }
  };

  /* --------------------------------------------------
     CLOSE BETTING
  -------------------------------------------------- */
  const closeBetting = async () => {
    try {
      await updateDoc(doc(db, "game", "currentMatch"), { bettingOpen: false });
      alert("Betting Closed!");
    } catch (e) {
      alert("Error closing betting");
    }
  };

  /* --------------------------------------------------
     MANUAL WINNER SET
  -------------------------------------------------- */
  const setWinnerManual = async (team) => {
    if (!window.confirm(`Set Winner as Team ${team}?`)) return;

    try {
      await updateDoc(doc(db, "game", "currentMatch"), {
        winner: team,
        finishedAt: serverTimestamp(),
      });

      alert(`Winner set to Team ${team}`);
    } catch (e) {
      alert("Error setting winner");
    }
  };

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  if (!currentMatch)
    return <div style={{ color: "white", padding: 20 }}>Loading Match…</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Panel</h1>

      {/* Current Match */}
      <div style={styles.box}>
        <h2>Current Match</h2>
        <p>Match ID: {currentMatch.matchId}</p>
        <p>Betting: {currentMatch.bettingOpen ? "OPEN" : "CLOSED"}</p>
        <p>Winner: {currentMatch.winner ?? "Not decided"}</p>
      </div>

      {/* Bets */}
      <div style={styles.betsContainer}>
        <div style={styles.teamBox}>
          <h3 style={{ color: "gold" }}>Team 1</h3>
          <h2>Total ₹{team1Total}</h2>

          {team1Bets.length === 0 && <p>No bets yet</p>}

          {team1Bets.map((b) => (
            <div key={b.id} style={styles.betRow}>
              <span>{b.userId}</span>
              <span>₹{b.amount}</span>
            </div>
          ))}
        </div>

        <div style={styles.teamBox}>
          <h3 style={{ color: "cyan" }}>Team 2</h3>
          <h2>Total ₹{team2Total}</h2>

          {team2Bets.length === 0 && <p>No bets yet</p>}

          {team2Bets.map((b) => (
            <div key={b.id} style={styles.betRow}>
              <span>{b.userId}</span>
              <span>₹{b.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={styles.btnContainer}>
        <button style={styles.btnStart} onClick={startNewMatch}>Start New Match</button>
        <button style={styles.btnClose} onClick={closeBetting}>Close Betting</button>
        <button style={styles.btnWinner1} onClick={() => setWinnerManual(1)}>Set Winner → Team 1</button>
        <button style={styles.btnWinner2} onClick={() => setWinnerManual(2)}>Set Winner → Team 2</button>
      </div>
    </div>
  );
};

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = {
  container: { padding: 20, color: "white", textAlign: "center" },
  header: { fontSize: 28, marginBottom: 15 },
  box: { background: "#222", padding: 15, borderRadius: 10, marginBottom: 20 },
  betsContainer: { display: "flex", gap: 10, marginBottom: 20 },
  teamBox: { flex: 1, background: "#333", padding: 15, borderRadius: 10 },
  betRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    borderBottom: "1px solid #555",
  },
  btnContainer: { display: "flex", flexDirection: "column", gap: 10 },
  btnStart: { padding: 12, background: "blue", borderRadius: 8, color: "white" },
  btnClose: { padding: 12, background: "red", borderRadius: 8, color: "white" },
  btnWinner1: { padding: 12, background: "green", borderRadius: 8, color: "white" },
  btnWinner2: { padding: 12, background: "orange", borderRadius: 8, color: "white" },
};

export default AdminPanel;
