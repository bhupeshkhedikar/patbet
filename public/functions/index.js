const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.updateBetsInstant = functions.firestore
  .document("games/{gameId}")
  .onUpdate(async (change, context) => {
    const gameId = context.params.gameId;
    const newData = change.after.data();

    if (!newData.winner) return null;

    const winnerTeam = newData.winner;
    const commissionRate = 0.1;

    const usersSnapshot = await admin.firestore().collection("users").get();

    const batch = admin.firestore().batch();

    usersSnapshot.forEach(async userDoc => {
      const userId = userDoc.id;
      const betsRef = admin.firestore()
        .collection("users")
        .doc(userId)
        .collection("bets");
      
      const betsSnapshot = await betsRef
        .where("gameId", "==", gameId)
        .get();

      let walletBalance = userDoc.data().walletBalance || 0;

      betsSnapshot.forEach(betDoc => {
        const bet = betDoc.data();
        let status = (bet.selectedTeam === winnerTeam) ? "won" : "lost";
        let winnings = status === "won" ? bet.betAmount * bet.odds : 0;

        if (winnings > 0) winnings -= winnings * commissionRate;

        batch.update(betDoc.ref, { status, winnings });

        if (status === "won") {
          walletBalance += winnings;
        }
      });

      batch.update(admin.firestore().collection("users").doc(userId), {
        walletBalance
      });
    });

    await batch.commit();
    return true;
  });
