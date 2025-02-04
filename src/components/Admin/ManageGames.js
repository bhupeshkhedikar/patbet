import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
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
import '../Admin/AdminPanel.css'
import AdminPanel from './../AdminPanel';


const ManageGames = () => {
  return (
    
    <>
    
    <div className="game-selection">
          <h2>Select Game and Winner</h2>
          <div className="select-group">
            <label>Select Game</label>
            <select
              value={selectedGame}
              onChange={e => setSelectedGame(e.target.value)}
            >
              <option value="">Select Game</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.league} - {game.team1.name} vs {game.team2.name}
                </option>
              ))}
            </select>
          </div>

          {selectedGame && (
            <div className="select-group">
              <label>Select Winner</label>
              <select
                value={selectedWinner}
                onChange={e => setSelectedWinner(e.target.value)}
              >
                <option value="">Select Winner</option>
                <option value="tie">Tie</option>
                <option
                  value={
                    games.find(game => game.id === selectedGame)?.team1.name
                  }
                >
                  {games.find(game => game.id === selectedGame)?.team1.name}
                </option>
                <option
                  value={
                    games.find(game => game.id === selectedGame)?.team2.name
                  }
                >
                  {games.find(game => game.id === selectedGame)?.team2.name}
                </option>
              </select>
            </div>
          )}

          <button className="set-winner-btn" onClick={handleSetWinner}>
            Set Winner
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
      <div className="add-game">
          <h2>Add New Game</h2>
          <input
            type="text"
            placeholder="League Name"
            value={newGame.league}
            onChange={e => setNewGame({ ...newGame, league: e.target.value })}
          />
          <input
            type="text"
            placeholder="Team 1 Name"
            value={newGame.team1.name}
            onChange={e =>
              setNewGame({
                ...newGame,
                team1: { ...newGame.team1, name: e.target.value },
              })
            }
          />
          <input
            type="text"
            placeholder="Team 2 Name"
            value={newGame.team2.name}
            onChange={e =>
              setNewGame({
                ...newGame,
                team2: { ...newGame.team2, name: e.target.value },
              })
            }
          />
          <input
            type="text"
            placeholder="Game Time"
            value={newGame.time}
            onChange={e => setNewGame({ ...newGame, time: e.target.value })}
          />
          <select style={{ marginBottom:'20px'}} value={newGame.isBetEnabled} onChange={(e) => setNewGame({ ...newGame, isBetEnabled: e.target.value === "true" })}>
        <option value="false">Disable Betting</option>
         <option value="true">Enable Betting</option>
         </select>

          
          <button className="add-game-btn" onClick={handleAddGame}>
            Add Game
          </button>
        </div>

    </>
   )
}
export default ManageGames