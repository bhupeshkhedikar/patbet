import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "../../src/BetStatusListener.css";
import AdBanner from "./AdBanner";

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
      snapshot => {
        const updatedBets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort bets by createdAt (latest first)
        updatedBets.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setBets(updatedBets);
        setLoading(false);
      },
      error => {
        console.error("Error fetching bets:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Function to format timestamp to DD-MM-YYYY HH:mm
  const formatDate = timestamp => {
    if (!timestamp?.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return (
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="bet-status-container">
      <AdBanner />
      <h3 className="bet-title">Your Bets</h3>
      {loading ? (
        <p className="loading">Loading bets...</p>
      ) : bets.length === 0 ? (
        <p className="no-bets">No bets placed yet.</p>
      ) : (
        <div className="bets-list">
          {bets.map(bet => {
            // Calculate earnings
            const grossWinning = bet.betAmount * bet.odds;
            const deduction = grossWinning * 0.1;
            const finalPayout = grossWinning - deduction;

            return (
              <div key={bet.id} className={`bet-card ${bet.status}`}>
                <div className="bet-header">
                  <span className={`bet-status ${bet.status}`}>
                    {bet.status === "won" && "विजयी"}
                    {bet.status === "lost" && "पराजित"}
                    {bet.status === "pending" &&
                      "बेट लगी है - फैसला आना बाकी है"}
                    {bet.status === "returned" &&
                      "एकतरफा खेल / टाई - पैसे वापसी"}
                  </span>
                </div>

                <div className="bet-body">
                  <div className="bet-info">
                    <span className="label">मैच का नाम:</span>
                    <span
                      className="value"
                      style={{ color: "yellow", fontSize: "14px" }}
                    >
                      {bet.matchName}
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">चुनी हुई टीम:</span>
                    <span
                      className="value"
                      style={{ color: "#1e90ff", fontSize: "14px" }}
                    >
                      {bet.selectedTeam}
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">बेट राशि:</span>
                    <span className="value" style={{ color: "#ffcc00" }}>
                      ₹{bet.betAmount || 0}
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">मल्टिप्लायर:</span>
                    <span className="value" style={{ color: "#00bcd4" }}>
                      {bet.odds}x
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">जीती हुई राशि:</span>
                    <span
                      className="value"
                      style={{
                        color:
                          bet.status === "lost"
                            ? "#f44336"
                            : bet.status === "pending"
                            ? "#ffa500"
                            : "#4caf50",
                        fontSize: "15px",
                      }}
                    >
                      ₹{bet.winnings}
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">बेट तिथि:</span>
                    <span
                      className="value"
                      style={{ color: "#9c27b0", fontSize: "14px" }}
                    >
                      {formatDate(bet.createdAt)}
                    </span>
                  </div>

                  {/* NEW SECTION — Earnings Breakdown */}
                  {/* {bet.status === "won" && (
                    <div
                      style={{
                        marginTop: "10px",
                        background: "#0d0d0d",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #333",
                      }}
                    >
                      <p style={{ fontSize: "12px", color: "#76ff03" }}>
                        🟢 <b>कमाई विवरण:</b>
                      </p>

                      <p
                        style={{
                          fontSize: "11px",
                          color: "white",
                          margin: "3px 0",
                        }}
                      >
                        कुल जीत (बेट × मल्टिप्लायर):{" "}
                        <b>₹{grossWinning.toFixed(2)}</b>
                      </p>

                      <p
                        style={{
                          fontSize: "11px",
                          color: "orange",
                          margin: "3px 0",
                        }}
                      >
                        कटौती (10%): <b>₹{deduction.toFixed(2)}</b>
                      </p>

                      <p
                        style={{
                          fontSize: "12px",
                          color: "#4caf50",
                          margin: "3px 0",
                        }}
                      >
                        अंतिम राशि (आपको मिली): <b>₹{finalPayout.toFixed(2)}</b>
                      </p>
                    </div>
                  )} */}
                </div>

                {bet.status === "won" && (
                  <p
                    className="commission-message"
                    style={{
                      fontSize: "8px",
                      color: "grey",
                      marginTop: "4px",
                      textAlign: "center",
                    }}
                  >
                    * आपकी जीत पर 10% कमीशन काटा जाता है।
                  </p>
                )}
              </div>
            );
          })}

          <AdBanner />
        </div>
      )}
    </div>
  );
};

export default BetStatusListener;
