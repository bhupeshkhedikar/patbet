import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../Admin/BetsHistrory.css";
import GoogleAd from "../GoogleAd";

const BetsHistory = () => {
  const [games, setGames] = useState([]);
  const [allBets, setAllBets] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesSnapshot = await getDocs(collection(db, "games"));
        setGames(gamesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    const fetchUsersAndBets = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = {};
        const betsPromises = [];

        usersSnapshot.forEach((userDoc) => {
          usersData[userDoc.id] = userDoc.data().name; // Users को object में store करें
          betsPromises.push(getDocs(collection(db, "users", userDoc.id, "bets")));
        });

        const betsSnapshots = await Promise.all(betsPromises);
        const allBetsData = [];

        betsSnapshots.forEach((betsSnapshot, index) => {
          const userId = usersSnapshot.docs[index].id;
          betsSnapshot.forEach((betDoc) => {
            allBetsData.push({
              userId,
              ...betDoc.data(),
            });
          });
        });

        setUsers(usersData);
        setAllBets(allBetsData);
      } catch (error) {
        console.error("Error fetching users and bets:", error);
      }
    };

    fetchGames();
    fetchUsersAndBets();
  }, []);

  // टीम के बेट्स का डेटा निकालना (कितने users ने कितनी amount लगाई)
  const getTeamStatistics = (gameId, teamName) => {
    const teamBets = allBets.filter((bet) => bet.gameId === gameId && bet.selectedTeam === teamName);
    return {
      count: teamBets.length,
      totalBetAmount: teamBets.reduce((sum, bet) => sum + bet.betAmount, 0),
    };
  };

  // किसी गेम पर कुल कितनी बेटिंग हुई
  const getTotalBetAmount = (gameId) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return 0;
    const team1Stats = getTeamStatistics(gameId, game.team1.name);
    const team2Stats = getTeamStatistics(gameId, game.team2.name);
    return team1Stats.totalBetAmount + team2Stats.totalBetAmount;
  };

  // सबसे ज़्यादा बेट्स किस टीम पर लगी?
  const getMostBettedTeam = (gameId) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return { team: "N/A", total: 0 };
    const team1Stats = getTeamStatistics(gameId, game.team1.name);
    const team2Stats = getTeamStatistics(gameId, game.team2.name);

    if (team1Stats.totalBetAmount > team2Stats.totalBetAmount) {
      return { team: game.team1.name, total: team1Stats.totalBetAmount };
    } else if (team1Stats.totalBetAmount < team2Stats.totalBetAmount) {
      return { team: game.team2.name, total: team2Stats.totalBetAmount };
    } else {
      return { team: "Tie", total: team1Stats.totalBetAmount };
    }
  };

  return (
    <>
    <div className="container">
      <h2>Bets History and Statistics</h2>

      {/* 🔹 Bets History Table */}
      <div className="table-container">
        <table>
        <thead>
  <tr>
    <th>S.No</th>
    <th>League</th>
    <th>Game</th>
    <th>User Name</th>
    <th>Prediction Coins (💵)</th>
    <th>Predicted Team</th>
  </tr>
</thead>
<tbody>
  {allBets
    .filter((bet) => {
      const game = games.find((g) => g.id === bet.gameId);
      return game && game.league !== "N/A" && game.team1 && game.team2; // 🔹 League और Game सही होने चाहिए
    })
    .map((bet, index) => {
      const game = games.find((g) => g.id === bet.gameId);
      return (
        <tr key={index}>
          <td>{index + 1}</td> {/* 🔹 Serial Number जोड़ा */}
          <td>{game.league}</td>
          <td>{`${game.team1.name} vs ${game.team2.name}`}</td>
          <td>{users[bet.userId] || "Unknown"}</td>
          <td>💵{bet.betAmount}</td>
          <td>{bet.selectedTeam}</td>
        </tr>
      );
    })}
</tbody>


        </table>
      </div>

      {/* 🔹 Game-wise Statistics Table */}
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
                    <th>Total Opinion Coins (💵)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{game.team1.name}</td>
                    <td>{getTeamStatistics(game.id, game.team1.name).count}</td>
                    <td>💵{getTeamStatistics(game.id, game.team1.name).totalBetAmount}</td>
                  </tr>
                  <tr>
                    <td>{game.team2.name}</td>
                    <td>{getTeamStatistics(game.id, game.team2.name).count}</td>
                    <td>💵{getTeamStatistics(game.id, game.team2.name).totalBetAmount}</td>
                  </tr>
                  <tr className="total-bet-row">
                    <td colSpan="2">Total Bet Amount on Game</td>
                    <td>💵{getTotalBetAmount(game.id)}</td>
                  </tr>
                  <tr className="most-betted-team">
                    <td colSpan="2">Most Betted Team</td>
                    <td>{getMostBettedTeam(game.id).team} - 💵{getMostBettedTeam(game.id).total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* <GoogleAd 
    client="ca-pub-9925801540177456" 
    slot="4077906455" 
      /> */}
      </>
  );
};

export default BetsHistory;
