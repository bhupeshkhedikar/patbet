import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Import Firebase Firestore instance
import { collection, getDocs } from "firebase/firestore";
import GameCard from "./GameCard";

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCollection = collection(db, "games"); // Firestore collection name
        const gamesSnapshot = await getDocs(gamesCollection);
        const gamesList = gamesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          
        }));
        console.log(gamesList)
        setGames(gamesList);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <p style={{textAlign:'center',margin:'20px'}}>Loading games...</p>;

  return (
    <>

    <div className="game-list">
      
      <h2 className="section-title">Upcoming Games</h2>
        <h3 style={{ textAlign: 'center', margin: '10px', color: 'yellow' }}>पिंपळगाव शंकरपट -१ से १२ पर होड लगाना Live हो चुका हे </h3>
      {games.length > 0 ? (
        games.map((game) => <GameCard key={game.id} game={game} />)
      ) : (
        <p>No upcoming games</p>
      )}
      </div>
      </>
  );
};

export default GameList;
