import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import "../Admin/AdminPanel.css";
import { updateBetsForTie } from './../betUpdates';

const ManageGames = () => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedWinner, setSelectedWinner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesSnapshot = await getDocs(collection(db, "games"));
        setGames(gamesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        setErrorMessage("Error fetching games: " + error.message);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "games"), (snapshot) => {
      setAllGames(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleToggleBetting = async (gameId, isEnabled) => {
    try {
      if (!gameId) return console.error("Invalid game ID");
      await updateDoc(doc(db, "games", gameId), { isBetEnabled: isEnabled });
      alert(`Betting has been ${isEnabled ? "enabled" : "disabled"} for this game.`);
    } catch (error) {
      console.error("Error updating betting status:", error);
      alert("An error occurred while updating betting status.");
    }
  };

  const handleSetWinner = async (gameId, winner) => {
    if (!gameId || !winner) return alert("Please select a game and a winner!");
    
    try {
      console.log(`Setting winner for game ${gameId} to ${winner}`);

      if (winner === "tie") {
        await updateBetsForTie(gameId);
      } else {
        await updateBetsForGame(gameId, winner);
      }

      alert("Bets and balances updated successfully!");
    } catch (error) {
      console.error("Error updating bets:", error);
      alert("An error occurred while updating bets.");
    }
  };

  const updateBetsForGame = async (gameId, winnerTeamName) => {
    console.log(`Updating bets for game: ${gameId} | Winner: ${winnerTeamName}`);

    const usersSnapshot = await getDocs(collection(db, "users"));
    const batch = writeBatch(db);

    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const betsQuery = query(collection(db, "users", userId, "bets"), where("gameId", "==", gameId));
        const betsSnapshot = await getDocs(betsQuery);

        let totalWinnings = 0;
        betsSnapshot.docs.forEach((betDoc) => {
          const betData = betDoc.data();
          const betStatus = betData.selectedTeam === winnerTeamName ? "won" : "lost";
          const winnings = betStatus === "won" ? betData.betAmount * betData.selectedMultiplier : 0;
          totalWinnings += winnings;

          batch.update(doc(db, "users", userId, "bets", betDoc.id), { status: betStatus, winnings });
        });

        if (totalWinnings > 0) {
          const userRef = doc(db, "users", userId);
          await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return;
            const currentBalance = userSnap.data().walletBalance || 0;
            transaction.update(userRef, { walletBalance: currentBalance + totalWinnings });
          });
        }
      })
    );

    await batch.commit();
    console.log("Bets and wallet balances updated successfully.");
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <div className="game-selection">
        <h2>Select Game and Winner</h2>
        <div className="select-group">
          <label>Select Game</label>
          <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
            <option value="">Select Game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.league} - {game.team1.name} vs {game.team2.name}
              </option>
            ))}
          </select>
        </div>

        {selectedGame && (
          <div className="select-group">
            <label>Select Winner</label>
            <select value={selectedWinner} onChange={(e) => setSelectedWinner(e.target.value)}>
              <option value="">Select Winner</option>
              <option value="tie">Tie</option>
              <option value={games.find((game) => game.id === selectedGame)?.team1.name}>
                {games.find((game) => game.id === selectedGame)?.team1.name}
              </option>
              <option value={games.find((game) => game.id === selectedGame)?.team2.name}>
                {games.find((game) => game.id === selectedGame)?.team2.name}
              </option>
            </select>
          </div>
        )}

        <button className="set-winner-btn" onClick={() => handleSetWinner(selectedGame, selectedWinner)}>
          Set Winner
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      <div>
        <table className="requests-table" style={{ marginBottom: "200px" }}>
          <thead>
            <tr>
              <th>League</th>
              <th>Team 1</th>
              <th>Team 2</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allGames.map((game) => (
              <tr key={game.id}>
                <td>{game.league}</td>
                <td>{game.team1.name}</td>
                <td>{game.team2.name}</td>
                <td>
                  <button className={game.isBetEnabled ? "enable-betting" : "disable-betting"} onClick={() => handleToggleBetting(game.id, true)}>
                    Enable Betting
                  </button>
                  <button onClick={() => handleToggleBetting(game.id, false)}>Disable Betting</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageGames;
