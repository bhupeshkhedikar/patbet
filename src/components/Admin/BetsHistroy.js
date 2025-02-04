import React, { useState, useEffect } from "react";
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "../../firebase";
import "../Admin/BetsHistrory.css";
const BetsHistory = () => {
  const [games, setGames] = useState([]);
  const [allBets, setAllBets] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch games and bets data
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesSnapshot = await getDocs(collection(db, "games"));
        const gameList = gamesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGames(gameList);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    const fetchAllBets = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const betsData = [];

        // Fetch all users and their bets
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const betsSnapshot = await getDocs(collection(db, "users", userId, "bets"));

          betsSnapshot.forEach((betDoc) => {
            betsData.push({
              userId,
              ...betDoc.data(),
            });
          });
        }

        setAllBets(betsData);
      } catch (error) {
        console.error("Error fetching bets history:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchGames();
    fetchAllBets();
    fetchUsers();
  }, []);

  // Get team statistics for each game (Total Bet Amount and Users Count)
  const getTeamStatistics = (gameId, teamName) => {
    const teamBets = allBets.filter((bet) => bet.gameId === gameId && bet.selectedTeam === teamName);
    const totalBetAmount = teamBets.reduce((sum, bet) => sum + bet.betAmount, 0);
    return { count: teamBets.length, totalBetAmount };
  };

  // Get the user name based on userId
  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "Unknown";
  };

  // Get the total bet amount for the game
  const getTotalBetAmount = (gameId) => {
    const team1Stats = getTeamStatistics(gameId, games.find(g => g.id === gameId).team1.name);
    const team2Stats = getTeamStatistics(gameId, games.find(g => g.id === gameId).team2.name);
    return team1Stats.totalBetAmount + team2Stats.totalBetAmount;
  };

  // Determine the most betted team for the game
  const getMostBettedTeam = (gameId) => {
    const team1Stats = getTeamStatistics(gameId, games.find(g => g.id === gameId).team1.name);
    const team2Stats = getTeamStatistics(gameId, games.find(g => g.id === gameId).team2.name);

    if (team1Stats.totalBetAmount > team2Stats.totalBetAmount) {
      return { team: games.find(g => g.id === gameId).team1.name, total: team1Stats.totalBetAmount };
    } else if (team1Stats.totalBetAmount < team2Stats.totalBetAmount) {
      return { team: games.find(g => g.id === gameId).team2.name, total: team2Stats.totalBetAmount };
    } else {
      return { team: "Tie", total: team1Stats.totalBetAmount };
    }
  };

  return (
    <div className="container">
      <h2>Bets History and Statistics</h2>

      {/* Bets History Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>League</th>
              <th>Game</th>
              <th>User Name</th>
              <th>Bet Amount (₹)</th>
              <th>Selected Team</th>
            </tr>
          </thead>
          <tbody>
            {allBets.map((bet, index) => {
              const game = games.find((g) => g.id === bet.gameId);
              return (
                <tr key={index}>
                  <td>{game ? game.league : "N/A"}</td>
                  <td>{game ? `${game.team1.name} vs ${game.team2.name}` : "N/A"}</td>
                  <td>{getUserName(bet.userId)}</td>
                  <td>₹{bet.betAmount}</td>
                  <td>{bet.selectedTeam}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Game-wise Statistics Table */}
      <div className="game-summary">
        {games.map((game) => (
          <div key={game.id}>
            <h4>{game.league} - {game.team1.name} vs {game.team2.name}</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Users Count</th>
                    <th>Total Bet Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{game.team1.name}</td>
                    <td>{getTeamStatistics(game.id, game.team1.name).count}</td>
                    <td>₹{getTeamStatistics(game.id, game.team1.name).totalBetAmount}</td>
                  </tr>
                  <tr>
                    <td>{game.team2.name}</td>
                    <td>{getTeamStatistics(game.id, game.team2.name).count}</td>
                    <td>₹{getTeamStatistics(game.id, game.team2.name).totalBetAmount}</td>
                  </tr>
                  <tr className="total-bet-row">
                    <td colSpan="2">Total Bet Amount on Game</td>
                    <td>₹{getTotalBetAmount(game.id)}</td>
                  </tr>
                  <tr className="most-betted-team">
                    <td colSpan="2">Most Betted Team</td>
                    <td>{getMostBettedTeam(game.id).team} - ₹{getMostBettedTeam(game.id).total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BetsHistory;
