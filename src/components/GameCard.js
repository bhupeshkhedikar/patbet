import React, { useEffect, useState } from "react";
import BetNowModal from "./BetNowModal";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const GameCard = ({ game }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(5000);
  const [betEnabled, setBetEnabled] = useState(game.isBetEnabled);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeDifference, setTimeDifference] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      calculateTimeDifference(now);
    }, 1000); // Update every second for real-time countdown

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const gamesRef = collection(db, "games");

    const unsubscribe = onSnapshot(gamesRef, (querySnapshot) => {
      const gameList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedGame = gameList.find((g) => g.id === game.id);
      if (updatedGame) {
        setBetEnabled(updatedGame.isBetEnabled);
      }
    });

    return () => unsubscribe();
  }, [game.id]);

  // Function to calculate time difference from 5 PM
  const calculateTimeDifference = (now) => {
    const fivePM = new Date();
    fivePM.setHours(17, 0, 0, 0); // Set to 5:00 PM today

    const diff = fivePM - now; // Difference in milliseconds
    const isPastFivePM = diff < 0;

    const absoluteDiff = Math.abs(diff);
    const hours = Math.floor(absoluteDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000);

    const timeString = `${hours}h ${minutes}m ${seconds}s`;
    setTimeDifference(isPastFivePM ? `-${timeString}` : timeString);
  };

  const isPastFivePM = currentTime.getHours() >= 17;

  return (
    <div className="game-card">
      <p className="league-title">
        {game.league} {isPastFivePM ? "(Live Bet Ends)" : "(Bet till 5 PM)"}
      </p>
      <p className="timer" >
        {isPastFivePM
          ? `Bet closed ${timeDifference} ago`
          : `Time left: ${timeDifference}`}
      </p>
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
        disabled={!betEnabled || isPastFivePM}
      >
        {betEnabled && !isPastFivePM ? "Bet Now" : "Betting Over"}
      </button>
      <BetNowModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        gameId={game.id}
        team1={game.team1.name}
        team2={game.team2.name}
      />
    </div>
  );
};

export default GameCard;
