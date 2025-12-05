// AdminPanel.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";
/*
  ADMIN FEATURES:
  - Reads live data from game/current
  - Auto-cycle game viewer (Betting → Race → Result → Betting…)
  - Shows live countdown
  - Shows live bets for current match only
  - Summary (fixed)
  - Manual winner override (only during betting)
*/
const AdminPanell = () => {
  const [matchData, setMatchData] = useState(null);
  const [bets, setBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef(null);
  /* ----------------------------------------
     SUBSCRIBE: Live game/current doc
  ---------------------------------------- */
  useEffect(() => {
    const ref = doc(db, "game", "current");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMatchData(data);
        // countdown (initial calc)
        if (data.bettingEndAt && data.status === "betting") {
          const millis =
            data.bettingEndAt.toMillis?.() || data.bettingEndAt;
          const secsLeft = Math.max(
            0,
            Math.floor((millis - Date.now()) / 1000)
          );
          setCountdown(secsLeft);
        } else {
          setCountdown(0);
        }
      } else {
        setMatchData(null);
        setCountdown(0);
      }
    });
    return () => unsub();
  }, []);
  /* ----------------------------------------
     LIVE COUNTDOWN TICKER (client-side)
  ---------------------------------------- */
  useEffect(() => {
    if (!matchData?.bettingEndAt || matchData.status !== "betting") {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }
    // Start ticking down every second
    countdownIntervalRef.current = setInterval(() => {
      const millis = matchData.bettingEndAt.toMillis?.() || matchData.bettingEndAt;
      const secsLeft = Math.max(0, Math.floor((millis - Date.now()) / 1000));
      setCountdown(secsLeft);
      if (secsLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [matchData?.bettingEndAt, matchData?.status]);
  /* ----------------------------------------
     SUBSCRIBE: Live bets for current matchId
     FIXED: Depend only on matchId to avoid re-sub on other matchData changes
     HOTFIX: Removed orderBy to avoid needing composite index; bets will not be sorted by time
  ---------------------------------------- */
  useEffect(() => {
    const currentMatchId = matchData?.matchId;
    if (!currentMatchId) {
      setBets([]);
      setLoadingBets(false);
      return;
    }
    setLoadingBets(true);
    const q = query(
      collection(db, "bets"),
      where("matchId", "==", currentMatchId)
      // orderBy("createdAt", "desc") // Commented out to avoid index requirement
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setBets(arr);
      setLoadingBets(false);
    }, (error) => {
      console.error("Bets snapshot error:", error);
      setLoadingBets(false);
    });
    return () => unsub();
  }, [matchData?.matchId]); // Key fix: depend on matchId only
  /* ----------------------------------------
     MANUAL WINNER OVERRIDE
  ---------------------------------------- */
  const setWinnerManually = async (cartId) => {
    if (!matchData) return;
    if (matchData.status !== "betting") {
      alert("❌ Betting window is closed. Cannot set winner now.");
      return;
    }
    try {
      await updateDoc(doc(db, "game", "current"), {
        manualWinner: cartId,
      });
      alert("✔ Manual winner set: Cart " + cartId);
    } catch (err) {
      console.error(err);
      alert("Error setting winner");
    }
  };
  /* ----------------------------------------
     SUMMARY (FIXED)
  ---------------------------------------- */
  const stats = (() => {
    const s = {
      1: { count: 0, amount: 0 },
      2: { count: 0, amount: 0 },
    };
    bets.forEach((b) => {
      const cart = Number(b.cartId); // force to number
      if (cart === 1 || cart === 2) {
        s[cart].count += 1;
        s[cart].amount += Number(b.amount || 0);
      }
    });
    return s;
  })();
  /* ----------------------------------------
     TIME FORMAT
  ---------------------------------------- */
  const formatTime = (s) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };
  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>⚙️ PatBet Admin Panel</h2>
      {/* MATCH INFO */}
      <div style={styles.card}>
        <h3 style={styles.title}>🎮 Live Match Info</h3>
        {matchData ? (
          <>
            <div style={styles.infoRow}>
              <span>Match ID:</span>
              <strong>{matchData.matchId}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>Status:</span>
              <strong style={{ color: "#00ffaa" }}>
                {matchData.status?.toUpperCase()}
              </strong>
            </div>
            <div style={styles.infoRow}>
              <span>Last Winner:</span>
              <strong>{matchData.lastWinner || "-"}</strong>
            </div>
            {matchData.status === "betting" ? (
              <div style={styles.countdownBox}>
                Betting ends in:{" "}
                <span style={{ color: "#FFD700" }}>
                  {formatTime(countdown)}
                </span>
              </div>
            ) : (
              <div style={{ color: "#999" }}>Betting Closed</div>
            )}
          </>
        ) : (
          <p style={{ color: "#ccc" }}>Waiting for match…</p>
        )}
      </div>
      {/* MANUAL WINNER PICK */}
      <div style={styles.card}>
        <h3 style={styles.title}>🏆 Manual Winner Override</h3>
        <p style={{ color: "#aaa" }}>Allowed only during betting</p>
        <div style={styles.btnRow}>
          <button
            style={styles.greenBtn}
            onClick={() => setWinnerManually(1)}
          >
            Set Winner: Cart 1
          </button>
          <button
            style={styles.greenBtn}
            onClick={() => setWinnerManually(2)}
          >
            Set Winner: Cart 2
          </button>
        </div>
      </div>
      {/* SUMMARY (Current Match) */}
      <div style={styles.card}>
        <h3 style={styles.title}>📊 Summary (Current Match)</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryBox}>
            <span style={styles.summaryLabel}>Cart 1</span>
            <span>Bets: {stats[1].count}</span>
            <span>💵{stats[1].amount}</span>
          </div>
          <div style={styles.summaryBox}>
            <span style={styles.summaryLabel}>Cart 2</span>
            <span>Bets: {stats[2].count}</span>
            <span>💵{stats[2].amount}</span>
          </div>
        </div>
      </div>
      {/* LIVE BETS */}
      <div style={styles.card}>
        <h3 style={styles.title}>📜 All Bets</h3>
        <div style={styles.betList}>
          {loadingBets ? (
            <p style={{ color: "#aaa" }}>Loading…</p>
          ) : bets.length === 0 ? (
            <p style={{ color: "#aaa" }}>No bets yet.</p>
          ) : (
            bets.map((b) => (
              <div key={b.id} style={styles.betItem}>
                <div style={styles.betUser}>
                  {b.userEmail || b.userId}
                </div>
                <div style={styles.betDetail}>Cart: {b.cartId}</div>
                <div style={styles.betAmount}>💵{b.amount}</div>
                <div style={styles.betTime}>
                  {b.createdAt?.toDate
                    ? b.createdAt.toDate().toLocaleTimeString()
                    : "-"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
/* ----------------------------------------
   STYLES — PatBet Dark Theme
---------------------------------------- */
const styles = {
  container: {
    background: "#0D0D0D",
    color: "white",
    minHeight: "100vh",
    marginBottom:'100px',
    padding: 15,
  },
  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 15,
    color: "#00ffaa",
  },
  card: {
    background: "#151515",
    border: "1px solid #222",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    color: "#FFD700",
    marginBottom: 10,
    fontWeight: 600,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    color: "#ccc",
  },
  countdownBox: {
    marginTop: 10,
    padding: 8,
    background: "#111",
    borderRadius: 8,
    textAlign: "center",
    fontWeight: 700,
  },
  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },
  greenBtn: {
    flex: 1,
    padding: "10px",
    background: "green",
    color: "white",
    borderRadius: 8,
    border: "none",
    fontWeight: 700,
  },
  /* SUMMARY */
  summaryGrid: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  summaryBox: {
    flex: 1,
    background: "#111",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #222",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  summaryLabel: {
    color: "#00ffcc",
    fontWeight: 600,
  },
  /* BETS */
  betList: {
    maxHeight: 320,
    overflowY: "auto",
  },
  betItem: {
    padding: 12,
    background: "#111",
    borderBottom: "1px solid #222",
  },
  betUser: {
    fontWeight: 600,
    color: "#00ffaa",
  },
  betDetail: {
    color: "#ccc",
  },
  betAmount: {
    color: "#FFD700",
    fontWeight: 700,
  },
  betTime: {
    color: "#777",
    fontSize: 12,
  },
};
export default AdminPanell;