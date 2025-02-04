import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";

const AllBets = () => {
  const [gamesData, setGamesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllGamesData = async () => {
      setLoading(true);

      try {
        // Fetch all games
        const gamesRef = collection(db, "games");
        const gamesSnapshot = await getDocs(gamesRef);
        const games = gamesSnapshot.docs.map((doc) => doc.data());

        const updatedGamesData = await Promise.all(
          games.map(async (game) => {
            const gameId = game.id; // Assuming each game has an 'id' field

            // Fetch all users to get bets
            const usersRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersRef);

            let totalAmount = 0;
            let teamBetsData = {
              team1: { totalAmount: 0, bets: [] },
              team2: { totalAmount: 0, bets: [] },
            };

            // Process each user's bets for this game
            for (const userDoc of usersSnapshot.docs) {
              const userData = userDoc.data();
              const userBets = userData.bets || [];

              userBets.forEach((bet) => {
                if (bet.gameId === gameId) {
                  const team = bet.selectedTeam;
                  const amount = bet.betAmount;

                  // Group by team
                  if (teamBetsData[team]) {
                    teamBetsData[team].bets.push(bet);
                    teamBetsData[team].totalAmount += amount;
                  }

                  // Track total bets amount for this game
                  totalAmount += amount;
                }
              });
            }

            // Add the betting data to the game object
            return {
              ...game,
              totalBetsAmount: totalAmount,
              teamBetsData,
            };
          })
        );

        // Set the state with the updated game data
        setGamesData(updatedGamesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching games data and bets:", error);
        setLoading(false);
      }
    };

    fetchAllGamesData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Render games data with betting information
  const renderGamesData = () => (
    <div>
      {gamesData.map((game) => (
        <div key={game.id}>
          <h3>{game.league} - {game.team1.name} vs {game.team2.name}</h3>
          <p>Time: {game.time}</p>
          <div>
            <h4>Teams</h4>
            <div>
              <h5>{game.team1.name}</h5>
              <img src={game.team1.logo} alt={`${game.team1.name} Logo`} width={50} />
            </div>
            <div>
              <h5>{game.team2.name}</h5>
              <img src={game.team2.logo} alt={`${game.team2.name} Logo`} width={50} />
            </div>
            <p><strong>Winner: {game.winner}</strong></p>
          </div>
          <h4>Total Bet Amount: {game.totalBetsAmount}</h4>
          <div>
            {Object.keys(game.teamBetsData).map((team) => (
              <div key={team}>
                <h5>Team: {team}</h5>
                <p>Total Bet Amount: {game.teamBetsData[team].totalAmount}</p>
                <ul>
                  {game.teamBetsData[team].bets.map((bet, index) => (
                    <li key={index}>
                      Bet Amount: {bet.betAmount} | Selected Multiplier: {bet.selectedMultiplier}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h2>Admin Panel</h2>
      {renderGamesData()}
    </div>
  );
};

export default AllBets;
