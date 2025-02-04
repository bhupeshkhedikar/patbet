import React, { useState, useEffect } from "react";
import { db } from "../firebase";
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
  getFirestore, setDoc,onSnapshot
} from "firebase/firestore";
import axios from "axios";
import "../../src/AdminPanel.css"; // Import the CSS file for styling
import useGameWinnerListener from "./useGameWinnerListener"; // Import the real-time listener hook

const AdminPanel = () => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedWinner, setSelectedWinner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [isManualUpdate, setIsManualUpdate] = useState(false); // Flag for manual updates
  const [deposits, setDeposits] = useState([]);
  const [addMoneyRequests, setAddMoneyRequests] = useState([]);

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
    const gamesRef = collection(db, "games"); // Reference to your Firestore collection

    const unsubscribe = onSnapshot(gamesRef, (querySnapshot) => {
      const gameList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllGames(gameList); // Set all games in state using setAllGames
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const toggleBetting = async (gameId, isBetEnabled) => {
    const gameRef = doc(db, "games", gameId);
    try {
      await updateDoc(gameRef, {
        isBetEnabled: !isBetEnabled, // Toggle betting status
      });
      console.log("Betting status updated");
    } catch (error) {
      console.error("Error updating betting status:", error);
    }
  };


  useEffect(() => {
    const fetchAddMoneyRequests = async () => {
      try {
        const depositsRef = collection(db, "addMoneyRequests");
        // Removed the 'where' clause, now fetching all documents
        const depositsQuery = query(depositsRef, orderBy("createdAt", "desc"));
        const depositSnapshot = await getDocs(depositsQuery);

        const allDeposits = depositSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toLocaleString(), // Format the timestamp
        }));

        console.log("Fetched Add Money Requests: ", allDeposits); // Debugging
        setAddMoneyRequests(allDeposits);
      } catch (error) {
        console.error("Error fetching add money requests:", error);
      }
    };

    fetchAddMoneyRequests();
  }, []);
  // Use the real-time listener for game winner updates
  useGameWinnerListener(isManualUpdate);

  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        const withdrawalsRef = collection(db, "withdrawalRequests");
        const withdrawalSnapshot = await getDocs(withdrawalsRef);
        const withdrawalList = withdrawalSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWithdrawalRequests(withdrawalList);
      } catch (error) {
        setErrorMessage("Error fetching withdrawal requests");
        console.error("Error fetching withdrawal requests:", error);
      }
    };

    fetchWithdrawalRequests();
  }, []);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const depositsRef = collection(db, "deposits");
        const depositsQuery = query(depositsRef, orderBy("timestamp", "desc"));
        const depositSnapshot = await getDocs(depositsQuery);

        const depositList = depositSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toLocaleString(), // Convert timestamp to readable format
        }));

        setDeposits(depositList);
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };

    fetchDeposits();
  }, []);

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

  

  const handleApproveDeposit = async (depositId, userId, amount) => {
    try {
      // 1. Update the deposit request status to 'approved'
      const depositRef = doc(db, "addMoneyRequests", depositId);
      await updateDoc(depositRef, { status: "approved" });

      // 2. Get the current wallet balance of the user
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User not found!");
        return;
      }

      const currentBalance = userSnap.data().walletBalance || 0;

      // 3. Update the user's wallet balance
      await updateDoc(userRef, {
        walletBalance: currentBalance + amount,
      });

      // 4. Update the deposits state to remove the approved deposit
      setDeposits(prevDeposits =>
        prevDeposits.filter(deposit => deposit.id !== depositId)
      );

      alert("Deposit approved and wallet updated!");
    } catch (error) {
      console.error("Error approving deposit:", error);
      alert("Error approving deposit.");
    }
  };

  const handleRejectDeposit = async depositId => {
    try {
      const depositRef = doc(db, "addMoneyRequests", depositId);
      await updateDoc(depositRef, { status: "rejected" });

      setDeposits(prevDeposits =>
        prevDeposits.filter(deposit => deposit.id !== depositId)
      );
      alert("Deposit request rejected.");
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      alert("Error rejecting deposit.");
    }
  };

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

  const handleApprove = async id => {
    try {
      const requestRef = doc(db, "withdrawalRequests", id);

      // सिर्फ़ withdrawal request का status अपडेट कर रहा है
      await updateDoc(requestRef, {
        status: "approved",
      });

      // UI में भी status अपडेट कर रहा है
      setWithdrawalRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === id ? { ...request, status: "approved" } : request
        )
      );

      console.log("Withdrawal approved successfully.");
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      setErrorMessage("Error approving withdrawal.");
    }
  };

  const handleReject = async (id, userId, amount) => {
    try {
      const requestRef = doc(db, "withdrawalRequests", id);

      // 1. Withdrawal request का status 'rejected' में अपडेट करो
      await updateDoc(requestRef, {
        status: "rejected",
      });

      // 2. User का current wallet balance fetch करो
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User not found!");
        setErrorMessage("User not found!");
        return;
      }

      const currentBalance = userSnap.data().walletBalance || 0;

      // 3. Rejected amount वापस wallet में जोड़ो
      await updateDoc(userRef, {
        walletBalance: currentBalance + Number(amount),
      });

      // 4. UI को अपडेट करो ताकि तुरंत बदलाव दिखे
      setWithdrawalRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === id ? { ...request, status: "rejected" } : request
        )
      );

      console.log("Withdrawal rejected and balance reverted successfully.");
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      setErrorMessage("Error rejecting withdrawal.");
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

  const handleSetWinner = async () => {
    if (!selectedGame || !selectedWinner) {
      setErrorMessage("Please select a game and a winner.");
      return;
    }

    try {
      setIsManualUpdate(true); // Disable real-time listener

      const gameRef = doc(db, "games", selectedGame);
      const gameDoc = await getDoc(gameRef);

      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        let winnerTeamKey;

        if (selectedWinner === "tie") {
          winnerTeamKey = "tie"; // Set the result as a tie
        } else {
          winnerTeamKey =
            gameData.team1.name === selectedWinner ? "team1" : "team2";
        }

        // Update the game winner in Firestore
        await updateDoc(gameRef, { winner: winnerTeamKey });

        // Manually trigger the bet updates
        await updateBetsForGame(
          selectedGame,
          selectedWinner === "tie" ? "tie" : selectedWinner
        );

        setErrorMessage("");
        alert(`Winner for game ${selectedGame} set as ${selectedWinner}`);
      } else {
        setErrorMessage("Game not found!");
      }
    } catch (error) {
      setErrorMessage("Error setting winner: " + error.message);
    } finally {
      setIsManualUpdate(false); // Re-enable real-time listener
    }
  };

  return (
    <>


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
      {allGames.map((game) => (
        <tr key={game.id}>
          <td>{game.league}</td>
          <td>{game.team1.name}</td>
          <td>{game.team2.name}</td>
          <td>
            <button 
              className={game.isBetEnabled ? "enable-betting" : "disable-betting"} 
              onClick={() => toggleBetting(game.id, game.isBetEnabled)}
            >
              {game.isBetEnabled ? "Disable Betting" : "Enable Betting"}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      <div className="admin-panel">
        <h2>Admin Panel</h2>
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
                  value={
                    games.find(game => game.id === selectedGame)?.team1.name
                  }
                >
                  {games.find(game => game.id === selectedGame)?.team1.name}
                </option>
                <option
                  value={
                    games.find(game => game.id === selectedGame)?.team2.name
                  }
                >
                  {games.find(game => game.id === selectedGame)?.team2.name}
                </option>
              </select>
            </div>
          )}

          <button className="set-winner-btn" onClick={handleSetWinner}>
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
          <select style={{ marginBottom:'20px'}} value={newGame.isBetEnabled} onChange={(e) => setNewGame({ ...newGame, isBetEnabled: e.target.value === "true" })}>
        <option value="false">Disable Betting</option>
         <option value="true">Enable Betting</option>
         </select>

          
          <button className="add-game-btn" onClick={handleAddGame}>
            Add Game
          </button>
        </div>

        <div className="withdrawal-requests">
          <h3>Withdrawal Requests</h3>
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <table className="requests-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>UPI ID</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {withdrawalRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.username || "N/A"}</td>
                  <td>{request.userId}</td>
                  <td>₹{request.amount}</td>
                  <td>{request.paymentMethod || "N/A"}</td>
                  <td>{request.upiId || "N/A"}</td>
                  <td>
                    {new Date(request.requestDate?.toDate()).toLocaleString()}
                  </td>
                  <td>{request.status}</td>
                  <td>
                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApprove(
                          request.id,
                          request.userId,
                          request.amount
                        )
                      }
                      disabled={request.status === "approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleReject(request.id, request.userId, request.amount)
                      }
                      disabled={request.status === "rejected"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Deposit History</h2>
        <table border="1" className="requests-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map(deposit => (
              <tr key={deposit.id}>
                <td>{deposit.userEmail}</td>
                <td>₹{deposit.amount}</td>
                <td>{deposit.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="deposit-requests">
        <h3>Deposit Requests</h3>
        <table className="requests-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>URN</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addMoneyRequests.length > 0 ? (
              addMoneyRequests.map(deposit => (
                <tr key={deposit.id}>
                  <td>{deposit.userId}</td>
                  <td>{deposit.urn}</td>
                  <td>₹{deposit.amount}</td>
                  <td>{deposit.status}</td>
                  <td>
                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApproveDeposit(
                          deposit.id,
                          deposit.userId,
                          deposit.amount
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRejectDeposit(deposit.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No pending deposit requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminPanel;
