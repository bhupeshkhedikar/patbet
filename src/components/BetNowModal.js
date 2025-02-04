import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const BetNowModal = ({ isOpen, onClose, team1, team2, gameId }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedMultiplier, setSelectedMultiplier] = useState(2);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const multipliers = [2, 3, 4, 5];
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setWalletBalance(data.walletBalance || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleBet = async () => {
    if (!selectedTeam) {
      alert("Please select a team to bet on!");
      return;
    }

    if (betAmount > walletBalance) {
      alert("Insufficient balance!");
      return;
    }

    setIsLoading(true); // Show the loader

    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users", userId);
      const betsCollectionRef = collection(userRef, "bets");

      const betsSnapshot = await getDoc(doc(betsCollectionRef, gameId));
      if (betsSnapshot.exists()) {
        alert("You have already placed a bet on this game!");
        setIsLoading(false);
        return;
      }

      const newWalletBalance = Number(walletBalance) - Number(betAmount);
      setWalletBalance(newWalletBalance);

      const betRef = doc(betsCollectionRef, gameId);
      await setDoc(betRef, {
        betAmount: Number(betAmount),
        gameId,
        selectedTeam,
        status: "pending",
        winnings: 0,
        selectedMultiplier: Number(selectedMultiplier),
      });

      await updateDoc(userRef, { walletBalance: newWalletBalance });

      navigate("/bets");
      onClose();
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Error placing bet: " + error.message);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Placing your bet...</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Place Your Bet</h2>
            </div>

            <p className="wallet-text">Wallet Balance: ₹{walletBalance}</p>

            <div className="bet-section">
              <label className="bet-label">Bet Amount (₹)</label>
              <input
                type="number"
                value={betAmount}
                min="10"
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bet-input"
              />
            </div>

            <div className="team-selection">
              <button
                className={`team-btn ${selectedTeam === team1 ? "selected" : ""}`}
                onClick={() => setSelectedTeam(team1)}
              >
                {team1}
              </button>
              <button
                className={`team-btn ${selectedTeam === team2 ? "selected" : ""}`}
                onClick={() => setSelectedTeam(team2)}
              >
                {team2}
              </button>
            </div>

            <div className="multiplier-section">
              {multipliers.map((multiplier) => (
                <button
                  key={multiplier}
                  className={`multiplier-btn ${
                    selectedMultiplier === multiplier ? "selected" : ""
                  }`}
                  onClick={() => setSelectedMultiplier(multiplier)}
                >
                  {multiplier}x
                </button>
              ))}
            </div>

            <button className="bet-now-btn" onClick={handleBet}>
              Bet Now
              </button>
              <button className="close-btn" onClick={onClose}>
               Close
              </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BetNowModal;
