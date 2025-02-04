import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import '../../src/BetStatusListener.css';
import useGameWinnerListener from "./useGameWinnerListener";

const BetStatusListener = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  // useGameWinnerListener();
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
    <div className="bet-status-listener">
      <h3 style={{ textAlign: 'center',margin:'10px'}}>Your Bets</h3>
      {loading ? (
        <p>Loading bets...</p>
      ) : bets.length === 0 ? (
        <p className="no-bets" style={{ textAlign: 'center'}}>No bets placed yet.</p>
      ) : (
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                    {/* <th>Match</th> */}
                    <th>Status</th>
                <th>Selected Team</th>
                <th>Bet Amount</th>
                <th>Multiplier</th>
                <th>Winnings</th>
               
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} className={bet.status === "won" ? "won" : "lost"}>
                     <td><b>{bet.status}</b></td>
                  {/* <td>{bet.matchName || 'N/A'}</td> */}
                  <td>{bet.selectedTeam}</td>
                  <td>₹{bet.betAmount || 0}</td> {/* Bet Amount Added */}
                  <td>{bet.selectedMultiplier}x</td>
                  <td>₹{bet.winnings}</td>
               
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BetStatusListener;
