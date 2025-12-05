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

        // Sort latest first
        updatedBets.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setBets(updatedBets);
        console.log("Updated bets:", updatedBets);
        setLoading(false);
      },
      error => {
        console.error("Error fetching bets:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Format timestamp
  const formatDate = timestamp => {
    if (!timestamp?.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return (
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div className="bet-status-container">
      <AdBanner />
      <h3 className="bet-title">My Predictions</h3>

      {loading ? (
        <p className="loading">Loading Predictions...</p>
      ) : bets.length === 0 ? (
        <p className="no-bets">No Predictions placed yet.</p>
      ) : (
        <div className="bets-list">
          {bets.map(bet => {
            return (
              <div key={bet.id} className={`bet-card ${bet.status}`}>
                <div className="bet-header">
                  <span className={`bet-status ${bet.status}`}>
                    {bet.status === "won" && "विजयी"}
                    {bet.status === "lost" && "पराजित"}
                    {bet.status === "pending" &&
                      "राय लगी है - फैसला आना बाकी है"}
                    {bet.status === "tie" &&
                      "टाई - पूरी राशि वापस"}
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
                    <span className="label">राय राशि:</span>
                    <span
                      className="value"
                      style={{ color: "#ffcc00" }}
                    >
                      💵{bet.betAmount || 0}
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">मल्टिप्लायर:</span>
                    <span
                      className="value"
                      style={{ color: "#00bcd4" }}
                    >
                      {bet.odds}x
                    </span>
                  </div>

                  {/* ✅ WIN / LOST / PENDING / TIE AMOUNT */}
                  <div className="bet-info">
                    <span className="label">
                      {bet.status === "tie"
                        ? "रिफंड राशि:"
                        : "जीती हुई राशि:"}
                    </span>

                    <span
                      className="value"
                      style={{
                        color:
                          bet.status === "lost"
                            ? "#f44336"
                            : bet.status === "pending"
                            ? "#ffa500"
                            : bet.status === "tie"
                            ? "#03a9f4"
                            : "#4caf50",
                        fontSize: "15px",
                      }}
                    >
                      💵{bet.winnings || 0}
                    </span>
                  </div>

                  <div className="bet-info">
                    <span className="label">राय तिथि:</span>
                    <span
                      className="value"
                      style={{ color: "#9c27b0", fontSize: "14px" }}
                    >
                      {formatDate(bet.createdAt)}
                    </span>
                  </div>
                </div>

                {/* ✅ Commission shown ONLY for won */}
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
