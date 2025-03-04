import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { db, auth } from "../firebase";
import { serverTimestamp } from "firebase/firestore";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const BetNowModal = ({ isOpen, onClose, team1, team2, gameId, maxBetAmount}) => {
  const [betAmount, setBetAmount] = useState(60);
  const [selectedMultiplier, setSelectedMultiplier] = useState(2);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [betWarning, setBetWarning] = useState("");
  const navigate = useNavigate();
  const multipliers = [2];
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
      alert("कृपया दांव लगाने के लिए एक टीम चुनें!");
      return;
    }

    if (betAmount < 60) {
      alert("न्यूनतम शर्त राशि ₹60 है!");
      return;
    }
  
    if (betAmount > maxBetAmount) {
      alert(`अधिकतम अनुमत शर्त राशि  ₹${maxBetAmount} है!`);
      return;
    }

    if (betAmount > walletBalance) {
      alert("आपके वॉलेट में पर्याप्त बैलेंस नहीं है!");
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
        matchName: `${team1} vs ${team2}`, 
        status: "pending",
        winnings: 0,
        selectedMultiplier: Number(selectedMultiplier),
        createdAt: serverTimestamp(),
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

  const handleBetAmountChange = (e) => {
    const value = Number(e.target.value);
    if (value < 60) {
      setBetWarning("न्यूनतम शर्त राशि ₹60 है!");
    }

    else if (value > maxBetAmount) {
      setBetWarning(`अधिकतम अनुमत शर्त राशि  ₹${maxBetAmount} है!`);
    }
      
    else {
      setBetWarning("");
    }
    setBetAmount(value);
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
            {/* <p  className="wallet-text">Max Bet: ₹{maxBetAmount}</p> */}
            <div className="bet-section">
              <label className="bet-label">Bet Amount (₹)</label>
              <input
                type="number"
                value={betAmount}
                min="60"
                  onChange={handleBetAmountChange}
                  max={maxBetAmount}
                className="bet-input"
              />
              {betWarning && <p style={{color:"red",fontSize:'14', margin:'5px'}}>{betWarning}</p>}
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
              Bet Now (बेट लगाये)
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
