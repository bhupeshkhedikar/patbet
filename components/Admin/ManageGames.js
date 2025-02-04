import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  orderBy,
  getFirestore,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import axios from "axios";
import "../Admin/AdminPanel.css";
import useGameWinnerListener from "../useGameWinnerListener";
import { updateBetsForTie, updateBetsForGame } from "../betUpdates";


const ManageGames = () => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedWinner, setSelectedWinner] = useState("");
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newGame, setNewGame] = useState({
    league: "",
    team1: {
      name: "",
      logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
    },
    team2: {
      name: "",
      logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
    },
    time: " को सुरू होगा",
    winner: "",
    isBetEnabled: false,
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCollection = collection(db, "games");
        const gamesSnapshot = await getDocs(gamesCollection);
        const gameList = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGames(gameList);
      } catch (error) {
        setErrorMessage("Error fetching games: " + error.message);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    const gamesRef = collection(db, "games");
    const unsubscribe = onSnapshot(gamesRef, querySnapshot => {
      const gameList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllGames(gameList); // Only update the games list
    });

    return () => unsubscribe();
  }, []);


//   useGameWinnerListener(isManualUpdate);
  const handleAddGame = async () => {
    try {
      if (
        !newGame.league ||
        !newGame.team1.name ||
        !newGame.team2.name ||
        !newGame.time
      ) {
        setErrorMessage("All fields are required!");
        return;
      }

      const gamesRef = collection(db, "games");
      await addDoc(gamesRef, newGame);

      setGames([...games, newGame]);
      alert("Game added successfully!");
      setNewGame({
        league: "",
        team1: {
          name: "",
          logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
        },
        team2: {
          name: "",
          logo: "https://i.ibb.co/gM8dM9Nt/Screenshot-2025-01-29-215509-removebg-preview.png",
        },
        time: " को सुरू होगा",
        winner: "",
        isBetEnabled: false,
      });
    } catch (error) {
      setErrorMessage("Error adding game: " + error.message);
    }
    };
    
    // // const updateBetsForTie = async (gameId) => {
    //     console.log(`Updating bets for game: ${gameId} | Result: Tie`);
      
    //     const usersRef = collection(db, "users");
    //     const usersSnapshot = await getDocs(usersRef);
      
    //     for (const userDoc of usersSnapshot.docs) {
    //       const userId = userDoc.id;
    //       const betsRef = collection(db, "users", userId, "bets");
    //       const betsQuery = query(betsRef, where("gameId", "==", gameId));
    //       const betsSnapshot = await getDocs(betsQuery);
      
    //       for (const betDoc of betsSnapshot.docs) {
    //         const betId = betDoc.id;
      
    //         // Update each bet as "tie"
    //         await updateDoc(doc(db, "users", userId, "bets", betId), {
    //           status: "tie",
    //           winnings: 0,
    //         });
      
    //         console.log(`Bet ${betId} marked as tie for user ${userId}`);
    //       }
    //     }
    //   };
      
    const handleToggleBetting = async (gameId, isEnabled) => {
        try {
          console.log(`Setting betting for game ${gameId} to ${isEnabled}`);
          
          // Ensure the gameId is valid and passed properly
          if (!gameId) {
            console.error("Invalid game ID");
            return;
          }
      
          // Get a reference to the specific game document
          const gameRef = doc(db, "games", gameId);
      
          // Update the bettingEnabled field
          await updateDoc(gameRef, { isBetEnabled: isEnabled });
      
          alert(`Betting has been ${isEnabled ? "enabled" : "disabled"} for this game.`);
        } catch (error) {
          console.error("Error updating betting status:", error);
          alert("An error occurred while updating betting status.");
        }
    };
    
      
      
      const handleSetWinner = async (gameId, winner) => {
        if (!gameId || !winner) {
          alert("Please select a game and a winner!");
          return;
        }
      
        try {
          console.log(`Setting winner for game ${gameId} to ${winner}`);
      
          // Avoid calling `updateBetsForGame` when only toggling betting
          if (winner === "tie") {
            await updateBetsForTie(gameId);
          } else {
            await updateBetsForGame(gameId, winner);
          }
      
          alert("Bets and balances have been updated successfully!");
        } catch (error) {
          console.error("Error updating bets:", error);
          alert("An error occurred while updating bets.");
        }
      };
      
    

  const updateBetsForGame = async (gameId, winnerTeamName) => {
    console.log(
      `Updating bets for game: ${gameId} | Winner: ${winnerTeamName}`
    );

    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    // Process each user sequentially
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const betsRef = collection(db, "users", userId, "bets");
      const betsQuery = query(betsRef, where("gameId", "==", gameId));

      const betsSnapshot = await getDocs(betsQuery);

      // Fetch the user's current wallet balance once
      const userRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userRef);
      let currentBalance = userDocSnapshot.exists()
        ? Number(userDocSnapshot.data().walletBalance) || 0
        : 0;

      // Process each bet sequentially
      for (const betDoc of betsSnapshot.docs) {
        const betData = betDoc.data();
        const betId = betDoc.id;

        const betStatus =
          betData.selectedTeam === winnerTeamName ? "won" : "lost";

        // Calculate winnings
        const betAmount = Number(betData.betAmount); // Bet amount as number
        const selectedMultiplier = Number(betData.selectedMultiplier); // Multiplier as number
        const winnings =
          betStatus === "won" ? betAmount * selectedMultiplier : 0;

        console.log(
          `Updating bet ${betId}: Status -> ${betStatus}, Winnings -> ₹${winnings}`
        );

        // Update the bet status in Firestore
        await updateDoc(doc(db, "users", userId, "bets", betId), {
          status: betStatus,
          winnings: winnings,
        });

        // Update the wallet balance if the bet is won
        if (betStatus === "won") {
          currentBalance += winnings; // Update the current balance locally
          await updateDoc(userRef, { walletBalance: currentBalance }); // Update Firestore
          console.log(
            `Updated wallet balance for user ${userId}: ₹${currentBalance}`
          );
        }
      }
    }
  };
  return (
    <>
          <div style={{ margin:'0 auto'}}>
      <div className="game-selection">
        <h2>Select Game and Winner</h2>
        <div className="select-group">
          <label>Select Game</label>
          <select
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
          >
            <option value="">Select Game</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.league} - {game.team1.name} vs {game.team2.name}
              </option>
            ))}
          </select>
        </div>

        {selectedGame && (
          <div className="select-group">
            <label>Select Winner</label>
            <select
              value={selectedWinner}
              onChange={e => setSelectedWinner(e.target.value)}
            >
              <option value="">Select Winner</option>
              <option value="tie">Tie</option>
              <option
                value={games.find(game => game.id === selectedGame)?.team1.name}
              >
                {games.find(game => game.id === selectedGame)?.team1.name}
              </option>
              <option
                value={games.find(game => game.id === selectedGame)?.team2.name}
              >
                {games.find(game => game.id === selectedGame)?.team2.name}
              </option>
            </select>
          </div>
        )}

<button
  className="set-winner-btn"
  onClick={() => handleSetWinner(selectedGame, selectedWinner)}
>
  Set Winner
</button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
      <div className="add-game">
        <h2>Add New Game</h2>
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
        <input
          type="text"
          placeholder="Game Time"
          value={newGame.time}
          onChange={e => setNewGame({ ...newGame, time: e.target.value })}
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
          </div>
          </div>
          <div>
          <div>
  <table className="requests-table">
    <thead>
      <tr>
        <th>League</th>
        <th>Team 1</th>
        <th>Team 2</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {allGames.map(game => (
        <tr key={game.id}>
          <td>{game.league}</td>
          <td>{game.team1.name}</td>
          <td>{game.team2.name}</td>
          <td>
          <button className={game.isBetEnabled ? "enable-betting" : "disable-betting"}  onClick={() => handleToggleBetting(game.id, true)}>Enable Betting</button>
<button onClick={() => handleToggleBetting(game.id, false)}>Disable Betting</button>

          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>
    </>
  );
};
export default ManageGames;
