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
import { increment } from "firebase/firestore";

const BetNowModal = ({ isOpen, onClose, team1, team2, gameId, maxBetAmount }) => {
  const [betAmount, setBetAmount] = useState(60);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState(2);
  const [betWarning, setBetWarning] = useState("");
  const [team1Odds, setTeam1Odds] = useState(1.0);
  const multipliers = [2];
  const [team2Odds, setTeam2Odds] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setWalletBalance(data.walletBalance || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const calculateOdds = (betsTeam1, betsTeam2) => {
    if (betsTeam1 === 0 && betsTeam2 === 0) {
      return { team1Odds: 2.0, team2Odds: 2.0 }; // Start at 2.0x if no bets
    }

    const minOdds = 1.2;
    const maxOdds = 2.0;

    const totalBets = betsTeam1 + betsTeam2;

    const team1Ratio = betsTeam1 / totalBets;
    const team2Ratio = betsTeam2 / totalBets;

    const team1Odds = Math.max(
      minOdds,
      Math.min(maxOdds, (1 / team1Ratio).toFixed(2))
    );
    const team2Odds = Math.max(
      minOdds,
      Math.min(maxOdds, (1 / team2Ratio).toFixed(2))
    );

    return { team1Odds, team2Odds };
  };

  useEffect(() => {
    const gameRef = doc(db, "games", gameId);

    // Real-time listener
    const unsubscribe = onSnapshot(gameRef, (gameSnapshot) => {
      if (gameSnapshot.exists()) {
        const data = gameSnapshot.data();
        const totalBetsTeam1 = data.totalBetsTeam1 || 0;
        const totalBetsTeam2 = data.totalBetsTeam2 || 0;

        const { team1Odds, team2Odds } = calculateOdds(totalBetsTeam1, totalBetsTeam2);

        setTeam1Odds(team1Odds);
        setTeam2Odds(team2Odds);
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [gameId]);


  const handleBet = async () => {
    if (!selectedTeam) {
      alert("कृपया दांव लगाने के लिए एक टीम चुनें!");
      return;
    }

    if (betAmount < 60) {
      alert("न्यूनतम रायसिक्के💵60 है!");
      return;
    }

    if (betAmount > maxBetAmount) {
      alert(`अधिकतम अनुमत रायसिक्के 💵${maxBetAmount} है!`);
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
        alert("You have already placed a Prediction on this game!");
        setIsLoading(false);
        return;
      }

      const newWalletBalance = Number(walletBalance) - Number(betAmount);
      setWalletBalance(newWalletBalance);

      const odds = selectedTeam === team1 ? team1Odds : team2Odds;
      const boundedOdds = Math.max(1.2, Math.min(2, parseFloat(odds))); // Ensure odds stay between 1.2x and 2x

      const betRef = doc(betsCollectionRef, gameId);
      await setDoc(betRef, {
        betAmount: Number(betAmount),
        gameId,
        selectedTeam,
        matchName: `${team1} vs ${team2}`,
        status: "pending",
        winnings: 0,
        odds: boundedOdds,
        createdAt: serverTimestamp(),
      });

      await updateDoc(userRef, { walletBalance: newWalletBalance });

      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        [`totalBets${selectedTeam === team1 ? "Team1" : "Team2"}`]:
          increment(betAmount),
      });

      navigate("/bets");
      onClose();
    } catch (error) {
      console.error("Error placing Prediction:", error);
      alert("Error placing Prediction: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBetAmountChange = e => {
    const value = Number(e.target.value);
    if (value < 60) {
      setBetWarning("न्यूनतम रायसिक्के💵60 है!");
    }

    else if (value > maxBetAmount) {
      setBetWarning(`अधिकतम अनुमत रायसिक्के 💵${maxBetAmount} है!`);
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
            <p>Placing your Prediction...</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Place Your Choice</h2>
            </div>

            <p className="wallet-text">💰 कॉइन बैलेंस: 💵{walletBalance.toFixed(2)}</p>
            <div className="bet-section">
              <label className="bet-label">Choice Coins (💵)</label>
              <input
                type="number"
                value={betAmount}
                min="60"
                onChange={handleBetAmountChange}
                max={maxBetAmount}
                className="bet-input"
              />
              {betWarning && (
                <p style={{ color: "red", fontSize: "14", margin: "5px" }}>
                  {betWarning}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "22px",
                padding: "0 5px",
              }}
            >
              {/* ⭐ TEAM 1 CARD */}
              <div
                onClick={() => setSelectedTeam(team1)}
                style={{
                  flex: 1,
                  padding: "18px 10px",
                  borderRadius: "18px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "0.25s",
                  background: selectedTeam === team1
                    ? "linear-gradient(135deg, #00ff95, #00cc6f)"
                    : "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: selectedTeam === team1
                    ? "2px solid #00ff95"
                    : "1px solid rgba(255,255,255,0.25)",
                  boxShadow: selectedTeam === team1
                    ? "0 0 15px rgba(0,255,149,0.7)"
                    : "0 3px 10px rgba(0,0,0,0.15)",
                  transform: selectedTeam === team1 ? "scale(1.03)" : "scale(1)",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: selectedTeam === team1 ? "#003b1f" : "#f1f1f1",
                  }}
                >
                  {team1}
                </div>

                {/* Odds with Shine Effect */}
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "28px",
                    fontWeight: "900",
                    color: selectedTeam === team1 ? "#003b1f" : "#00ffea",
                    textShadow:
                      selectedTeam === team1
                        ? "0 0 12px rgba(255,255,255,0.9)"
                        : "0 0 12px rgba(0,255,234,0.8)",
                    background: selectedTeam === team1
                      ? "none"
                      : "linear-gradient(135deg, #00ffe0, #00b3ff)",
                    WebkitBackgroundClip: selectedTeam === team1 ? "none" : "text",
                    WebkitTextFillColor: selectedTeam === team1 ? "#003b1f" : "transparent",
                  }}
                >
                  {team1Odds}x
                </div>

              </div>

              {/* ⭐ TEAM 2 CARD */}
              <div
                onClick={() => setSelectedTeam(team2)}
                style={{
                  flex: 1,
                  padding: "18px 10px",
                  borderRadius: "18px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "0.25s",
                  background: selectedTeam === team2
                    ? "linear-gradient(135deg, #ff7c7c, #ff4141)"
                    : "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: selectedTeam === team2
                    ? "2px solid #ff4d4d"
                    : "1px solid rgba(255,255,255,0.25)",
                  boxShadow: selectedTeam === team2
                    ? "0 0 15px rgba(255,77,77,0.6)"
                    : "0 3px 10px rgba(0,0,0,0.15)",
                  transform: selectedTeam === team2 ? "scale(1.03)" : "scale(1)",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: selectedTeam === team2 ? "#4a0000" : "#f1f1f1",
                  }}
                >
                  {team2}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "28px",
                    fontWeight: "900",
                    color: selectedTeam === team2 ? "#4a0000" : "#ff7aff",
                    textShadow:
                      selectedTeam === team2
                        ? "0 0 12px rgba(255,255,255,0.9)"
                        : "0 0 12px rgba(255,122,255,0.8)",
                    background: selectedTeam === team2
                      ? "none"
                      : "linear-gradient(135deg, #ff9dff, #ff4d79)",
                    WebkitBackgroundClip: selectedTeam === team2 ? "none" : "text",
                    WebkitTextFillColor: selectedTeam === team2 ? "#4a0000" : "transparent",
                  }}
                >
                  {team2Odds}x
                </div>

              </div>
            </div>



            <button className="bet-now-btn" onClick={handleBet}>
              Play Now
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
