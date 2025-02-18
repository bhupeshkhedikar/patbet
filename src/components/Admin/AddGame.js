import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from "firebase/firestore";

const AddGame = () => {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    league: "दक्षिणदान <----> उत्तरदान",
    team1: {
      name: "",
      logo: "https://i.ibb.co/DDD7g2CP/bailjodi.png",
    },
    team2: {
      name: "",
      logo: "https://i.ibb.co/DDD7g2CP/bailjodi.png",
    },
    time: " ",
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

      const gamesRef = collection(db, "games");
      await addDoc(gamesRef, newGame);

      setGames([...games, newGame]);
      alert("Game added successfully!");
      setNewGame({
        league: "दक्षिणदान <----> उत्तरदान",
        team1: {
          name: "",
          logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
        },
        team2: {
          name: "",
          logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
        },
        time: " ",
        winner: "",
        isBetEnabled: false,
      });
    } catch (error) {
      setErrorMessage("Error adding game: " + error.message);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      const gameDoc = doc(db, "games", gameId); // Reference to the specific game document
      await deleteDoc(gameDoc); // Delete the document
      setGames(games.filter((game) => game.id !== gameId)); // Update the state to remove the deleted game
        alert("Game deleted successfully!");
        window.location.reload()
    } catch (error) {
      setErrorMessage("Error deleting game: " + error.message);
    }
  };
  

  return (
    <div className="add-game">
      <h2>Add New Game</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
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
        onChange={e => setNewGame({ ...newGame, team1: { ...newGame.team1, name: e.target.value } })}
      />
      <input
        type="text"
        placeholder="Team 2 Name"
        value={newGame.team2.name}
        onChange={e => setNewGame({ ...newGame, team2: { ...newGame.team2, name: e.target.value } })}
      />
      {/* <input
        type="text"
        placeholder="Game Time"
        value={newGame.time}
        onChange={e => setNewGame({ ...newGame, time: e.target.value })}
      /> */}
      <select
        style={{ marginBottom: "20px" }}
        value={newGame.isBetEnabled}
        onChange={e => setNewGame({ ...newGame, isBetEnabled: e.target.value === "true" })}
      >
        <option value="false">Disable Betting</option>
        <option value="true">Enable Betting</option>
      </select>

      <button className="add-game-btn" onClick={handleAddGame}>
        Add Game
      </button>
<br/><br/><br/>
      <h2>Game List</h2>
<ul className="game-list">
  {games.length === 0 ? (
    <p>No games available.</p>
  ) : (
    games.map((game) => (
      <li key={game.id}>
        <p>
          {game.league} — {game.team1.name} vs {game.team2.name}
        </p>
        <button className="delete-game-btn" onClick={() => handleDeleteGame(game.id)}>
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
