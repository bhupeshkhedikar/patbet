import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  writeBatch
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const auth = getAuth();

export const updateBetsForTie = async (gameId) => {
  console.log(`Handling tie for game: ${gameId}`);

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const batch = writeBatch(db);

    const balanceUpdates = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const betsQuery = query(
        collection(db, "users", userId, "bets"),
        where("gameId", "==", gameId)
      );
      const betsSnapshot = await getDocs(betsQuery);

      let totalRefund = 0;

      for (const betDoc of betsSnapshot.docs) {
        const betData = betDoc.data();

        if (["won", "lost", "returned"].includes(betData.status)) {
          console.log(`Skipping bet ${betDoc.id} for user ${userId} with status: ${betData.status}`);
          continue;
        }

        const betAmount = Number(betData.betAmount);
        totalRefund += betAmount;

        batch.update(doc(db, "users", userId, "bets", betDoc.id), {
          status: "returned",
          winnings: betAmount,
        });
      }

      if (totalRefund > 0) {
        balanceUpdates.push({ userId, totalRefund });
      }
    }

    await batch.commit();
    console.log(`Bets updated successfully for tie.`);

    // Process wallet balance updates in parallel
    await Promise.all(
      balanceUpdates.map(async ({ userId, totalRefund }) => {
        const userRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userRef);
        let currentBalance = userSnapshot.exists()
          ? Number(userSnapshot.data().walletBalance) || 0
          : 0;

        currentBalance += totalRefund;
        await updateDoc(userRef, { walletBalance: currentBalance });

        console.log(
          `Refunded ₹${totalRefund} to user ${userId}. New balance: ₹${currentBalance}`
        );
      })
    );

    console.log(`Completed handling tie for game: ${gameId}`);
  } catch (error) {
    console.error("Error handling tie:", error);
  }
};



export const updateBetsForGame = async (gameId, winnerTeamName) => {
  console.log(`Updating bets for game: ${gameId} | Winner: ${winnerTeamName}`);

  const usersSnapshot = await getDocs(collection(db, "users"));

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const betsSnapshot = await getDocs(
      query(
        collection(db, "users", userId, "bets"),
        where("gameId", "==", gameId)
      )
    );

    let totalWinnings = 0;

    for (const betDoc of betsSnapshot.docs) {
      const betData = betDoc.data();

      // Skip bets that already have a status of "won", "lost", or "returned"
      if (["won", "lost", "returned"].includes(betData.status)) {
        console.log(`Skipping bet ${betDoc.id} for user ${userId} with status: ${betData.status}`);
        continue;
      }

      const betStatus = betData.selectedTeam === winnerTeamName ? "won" : "lost";
      let winnings =
        betStatus === "won"
          ? Number(betData.betAmount) * Number(betData.selectedMultiplier)
          : 0;

      if (betStatus === "won") {
        const commission = winnings * 0.2; // Deduct 20% commission
        winnings -= commission;
        totalWinnings += winnings;
      }

      await updateDoc(doc(db, "users", userId, "bets", betDoc.id), {
        status: betStatus,
        winnings: winnings,
      });
    }

    if (totalWinnings > 0) {
      const userRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userRef);
      let currentBalance = userDocSnapshot.exists()
        ? Number(userDocSnapshot.data().walletBalance) || 0
        : 0;
      currentBalance += totalWinnings;

      await updateDoc(userRef, { walletBalance: currentBalance });
      console.log(
        `Updated wallet balance for user ${userId}: ₹${currentBalance}`
      );
    }
  }

  console.log(`Completed updating bets for game: ${gameId}`);
};

