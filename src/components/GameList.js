import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Import Firebase Firestore instance
import { collection, getDocs,doc,getDoc, } from "firebase/firestore";
import GameCard from "./GameCard";
import AutoSlider from "./AutoSlider";

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

   const announcementDocRef = doc(db, "announcements", "mainAnnouncement");
  
    useEffect(() => {
      fetchAnnouncement();
    }, []);
  
    const fetchAnnouncement = async () => {
      const docSnap = await getDoc(announcementDocRef);
      if (docSnap.exists()) {
        setMessage(docSnap.data().message);
      }
    };

  if (loading) return <p style={{textAlign:'center',margin:'20px'}}>Loading games...</p>;

  return (
    <>

    <div className="game-list">

      <h2 className="section-title">Upcoming Games</h2>
<AutoSlider/>
        {
          message ? (
          
             <p style={{ textAlign: 'center', margin: '10px', color: 'yellow', fontSize:'14px' , fontWeight:'bold' }}>{message}</p>
          ) : (
            <p className="text-center text-white mt-4">No announcement available</p>
          )
        }
         {/* <div className="help-button-container">
      <a href="https://forms.gle/dAv67wv4J7RfpjdK8" target="_blank" rel="noopener noreferrer" className="help-button">
      समस्या समाधान
      </a>
    </div> */}
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
