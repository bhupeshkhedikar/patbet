import React, { useEffect, useState } from "react";
import BetNowModal from "./BetNowModal";
import { db } from "../firebase";
import BetStatusListener from "./BetStatusListener";
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

const GameCard = ({ game }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(5000); // Initial balance
  const [betEnabled, setBetEnabled] = useState(game.isBetEnabled);
  // useEffect(() => {
  // console.log(game,'gmaes')
  // }, [])
  useEffect(() => {
    const gamesRef = collection(db, "games"); // Reference to Firestore games collection

    const unsubscribe = onSnapshot(gamesRef, (querySnapshot) => {
      const gameList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedGame = gameList.find((g) => g.id === game.id); // Find the updated game
      if (updatedGame) {
        setBetEnabled(updatedGame.isBetEnabled); // Update the local state based on the fetched data
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [game.id]);

  return (
    <><div className="game-card">
      <p className="league-title">{game.league}</p>
      <div className="match-container">
        <div className="team">
          <img src={game.team1.logo} alt={game.team1.name} className="team-logo" />
          <p className="team-name">{game.team1.name}</p>
        </div>
        <div className="score">Vs</div>
        <div className="team">
          <img src={game.team2.logo} alt={game.team2.name} className="team-logo" />
          <p className="team-name">{game.team2.name}</p>
        </div>
      </div>
      <p className="match-time">{game.time}</p>
    <button
        className="bet-button"
        onClick={() => setModalOpen(true)}
        disabled={!betEnabled} // Disable button if betting is not enabled
      >
        {betEnabled ? "Bet Now" : "Betting Over"}
      </button>
      <BetNowModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        gameId={game.id}
        team1={game.team1.name}
        team2={game.team2.name} />
    </div></>
  );
};

export default GameCard;
