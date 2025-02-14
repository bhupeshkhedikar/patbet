import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "../../src/BetStatusListener.css";
import useGameWinnerListener from "./useGameWinnerListener";

const BetStatusListener = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    const storedUID = localStorage.getItem("userUID");
    const userId = user ? user.uid : storedUID;
  
    if (!userId) {
      setLoading(false);
      return;
    }
  
    const betsRef = collection(db, "users", userId, "bets");
  
    const unsubscribe = onSnapshot(
      betsRef,
      (snapshot) => {
        const updatedBets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // 🔹 createdAt के आधार पर बेट्स को सॉर्ट करें (नए बेट सबसे ऊपर)
        updatedBets.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  
        setBets(updatedBets);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bets:", error);
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, []);
  

  return (
    <div className="bet-status-container">
      <h3 className="bet-title">Your Bets</h3>
      {loading ? (
        <p className="loading">Loading bets...</p>
      ) : bets.length === 0 ? (
        <p className="no-bets">No bets placed yet.</p>
      ) : (
        <div className="bets-list">
          {bets.map((bet) => (
            <div key={bet.id} className={`bet-card ${bet.status}`}>
              <div className="bet-header">
                <span className={`bet-status ${bet.status}`}>
                  {bet.status} {bet.status === "returned" ? "(One Sided Game)" : ""}
                </span>
              </div>
              <div className="bet-body">
                <div className="bet-info">
                  <span className="label">Selected Team:</span>
                  <span className="value"  style={{ color: "#1e90ff",fontSize:'14px' }}>{bet.selectedTeam}</span>
                </div>
                <div className="bet-info">
                  <span className="label">Bet Amount:</span>
                  <span className="value" style={{ color: "#ffcc00" }}>₹{bet.betAmount || 0}</span>
                </div>
                <div className="bet-info">
                  <span className="label">Multiplier:</span>
                  <span className="value" style={{ color: "#00bcd4" }}>{bet.selectedMultiplier}x</span>
                </div>
                <div className="bet-info">
                  <span className="label">Winnings:</span>
                  <span className="value" style={{ color: bet.status === "lost" ? "#f44336" : bet.status === "pending" ? "#ffa500" : "#4caf50", fontSize:'15px' }}>₹{bet.winnings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BetStatusListener;
