import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot,getDoc,doc } from "firebase/firestore";
import "./Result.css"; // Make sure the CSS file is imported

const Results = () => {
  const [games, setGames] = useState([]);
  const [tableTitle, setTableTitle] = useState("Game Results");
  useEffect(() => {
    const gamesRef = collection(db, "results");
  
    // Listen for real-time updates
    const unsubscribe = onSnapshot(gamesRef, (snapshot) => {
      const gamesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesList);
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  useEffect(() => {
    const titleRef = doc(db, "settings", "tableTitle");

    const unsubscribe = onSnapshot(titleRef, (docSnap) => {
      if (docSnap.exists()) {
        setTableTitle(docSnap.data().title);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return (
    <div className="user-results-table">
          <h3 style={{textAlign:'center', fontSize:'18px'}}>निकाल</h3>
          <h3 style={{textAlign:'center',color:'yellow',fontSize:'18px'}}>शंकरपट :- {tableTitle}</h3> 
      <table>
        <thead>
          <tr>
            <th>दान</th>
            <th>जोडी</th>
            <th>निकाल</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.league}</td>
              <td>
                <div className="teams">
                  <span>{game.team1.name}</span> vs{" "}
                  <span>{game.team2.name}</span>
                </div>
              </td>
              <td className="winner">
                {game.winner ? (
                  <span className="winner-badge">{game.winner}</span>
                ) : (
                  <span className="pending">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
