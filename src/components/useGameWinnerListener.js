import { db } from "../firebase";
import { collection, doc, updateDoc, getDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";

const updateBetsForTie = async (gameId) => {
  console.log(`Handling tie for game: ${gameId}`);

  const usersSnapshot = await getDocs(collection(db, "users"));
  const refundPromises = usersSnapshot.docs.map(async (userDoc) => {
    const userId = userDoc.id;
    const betsRef = collection(db, "users", userId, "bets");
    const betsSnapshot = await getDocs(query(betsRef, where("gameId", "==", gameId)));

    let totalRefund = 0;
    const betUpdates = betsSnapshot.docs.map(async (betDoc) => {
      const betAmount = Number(betDoc.data().betAmount);

      // Update bet status to "returned"
      await updateDoc(doc(db, "users", userId, "bets", betDoc.id), {
        status: "returned",
        winnings: betAmount,
      });

      totalRefund += betAmount;
    });

    await Promise.all(betUpdates);

    if (totalRefund > 0) {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      let currentBalance = userSnapshot.exists() ? Number(userSnapshot.data().walletBalance) || 0 : 0;

      currentBalance += totalRefund;
      await updateDoc(userRef, { walletBalance: currentBalance });

      console.log(`Refunded 💵${totalRefund} to user ${userId}. New balance: 💵${currentBalance}`);
    }
  });

  await Promise.all(refundPromises);
  console.log(`Completed handling tie for game: ${gameId}`);
};

const useGameWinnerListener = (isManualUpdate = false) => {
  useEffect(() => {
    if (isManualUpdate) return;

    const unsubscribe = onSnapshot(collection(db, "games"), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "modified") {
          const gameData = change.doc.data();
          const gameId = change.doc.id;
          const winnerTeamKey = gameData.winner;

          console.log(`Game ${gameId} winner updated to: ${winnerTeamKey}`);

          if (winnerTeamKey) {
            if (winnerTeamKey === "tie") {
              await updateBetsForTie(gameId);
            } else {
              const winnerTeamName = gameData[winnerTeamKey]?.name;
              if (winnerTeamName) {
                await updateBetsForGame(gameId, winnerTeamName);
              } else {
                console.error(`Winner team name is undefined for game ${gameId}`);
              }
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [isManualUpdate]);
};

const updateBetsForGame = async (gameId, winnerTeamName) => {
  console.log(`Updating bets for game: ${gameId} | Winner: ${winnerTeamName}`);

  const usersSnapshot = await getDocs(collection(db, "users"));

  const updatePromises = usersSnapshot.docs.map(async (userDoc) => {
    const userId = userDoc.id;
    const betsSnapshot = await getDocs(query(collection(db, "users", userId, "bets"), where("gameId", "==", gameId)));

    let totalWinnings = 0;

    const betUpdates = betsSnapshot.docs.map(async (betDoc) => {
      const betData = betDoc.data();
      const betAmount = Number(betData.betAmount);
      const selectedMultiplier = Number(betData.selectedMultiplier);

      const betStatus = betData.selectedTeam === winnerTeamName ? "won" : "lost";
      const winnings = betStatus === "won" ? betAmount * selectedMultiplier : 0;

      totalWinnings += winnings;

      await updateDoc(doc(db, "users", userId, "bets", betDoc.id), {
        status: betStatus,
        winnings: winnings,
      });

      console.log(`Updated bet ${betDoc.id}: Status -> ${betStatus}, Winnings -> 💵${winnings}`);
    });

    await Promise.all(betUpdates);

    if (totalWinnings > 0) {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      let currentBalance = userSnapshot.exists() ? Number(userSnapshot.data().walletBalance) || 0 : 0;

      currentBalance += totalWinnings;
      await updateDoc(userRef, { walletBalance: currentBalance });

      console.log(`Updated कॉइन बैलेंस for user ${userId}: 💵${currentBalance}`);
    }
  });

  await Promise.all(updatePromises);
  console.log(`Completed updating bets for game: ${gameId}`);
};

export default useGameWinnerListener;
