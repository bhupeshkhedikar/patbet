import { db } from "../firebase";
import { collection, doc, updateDoc, getDoc, onSnapshot,getDocs,query,where } from "firebase/firestore";
import { useEffect } from "react";

const useGameWinnerListener = (isManualUpdate = false) => {
  useEffect(() => {
    if (isManualUpdate) return; // Disable listener if it's a manual update

    const gamesRef = collection(db, "games");

    // Listen for any game updates in real-time
    const unsubscribe = onSnapshot(gamesRef, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "modified") {
          const gameData = change.doc.data();
          const gameId = change.doc.id;
          const winnerTeamKey = gameData.winner; // This should be "team1" or "team2"

          console.log(`Game ${gameId} winner updated to: ${winnerTeamKey}`);

          if (winnerTeamKey) {
            // Extract the winner's name correctly
            const winnerTeamName = gameData[winnerTeamKey]?.name;
            if (winnerTeamName) {
              // Use the game ID to correctly update bets for that specific game
              await updateBetsForGame(gameId, winnerTeamName);
            } else {
              console.error(`Winner team name is undefined for game ${gameId}`);
            }
          }
        }
      });
    });

    return () => unsubscribe(); // Cleanup listener
  }, [isManualUpdate]);
};
// Function to update bets based on the winner
const updateBetsForGame = async (gameId, winnerTeamName) => {
  console.log(`Updating bets for game: ${gameId} | Winner: ${winnerTeamName}`);

  const usersRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersRef);

  // Process each user sequentially
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const betsRef = collection(db, "users", userId, "bets");
    const betsQuery = query(betsRef, where("gameId", "==", gameId));

    const betsSnapshot = await getDocs(betsQuery);

    // Fetch the user's current wallet balance once
    const userRef = doc(db, "users", userId);
    const userDocSnapshot = await getDoc(userRef);
    let currentBalance = userDocSnapshot.exists() ? Number(userDocSnapshot.data().walletBalance) || 0 : 0;

    let totalWinnings = 0; // Variable to accumulate total winnings
    let totalBetAmount = 0; // Variable to accumulate total bet amount

    // Process each bet sequentially
    for (const betDoc of betsSnapshot.docs) {
      const betData = betDoc.data();
      const betId = betDoc.id;

      const betStatus = betData.selectedTeam === winnerTeamName ? "won" : "lost";

      // Calculate winnings for this bet
      const betAmount = Number(betData.betAmount); // Bet amount as number
      const selectedMultiplier = Number(betData.selectedMultiplier); // Multiplier as number
      const winnings = betStatus === "won" ? betAmount * selectedMultiplier : 0;

      console.log(`Updating bet ${betId}: Status -> ${betStatus}, Winnings -> ₹${winnings}`);

      // Update the bet status in Firestore
      await updateDoc(doc(db, "users", userId, "bets", betId), {
        status: betStatus,
        winnings: winnings,
      });

      // Accumulate winnings and bet amounts if the bet is won
      if (betStatus === "won") {
        totalWinnings += winnings; // Add the winnings for this bet
      }
      totalBetAmount += betAmount; // Add the bet amount (whether won or lost)
    }

    // After processing all bets, update the wallet balance
    if (totalWinnings > 0 || totalBetAmount > 0) {
      // Adjust the balance: Add total winnings and subtract total bet amount
      currentBalance += totalWinnings; // Add winnings for all won bets
      currentBalance -= totalBetAmount; // Deduct the total bet amount

      await updateDoc(userRef, { walletBalance: currentBalance }); // Update Firestore with the new balance
      console.log(`Updated wallet balance for user ${userId}: ₹${currentBalance}`);
    }
  }
};





export default useGameWinnerListener;