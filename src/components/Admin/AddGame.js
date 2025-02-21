import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from "firebase/firestore";

const AddGame = () => {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    srNo: "", // Sr. No field added
    league: "दक्षिणदान <----> उत्तरदान",
    team1: {
      name: "",
      logo: "https://i.ibb.co/DDD7g2CP/bailjodi.png",
    },
    team2: {
      name: "",
      logo: "https://i.ibb.co/DDD7g2CP/bailjodi.png",
    },
    time: "",
    winner: "",
    isBetEnabled: false,
    createdAt: serverTimestamp(),
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all games from Firebase
  useEffect(() => {
    const fetchGames = async () => {
      const gamesRef = collection(db, 'games');
      const snapshot = await getDocs(gamesRef);
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList);
    };

    fetchGames();
  }, []);

  const handleAddGame = async () => {
    try {
      if (!newGame.league || !newGame.team1.name || !newGame.team2.name) {
        setErrorMessage("All fields are required!");
        return;
      }

      const formattedLeague = newGame.srNo ? `${newGame.srNo}) ${newGame.league}` : newGame.league;

      const gameData = {
        ...newGame,
        league: formattedLeague,
      };

      const gamesRef = collection(db, "games");
      const resultsRef = collection(db, "results");

      // Add game to the "games" collection
      const gameDoc = await addDoc(gamesRef, gameData);

      // Add game to the "results" collection separately
      await addDoc(resultsRef, {
        gameId: gameDoc.id,
        league: formattedLeague,
        team1: newGame.team1,
        team2: newGame.team2,
        time: newGame.time,
        winner: "",
        isBetEnabled: newGame.isBetEnabled,
        createdAt: serverTimestamp(),
      });

      setGames([...games, { id: gameDoc.id, ...gameData }]);
      alert("Game added successfully!");

      // Reset the form
      setNewGame({
        srNo: "",
        league: "दक्षिणदान <----> उत्तरदान",
        team1: {
          name: "",
          logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
        },
        team2: {
          name: "",
          logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
        },
        time: "",
        winner: "",
        isBetEnabled: false,
      });
    } catch (error) {
      setErrorMessage("Error adding game: " + error.message);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      const gameDoc = doc(db, "games", gameId);
      await deleteDoc(gameDoc);
      setGames(games.filter((game) => game.id !== gameId));
      alert("Game deleted successfully!");
      window.location.reload();
    } catch (error) {
      setErrorMessage("Error deleting game: " + error.message);
    }
  };

  return (
    <div className="add-game">
      <h2>Add New Game</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <select
        style={{ marginBottom: "10px" }}
        value={newGame.srNo}
        onChange={e => setNewGame({ ...newGame, srNo: e.target.value || "" })}
      >
        <option value="">Select Sr. No (Optional)</option>
        {[...Array(20)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="League Name"
        value={newGame.league}
        onChange={e => setNewGame({ ...newGame, league: e.target.value })}
      />

      <input
        type="text"
        placeholder="Team 1 Name"
        value={newGame.team1.name}
        onChange={e =>
          setNewGame({
            ...newGame,
            team1: { ...newGame.team1, name: e.target.value },
          })
        }
      />

      <input
        type="text"
        placeholder="Team 2 Name"
        value={newGame.team2.name}
        onChange={e =>
          setNewGame({
            ...newGame,
            team2: { ...newGame.team2, name: e.target.value },
          })
        }
      />

      <select
        style={{ marginBottom: "20px" }}
        value={newGame.isBetEnabled}
        onChange={e =>
          setNewGame({ ...newGame, isBetEnabled: e.target.value === "true" })
        }
      >
        <option value="false">Disable Betting</option>
        <option value="true">Enable Betting</option>
      </select>

      <button className="add-game-btn" onClick={handleAddGame}>
        Add Game
      </button>

      <br />
      <br />
      <br />
      <h2>Game List</h2>
      <ul className="game-list">
        {games.length === 0 ? (
          <p>No games available.</p>
        ) : (
          games.map((game, index) => (
            <li key={game.id}>
              <p>
                {game.league} — {game.team1.name} vs {game.team2.name}
              </p>
              <button
                className="delete-game-btn"
                onClick={() => handleDeleteGame(game.id)}
              >
                Delete Game
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AddGame;
