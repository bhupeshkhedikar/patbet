import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import './ResultsTable.css';

const ResultsTable = () => {
  const [games, setGames] = useState([]);
  const [tableTitle, setTableTitle] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      const gamesRef = collection(db, "results");
      const snapshot = await getDocs(gamesRef);
      const gamesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesList);
    };

    fetchGames();
  }, []);

  useEffect(() => {
    const fetchTitle = async () => {
      const titleDoc = await getDoc(doc(db, "settings", "tableTitle"));
      if (titleDoc.exists()) {
        setTableTitle(titleDoc.data().title);
      }
    };
    fetchTitle();
  }, []);

  const updateTableTitle = async () => {
    await setDoc(doc(db, "settings", "tableTitle"), { title: tableTitle });
    alert("Table title updated!");
  };

  const handleSetWinner = async (gameId, winner) => {
    try {
      const gameDoc = doc(db, "results", gameId);
      await updateDoc(gameDoc, { winner });

      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === gameId ? { ...game, winner } : game
        )
      );

      alert("Winner updated successfully!");
    } catch (error) {
      console.error("Error updating winner:", error);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;

    try {
      await deleteDoc(doc(db, "results", gameId));

      setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));

      alert("Game deleted successfully!");
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  return (
    <div className="results-table">
      <h2>{tableTitle || "Game Results"}</h2>
      
      <div className="admin-table-settings">
        <h2>Update Table Title</h2>
        <input
          type="text"
          value={tableTitle}
          onChange={(e) => setTableTitle(e.target.value)}
          placeholder="Enter Table Title"
        />
        <button onClick={updateTableTitle} className="approve-btn">Save</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>League</th>
            <th>Teams</th>
            <th>Set Winner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.league}</td>
              <td>
                <div className="teams">
                  <span>{game.team1.name}</span> vs <span>{game.team2.name}</span>
                </div>
              </td>
              
              <td>
                <select
                  value={game.winner}
                  onChange={(e) => handleSetWinner(game.id, e.target.value)}
                >
                  <option value="">Select Winner</option>
                  <option value={game.team1.name}>{game.team1.name}</option>
                  <option value={game.team2.name}>{game.team2.name}</option>
                  <option value="Tie">Tie</option>
                  <option value="Chance">Chance</option>
                  <option value="Cancel">Cancel</option>
                </select>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDeleteGame(game.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
