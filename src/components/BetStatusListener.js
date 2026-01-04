import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import AdBanner from "./AdBanner";

const BetStatusListener = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- BETS FETCH ---------------- */
  useEffect(() => {
    const user = auth.currentUser;
    const storedUID = localStorage.getItem("userUID");
    const userId = user ? user.uid : storedUID;

    if (!userId) {
      setLoading(false);
      return;
    }

    const betsRef = collection(db, "users", userId, "bets");

    const unsubscribe = onSnapshot(betsRef, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );
      setBets(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- DATE FORMAT ---------------- */
  const formatDate = ts => {
    if (!ts?.seconds) return "N/A";
    const d = new Date(ts.seconds * 1000);
    return (
      d.toLocaleDateString("hi-IN") +
      " " +
      d.toLocaleTimeString("hi-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  /* ---------------- STATUS THEME ---------------- */
  const statusTheme = status => {
    switch (status) {
      case "won":
        return {
          ribbon: "linear-gradient(90deg,#00e676,#1de9b6)",
          glow: "#1de9b6",
          text: "🏆 विजयी",
        };
      case "lost":
        return {
          ribbon: "linear-gradient(90deg,#ff1744,#ff5252)",
          glow: "#ff5252",
          text: "❌ पराजित",
        };
      case "pending":
        return {
          ribbon: "linear-gradient(90deg,#ff9100,#ffd740)",
          glow: "#ffc400",
          text: "⏳ राय लगी है-फैसला बाकी",
        };
      case "tie":
        return {
          ribbon: "linear-gradient(90deg,#00b0ff,#69f0ff)",
          glow: "#40c4ff",
          text: "🤝 टाई",
        };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 14,
        background:
          "linear-gradient(135deg,#0b0f1a,#141e30,#243b55)",
        fontFamily: "Inter, sans-serif",
        color: "#fff",
      }}
    >
      <AdBanner />

      <h3
        style={{
          textAlign: "center",
          margin: "14px 0 18px",
          letterSpacing: 1,
        }}
      >
        🎯 मेरी राय (Predictions)
      </h3>

      {loading ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          डेटा लोड हो रहा है...
        </p>
      ) : bets.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          अभी तक कोई राय नहीं लगाई गई
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {bets.map(bet => {
            const t = statusTheme(bet.status);

            return (
              <div
                key={bet.id}
                style={{
                  position: "relative",
                  borderRadius: 22,
                  overflow: "hidden",
                  background:
                    "linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))",
                  backdropFilter: "blur(16px)",
                  boxShadow: `0 0 28px ${t.glow}55`,
                  transition: "0.45s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform =
                    "translateY(-6px) scale(1.03)";
                  e.currentTarget.style.boxShadow = `0 0 45px ${t.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = `0 0 28px ${t.glow}55`;
                }}
              >
                {/* STATUS RIBBON */}
                <div
                  style={{
                    background: t.ribbon,
                    padding: "8px 14px",
                    fontWeight: "bold",
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  {t.text}
                </div>

                {/* CARD BODY */}
                <div style={{ padding: 14 }}>
                  {/* MATCH */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#ffeb3b",
                      marginBottom: 10,
                    }}
                  >
                    🏟️ मैच : {bet.matchName}
                  </div>

                  {/* TEAM */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ opacity: 0.75 }}>
                      चुनी हुई टीम
                    </span>
                    <span
                      style={{
                        color: "#4fc3f7",
                        fontWeight: 600,
                      }}
                    >
                      {bet.selectedTeam}
                    </span>
                  </div>

                  {/* STATS GRID */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      ["राय कॉइन्स", `💵${bet.betAmount}`, "#ffd54f"],
                      ["मल्टिप्लायर", `${bet.odds}x`, "#00e5ff"],
                      [
                        bet.status === "tie"
                          ? "रिफंड कॉइन्स"
                          : "जीती हुई राशि",
                        `💵${bet.winnings || 0}`,
                        bet.status === "lost"
                          ? "#ff5252"
                          : bet.status === "pending"
                          ? "#ffb300"
                          : bet.status === "tie"
                          ? "#40c4ff"
                          : "#69f0ae",
                      ],
                      [
                        "राय तिथि",
                        formatDate(bet.createdAt),
                        "#ce93d8",
                      ],
                    ].map(([label, value, color], i) => (
                      <div
                        key={i}
                        style={{
                          background:
                            "rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            opacity: 0.7,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color,
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COMMISSION */}
                  {bet.status === "won" && (
                    <div
                      style={{
                        fontSize: 9,
                        opacity: 0.6,
                        textAlign: "center",
                      }}
                    >
                      * जीत की राशि पर 10% कमीशन काटा जाता है
                    </div>
                  )}
                </div>
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
