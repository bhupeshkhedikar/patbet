import { db } from "../firebase";
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
    getFirestore,
    setDoc,
    onSnapshot,
  } from "firebase/firestore";

export const updateBetsForTie = async (gameId) => {
  console.log(`Handling tie for game: ${gameId}`);
  
  const usersSnapshot = await getDocs(collection(db, "users"));

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const betsSnapshot = await getDocs(query(collection(db, "users", userId, "bets"), where("gameId", "==", gameId)));

    let totalRefund = 0;

    for (const betDoc of betsSnapshot.docs) {
      const betAmount = Number(betDoc.data().betAmount);
      
      // Update the bet status to "returned"
      await updateDoc(doc(db, "users", userId, "bets", betDoc.id), {
        status: "returned",
        winnings: betAmount,
      });
      
      totalRefund += betAmount;
    }

    if (totalRefund > 0) {
      const userRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userRef);
      let currentBalance = userDocSnapshot.exists() ? Number(userDocSnapshot.data().walletBalance) || 0 : 0;
      currentBalance += totalRefund;
      await updateDoc(userRef, { walletBalance: currentBalance });
      console.log(`Refunded ₹${totalRefund} to user ${userId}. New balance: ₹${currentBalance}`);
    }
  }
  console.log(`Completed handling tie for game: ${gameId}`);
};

export const updateBetsForGame = async (gameId, winnerTeamName) => {
  console.log(`Updating bets for game: ${gameId} | Winner: ${winnerTeamName}`);
  
  const usersSnapshot = await getDocs(collection(db, "users"));

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const betsSnapshot = await getDocs(query(collection(db, "users", userId, "bets"), where("gameId", "==", gameId)));
    
    let totalWinnings = 0;

    for (const betDoc of betsSnapshot.docs) {
      const betData = betDoc.data();
      const betStatus = betData.selectedTeam === winnerTeamName ? "won" : "lost";
      const winnings = betStatus === "won" ? Number(betData.betAmount) * Number(betData.selectedMultiplier) : 0;

      await updateDoc(doc(db, "users", userId, "bets", betDoc.id), {
        status: betStatus,
        winnings: winnings,
      });

      if (betStatus === "won") totalWinnings += winnings;
    }

    if (totalWinnings > 0) {
      const userRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userRef);
      let currentBalance = userDocSnapshot.exists() ? Number(userDocSnapshot.data().walletBalance) || 0 : 0;
      currentBalance += totalWinnings;
      await updateDoc(userRef, { walletBalance: currentBalance });
      console.log(`Updated wallet balance for user ${userId}: ₹${currentBalance}`);
    }
  }
  console.log(`Completed updating bets for game: ${gameId}`);
};
