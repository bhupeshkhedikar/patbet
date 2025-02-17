import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Import Firebase Firestore instance
import { collection, getDocs,doc,getDoc,onSnapshot } from "firebase/firestore";
import GameCard from "./GameCard";
import AutoSlider from "./AutoSlider";
import GoogleAd from "./GoogleAd";
import AdBanner from "./AdBanner";

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const gamesCollection = collection(db, "games"); // Firestore collection name

    // **Use onSnapshot for real-time updates**
    const unsubscribe = onSnapshot(gamesCollection, (snapshot) => {
      const gamesList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt); // Sorting by latest games first

      setGames(gamesList);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
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

  if (loading) return <div className="loader-container">
  <div className="loader"></div>
  <p>Loading Games...</p>
</div>;

  return (
    <>

    <div className="game-list">
<AdBanner/>
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
      <AdBanner/>
      {/* <GoogleAd 
        client="ca-pub-9925801540177456" 
        slot="4077906455" 
      /> */}
      </>
  );
};

export default GameList;
