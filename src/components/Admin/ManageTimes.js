// src/components/ManageTimes.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ManageTimes = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     Helpers (Timezone Safe)
  ------------------------------ */
  const formatForInput = (ms) => {
    const d = new Date(ms);
    const pad = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  /* -----------------------------
     Fetch Saved Times
  ------------------------------ */
  useEffect(() => {
    const fetchBetTimes = async () => {
      const snap = await getDoc(doc(db, "betTimes", "times"));
      if (snap.exists()) {
        const data = snap.data();
        setStartTime(formatForInput(data.starttime));
        setEndTime(formatForInput(data.endtime));
      }
      setLoading(false);
    };

    fetchBetTimes();
  }, []);

  /* -----------------------------
     Update Times
  ------------------------------ */
  const updateBetTimes = async () => {
    await setDoc(doc(db, "betTimes", "times"), {
      starttime: new Date(startTime).getTime(), // ✅ milliseconds
      endtime: new Date(endTime).getTime(),
    });

    alert("⏰ Betting times updated successfully!");
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto 200px",
        padding: 20,
        borderRadius: 20,
        background:
          "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
        color: "#fff",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: 20,
          fontSize: 22,
          fontWeight: "bold",
          letterSpacing: 1,
        }}
      >
        ⏱️ Betting Time Control
      </h2>

      {/* Start Time */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginBottom: 8, display: "block", opacity: 0.9 }}>
          🕒 Start Time
        </label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "none",
            fontSize: 15,
            background: "#ffffff",
            color: "#000",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* End Time */}
      <div style={{ marginBottom: 25 }}>
        <label style={{ marginBottom: 8, display: "block", opacity: 0.9 }}>
          ⏰ End Time
        </label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "none",
            fontSize: 15,
            background: "#ffffff",
            color: "#000",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* Button */}
      <button
        onClick={updateBetTimes}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 18,
          border: "none",
          fontSize: 16,
          fontWeight: "bold",
          cursor: "pointer",
          color: "#000",
          background:
            "linear-gradient(180deg, #ffd86f 0%, #ff9f1c 100%)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        }}
      >
        ⏳ Update Betting Time
      </button>
    </div>
  );
};

export default ManageTimes;
