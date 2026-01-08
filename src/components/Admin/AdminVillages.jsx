import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const AdminVillages = () => {
  const [villages, setVillages] = useState([]);
  const [newVillage, setNewVillage] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  /* ----------------- FETCH VILLAGES REAL-TIME ----------------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "villages"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVillages(list);
    });
    return () => unsub();
  }, []);

  /* ---------------- FETCH CURRENT SELECTED VILLAGE ---------------- */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "currentVillage"), (snap) => {
      if (snap.exists()) {
        setSelectedVillage(snap.data().selectedVillage);
      }
    });

    return () => unsub();
  }, []);

  /* ---------------- ADD VILLAGE ---------------- */
  const handleAddVillage = async () => {
    if (!newVillage.trim()) return;

    await addDoc(collection(db, "villages"), {
      name: newVillage.trim(),
      active: true,
      createdAt: serverTimestamp(),
    });

    setNewVillage("");
  };

  /* ---------------- REMOVE VILLAGE ---------------- */
  const handleRemoveVillage = async (village) => {
    // Check if any game exists for this village
    const q = query(
      collection(db, "games"),
      where("villageName", "==", village.name)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("❌ Cannot delete village. Games already exist for this village.");
      return;
    }

    // Delete village
    await deleteDoc(doc(db, "villages", village.id));

    // Reset selected village if deleted village was selected
    if (selectedVillage === village.name) {
      await setDoc(
        doc(db, "settings", "currentVillage"),
        { selectedVillage: "" },
        { merge: true }
      );
    }

    alert("✅ Village removed successfully");
  };

  /* ---------------- SET SELECTED VILLAGE (SAFE) ---------------- */
  const handleSetVillage = async (name) => {
    await setDoc(
      doc(db, "settings", "currentVillage"),
      { selectedVillage: name },
      { merge: true } // 🔥 Creates or updates safely
    );

    setSelectedVillage(name);
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2 style={{ marginBottom: 10 }}>Manage Villages</h2>

      {/* ADD VILLAGE INPUT */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Village name"
          value={newVillage}
          onChange={(e) => setNewVillage(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "1px solid gray",
          }}
        />
        <button
          onClick={handleAddVillage}
          style={{
            padding: "8px 14px",
            background: "#FF9800",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontWeight: "bold",
          }}
        >
          Add
        </button>
      </div>

      <h3 style={{ marginBottom: 10 }}>All Villages</h3>

      {villages.map((village) => (
        <div
          key={village.id}
          style={{
            padding: 12,
            marginBottom: 10,
            background: "#1f1f1f",
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <span style={{ fontSize: 15 }}>{village.name}</span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handleSetVillage(village.name)}
              style={{
                padding: "5px 10px",
                background:
                  selectedVillage === village.name ? "#4CAF50" : "#555",
                border: "none",
                borderRadius: 6,
                color: "white",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {selectedVillage === village.name ? "Selected" : "Select"}
            </button>

            <button
              onClick={() => handleRemoveVillage(village)}
              style={{
                padding: "5px 10px",
                background: "red",
                border: "none",
                borderRadius: 6,
                color: "white",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminVillages;
