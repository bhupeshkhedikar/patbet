import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Result.css';

const Result = () => {
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }

    const resultsRef = collection(db, 'results');

    // Listen for real-time updates
    const unsubscribe = onSnapshot(resultsRef, (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleVote = async (gameId, team) => {
    if (!user) {
      alert("You must be logged in to vote.");
      return;
    }

    const gameRef = doc(db, 'results', gameId);
    const userVoteRef = doc(db, `results/${gameId}/votes`, user.uid);

    try {
      const userVoteSnap = await getDoc(userVoteRef);

      if (userVoteSnap.exists()) {
        alert("You have already voted for this game!");
        return;
      }

      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) {
        console.error('Game not found in results collection.');
        return;
      }

      const gameData = gameSnap.data();

      // Ensure votes field exists before updating
      if (!gameData.votes) {
        await setDoc(gameRef, { votes: { team1: 0, team2: 0 } }, { merge: true });
      }

      // Increment the selected team's vote count
      await updateDoc(gameRef, {
        [`votes.${team}`]: increment(1),
      });

      // Store that the user has voted
      await setDoc(userVoteRef, { voted: true });

    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  return (
    <div className="result-container">
      <h2 style={{color:'yellow'}}>कौन जितेगा - अपनी राय दे !</h2>
      {games.length === 0 ? (
        <p>No games available for voting.</p>
      ) : (
        games.map(game => {
          const totalVotes = (game.votes?.team1 || 0) + (game.votes?.team2 || 0);
          const team1Percentage = totalVotes ? ((game.votes?.team1 || 0) / totalVotes) * 100 : 50;
          const team2Percentage = totalVotes ? ((game.votes?.team2 || 0) / totalVotes) * 100 : 50;

          return (
            <div key={game.id} className="game-result">
              <h3 style={{color:'lightgreen'}}>{game.league}</h3>
              <p style={{fontSize: '14px',color: '#b0b3c5'}}>
                {game.team1.name} vs {game.team2.name}
              </p>

              <div className="vote-buttons">
                <button onClick={() => handleVote(game.id, 'team1')}>
                  {game.team1.name} <p style={{ fontSize: '10px' }}>{team1Percentage.toFixed(1)}%</p>
                </button>
                <button onClick={() => handleVote(game.id, 'team2')}>
                  {game.team2.name} <p style={{ fontSize: '10px' }}>{team2Percentage.toFixed(1)}%</p>
                </button>
              </div>

              {/* Progress Bars */}
              <div className="progress-bar team1">
                <div className="progress-fill" style={{ width: `${team1Percentage}%` }}></div>
              </div>
              <div className="progress-bar team2">
                <div className="progress-fill" style={{ width: `${team2Percentage}%` }}></div>
              </div>

              <div className="compact-percentage">
                <span className="team1-pct">{team1Percentage.toFixed(1)}%</span>
                <span className="vs-divider"> VS </span>
                <span className="team2-pct">{team2Percentage.toFixed(1)}%</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Result;
