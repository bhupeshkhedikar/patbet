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
      updateBettingStatus(now);
    }, 1000); // Update every second

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

  const updateBettingStatus = (now) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Betting start time (7:30 PM today)
    const betStartTime = new Date(today.setHours(19, 30, 0, 0));

    // Betting end time (7:00 AM tomorrow)
    const betEndTime = new Date(tomorrow.setHours(7, 0, 0, 0));

    if (now < betStartTime) {
      setTimeDifference(`Betting starts at 7:30 PM`);
    } else if (now >= betStartTime && now <= betEndTime) {
      const diff = betEndTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeDifference(`Time left: ${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeDifference(`Betting Closed`);
    }
  };

  const today = new Date();
  const betStartTime = new Date(today.setHours(19, 30, 0, 0));
  const betEndTime = new Date(today.setHours(7, 0, 0, 0));
  const isBeforeStart = currentTime < betStartTime;
  const isAfterEnd = currentTime > betEndTime && currentTime < betStartTime;

  return (
    <div className="game-card">
      <p className="league-title">{game.league}</p>
      <p className="timer">{timeDifference}</p>

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
        disabled={!betEnabled || isBeforeStart || isAfterEnd}
      >
        {isBeforeStart ? "Betting Not Started" : isAfterEnd ? "Betting Over" : "Bet Now"}
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
