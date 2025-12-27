exports.updateBetsInstant = functions.firestore
  .document("games/{gameId}")
  .onUpdate(async (change, context) => {
    const gameId = context.params.gameId;
    const newData = change.after.data();
    const oldData = change.before.data();

    // ✅ Only run when winner actually changes
    if (newData.winner === oldData.winner) return null;
    if (!newData.winner) return null;

    const winnerTeam = newData.winner;
    const commissionRate = 0.1;

    const usersSnapshot = await admin.firestore().collection("users").get();

    const batch = admin.firestore().batch();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      const betsRef = admin.firestore()
        .collection("users")
        .doc(userId)
        .collection("bets");

      const betsSnapshot = await betsRef
        .where("gameId", "==", gameId)
        .get();

      let walletBalance = userDoc.data().walletBalance || 0;

      for (const betDoc of betsSnapshot.docs) {
        const bet = betDoc.data();

        let status = "lost";
        let winnings = 0;

        // ✅ TIE CASE (FULL REFUND)
        if (winnerTeam === "tie") {
          status = "tie";
          winnings = Number(bet.betAmount);
        } 
        // ✅ WIN CASE
        else if (bet.selectedTeam === winnerTeam) {
          status = "won";
          winnings = Number(bet.betAmount) * Number(bet.odds);
          winnings -= winnings * commissionRate;
        }

        batch.update(betDoc.ref, { status, winnings });

        if (status === "won" || status === "tie") {
          walletBalance += winnings;
        }
      }

      batch.update(
        admin.firestore().collection("users").doc(userId),
        { walletBalance }
      );
    }

    await batch.commit();
    return true;
  });
