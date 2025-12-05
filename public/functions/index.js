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

      betsSnapshot.forEach(betDoc => {
        const bet = betDoc.data();

        let status = "";
        let winnings = 0;

        // 🟧 CASE 1 → TIE → Return full bet amount
        if (winnerTeam === "tie") {
          status = "tie";
          winnings = bet.betAmount; // return as-is
        }
        // 🟩 CASE 2 → Normal Win/Loss
        else {
          status = bet.selectedTeam === winnerTeam ? "won" : "lost";
          winnings = status === "won" ? bet.betAmount * bet.odds : 0;

          if (status === "won") {
            winnings -= winnings * commissionRate; // deduct commission
          }
        }

        // update bet document
        batch.update(betDoc.ref, { status, winnings });

        // update wallet
        if (status === "won" || status === "tie") {
          walletBalance += winnings;
        }
      });

      // update final wallet balance
      batch.update(admin.firestore().collection("users").doc(userId), {
        walletBalance
      });
    }

    await batch.commit();
    return true;
  });