import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

/* --------------------------------------------------
   ADMIN WHATSAPP REWARD PANEL
-------------------------------------------------- */

const AdminWhatsAppRewardPanel = () => {
  const [logs, setLogs] = useState([]);
  const [rewardEnabled, setRewardEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------
     FETCH REWARD CONFIG (ON / OFF)
  -------------------------------------------------- */
  useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, "appConfig", "rewards"));
      if (snap.exists()) {
        setRewardEnabled(snap.data().whatsappEnabled);
      }
    };
    fetchConfig();
  }, []);

  /* --------------------------------------------------
     LIVE WHATSAPP REWARD LOGS
  -------------------------------------------------- */
  useEffect(() => {
    const q = query(
      collection(db, "whatsappRewardLogs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* --------------------------------------------------
     TOGGLE REWARD ON / OFF
  -------------------------------------------------- */
  const toggleReward = async () => {
    await updateDoc(doc(db, "appConfig", "rewards"), {
      whatsappEnabled: !rewardEnabled,
    });
    setRewardEnabled(!rewardEnabled);
  };

  /* --------------------------------------------------
     CALCULATIONS
  -------------------------------------------------- */
  const totalReward = logs.reduce((sum, l) => sum + (l.amount || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayReward = logs
    .filter((l) => l.date === today)
    .reduce((s, l) => s + (l.amount || 0), 0);

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>📊 WhatsApp Reward Admin Panel</h2>

      {/* REWARD TOGGLE */}
      <div
        style={{
          marginBottom: 20,
          padding: 15,
          borderRadius: 10,
          background: rewardEnabled ? "#0edf1fff" : "#e61534ff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <b>
          Reward Status:{" "}
          <span style={{ color: rewardEnabled ? "green" : "red" }}>
            {rewardEnabled ? "ON" : "OFF"}
          </span>
        </b>

        <button
          onClick={toggleReward}
          style={{
            padding: "8px 16px",
            background: rewardEnabled ? "#d32f2f" : "#388e3c",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Turn {rewardEnabled ? "OFF" : "ON"}
        </button>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
          color:'black'
        }}
      >
        <div style={summaryCardStyle}>
          <p>Total Reward Given</p>
          <h3>₹{totalReward}</h3>
        </div>

        <div style={summaryCardStyle}>
          <p>Today’s Reward</p>
          <h3>₹{todayReward}</h3>
        </div>

        <div style={summaryCardStyle}>
          <p>Total Entries</p>
          <h3>{logs.length}</h3>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>User ID</th>
              <th style={th}>Game ID</th>
              <th style={th}>Amount</th>
              <th style={th}>Date</th>
              <th style={th}>Device</th>
              <th style={th}>Time</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  No reward logs found
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td style={td}>{l.userId}</td>
                  <td style={td}>{l.gameId}</td>
                  <td style={td}>₹{l.amount}</td>
                  <td style={td}>{l.date}</td>
                  <td style={td}>{l.deviceId}</td>
                  <td style={td}>
                    {l.createdAt?.toDate
                      ? l.createdAt.toDate().toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */

const summaryCardStyle = {
  background: "#ffffff",
  padding: 15,
  borderRadius: 10,
  minWidth: 180,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const th = {
  padding: 10,
  border: "1px solid #ddd",
  textAlign: "left",
};

const td = {
  padding: 10,
  border: "1px solid #ddd",
};

export default AdminWhatsAppRewardPanel;
