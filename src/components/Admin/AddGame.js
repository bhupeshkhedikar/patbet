import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

const AddGame = () => {
  const [games, setGames] = useState([]);
  const [villages, setVillages] = useState([]);
  const [newVillage, setNewVillage] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [newGame, setNewGame] = useState({
    srNo: "",
    league: "दक्षिणदान <----> उत्तरदान",
    team1: { name: "", logo: "bullcart.png" },
    team2: { name: "", logo: "bullcart.png" },
    time: "",
    winner: "",
    isBetEnabled: false,
    maxBetAmount: 1000,
  });

  const [errorMessage, setErrorMessage] = useState("");

  const maxBetOptions = [60, 100, 200, 300, 500, 1000, 2000, 3000];

  /* ---------------- FETCH GAMES ---------------- */
  useEffect(() => {
    const fetchGames = async () => {
      const snapshot = await getDocs(collection(db, "games"));
      setGames(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchGames();
  }, []);

  /* ---------------- FETCH VILLAGES ---------------- */
  useEffect(() => {
    const fetchVillages = async () => {
      const snapshot = await getDocs(collection(db, "villages"));
      setVillages(
        snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(v => v.active)
      );
    };
    fetchVillages();
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
    const snap = await getDocs(collection(db, "villages"));
    setVillages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  /* ---------------- REMOVE VILLAGE ---------------- */
  const handleRemoveVillage = async (village) => {
    // check if any game exists for this village
    const q = query(
      collection(db, "games"),
      where("villageName", "==", village.name)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("❌ Cannot delete village. Games already exist for this village.");
      return;
    }

    await deleteDoc(doc(db, "villages", village.id));

    setVillages(villages.filter(v => v.id !== village.id));

    if (selectedVillage === village.id) {
      setSelectedVillage("");
    }

    alert("✅ Village removed successfully");
  };

  /* ---------------- ADD GAME ---------------- */
  const handleAddGame = async () => {
    try {
      if (
        !newGame.league ||
        !newGame.team1.name ||
        !newGame.team2.name ||
        !selectedVillage
      ) {
        setErrorMessage("All fields including village are required!");
        return;
      }

      const villageObj = villages.find(v => v.id === selectedVillage);

      const formattedLeague = newGame.srNo
        ? `${newGame.srNo}) ${newGame.league}`
        : newGame.league;

      const gameData = {
        ...newGame,
        league: formattedLeague,
        villageName: villageObj.name,
        createdAt: serverTimestamp(),
      };

      const gameDoc = await addDoc(collection(db, "games"), gameData);

      await addDoc(collection(db, "results"), {
        gameId: gameDoc.id,
        league: formattedLeague,
        team1: newGame.team1,
        team2: newGame.team2,
        time: newGame.time,
        villageName: villageObj.name,
        winner: "",
        isBetEnabled: newGame.isBetEnabled,
        maxBetAmount: newGame.maxBetAmount,
        createdAt: serverTimestamp(),
      });

      alert("✅ Game added successfully!");

      setNewGame({
        srNo: "",
        league: "दक्षिणदान <----> उत्तरदान",
        team1: { name: "", logo: "bullcart.png" },
        team2: { name: "", logo: "bullcart.png" },
        time: "",
        winner: "",
        isBetEnabled: false,
        maxBetAmount: 1000,
      });

      setSelectedVillage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  /* ---------------- DELETE GAME ---------------- */
  const handleDeleteGame = async (id) => {
    await deleteDoc(doc(db, "games", id));
    setGames(games.filter(g => g.id !== id));
  };

  return (
    <div className="add-game">
      <h2>Add New Game</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* -------- ADD VILLAGE -------- */}
      <h3>Add Village</h3>
      <input
        placeholder="Village name"
        value={newVillage}
        onChange={e => setNewVillage(e.target.value)}
      />
      <button onClick={handleAddVillage}>Add Village</button>

      {/* -------- VILLAGE LIST WITH REMOVE -------- */}
      <ul style={{ marginTop: 10 }}>
        {villages.map(v => (
          <li key={v.id}>
            {v.name}
            <button
              style={{ marginLeft: 10, color: "red" }}
              onClick={() => handleRemoveVillage(v)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <hr />

      {/* -------- SELECT VILLAGE -------- */}
      <select
        value={selectedVillage}
        onChange={e => setSelectedVillage(e.target.value)}
      >
        <option value="">Select Village</option>
        {villages.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      {/* -------- SR NO -------- */}
      <select
        value={newGame.srNo}
        onChange={e => setNewGame({ ...newGame, srNo: e.target.value })}
      >
        <option value="">Select Sr No</option>
        {[...Array(20)].map((_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>

      <input
        placeholder="League Name"
        value={newGame.league}
        onChange={e => setNewGame({ ...newGame, league: e.target.value })}
      />

      <input
        placeholder="Team 1 Name"
        value={newGame.team1.name}
        onChange={e =>
          setNewGame({ ...newGame, team1: { ...newGame.team1, name: e.target.value } })
        }
      />

      <input
        placeholder="Team 2 Name"
        value={newGame.team2.name}
        onChange={e =>
          setNewGame({ ...newGame, team2: { ...newGame.team2, name: e.target.value } })
        }
      />

      <select
        value={newGame.maxBetAmount}
        onChange={e => setNewGame({ ...newGame, maxBetAmount: Number(e.target.value) })}
      >
        {maxBetOptions.map(a => (
          <option key={a} value={a}>💵 {a}</option>
        ))}
      </select>

      <select
        value={newGame.isBetEnabled}
        onChange={e => setNewGame({ ...newGame, isBetEnabled: e.target.value === "true" })}
      >
        <option value="false">Disable Betting</option>
        <option value="true">Enable Betting</option>
      </select>

      <button onClick={handleAddGame}>Add Game</button>

      <h2>Game List</h2>
      <ul>
        {games.map(g => (
          <li key={g.id}>
            {g.league} -— {g.team1.name} vs {g.team2.name} ({g.villageName})
            <button className="delete-game-btn" onClick={() => handleDeleteGame(g.id)} >  Delete Game</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddGame;
