import { db } from "../firebase";
import { collection, doc, updateDoc, getDoc, onSnapshot,getDocs,query,where } from "firebase/firestore";
import { useEffect } from "react";

const updateBetsForTie = async (gameId) => {
  console.log(`Handling tie for game: ${gameId}`);

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

    // Process each bet sequentially
    for (const betDoc of betsSnapshot.docs) {
      const betData = betDoc.data();
      const betId = betDoc.id;

      const betAmount = Number(betData.betAmount); // Bet amount as number
      const betStatus = betData.status;
      const winnings = betStatus === 'won' ? betAmount * 2 : 0; // Double winnings for "win"

      // Update the bet status in Firestore
      await updateDoc(doc(db, "users", userId, "bets", betId), {
        status: betStatus === 'won' ? "won" : "returned", // Status: "won" or "returned"
        winnings: winnings,        // If won, double the bet amount as winnings
      });

      // Update balance: add winnings for "won" and return bet amount for "tie"
      currentBalance += betStatus === 'won' ? winnings : betAmount;

      await updateDoc(userRef, { walletBalance: currentBalance }); // Update Firestore with the new balance
      console.log(`Updated bet status for user ${userId}: Bet amount: ₹${betAmount}, Winnings: ₹${winnings}, Updated balance: ₹${currentBalance}`);
    }
  }
};

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
          const winnerTeamKey = gameData.winner; // This could be "team1", "team2", or "tie"

          console.log(`Game ${gameId} winner updated to: ${winnerTeamKey}`);

          if (winnerTeamKey) {
            if (winnerTeamKey === "tie") {
              console.log(`Game ${gameId} ended in a tie. Returning bet amounts to users.`);
              await updateBetsForTie(gameId); // Handle tie scenario
            } else {
              // Extract the winner's name correctly for team1 or team2
              const winnerTeamName = gameData[winnerTeamKey]?.name;
              if (winnerTeamName) {
                // Use the game ID to correctly update bets for that specific game
                await updateBetsForGame(gameId, winnerTeamName);
              } else {
                console.error(`Winner team name is undefined for game ${gameId}`);
              }
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

      // Determine the bet status
      const betStatus = winnerTeamName === "tie" ? "tie" : (betData.selectedTeam === winnerTeamName ? "won" : "lost");

      // Calculate winnings or refund
      const betAmount = Number(betData.betAmount); // Bet amount as number
      const selectedMultiplier = Number(betData.selectedMultiplier); // Multiplier as number
      const winnings = betStatus === "won" ? betAmount * selectedMultiplier : (betStatus === "tie" ? betAmount : 0);

      console.log(`Updating bet ${betId}: Status -> ${betStatus}, Winnings -> ₹${winnings}`);

      // Update the bet status in Firestore
      await updateDoc(doc(db, "users", userId, "bets", betId), {
        status: betStatus,
        winnings: winnings,
      });

      // Accumulate winnings and bet amounts if the bet is won or tied
      if (betStatus === "won") {
        totalWinnings += winnings; // Add the winnings for this bet
      } else if (betStatus === "tie") {
        totalWinnings += winnings; // Refund the bet amount for tie
      }
      totalBetAmount += betAmount; // Add the bet amount (whether won, lost, or tie)
    }

    // After processing all bets, update the wallet balance
    if (totalWinnings > 0 || totalBetAmount > 0) {
      // Adjust the balance: Add total winnings or refund for tie
      currentBalance += totalWinnings; // Add winnings or refunded amount for all bets
      currentBalance -= totalBetAmount; // Deduct the total bet amount (if it was a loss)

      await updateDoc(userRef, { walletBalance: currentBalance }); // Update Firestore with the new balance
      console.log(`Updated wallet balance for user ${userId}: ₹${currentBalance}`);
    }
  }
};






export default useGameWinnerListener;