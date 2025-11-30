const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const COMMISSION = 0.10;
const CHUNK = 400;

exports.updateBetsInstant = onDocumentUpdated("games/{gameId}", async (event) => {
  try {
    const gameId = event.params.gameId;

    const before = event.data.before.data() || {};
    const after = event.data.after.data() || {};

    if (!after.winner || before.winner === after.winner) {
      console.log("Winner not changed → skipping.");
      return null;
    }

    const winnerTeam = after.winner;
    console.log(`Winner for ${gameId}:`, winnerTeam);

    const usersSnap = await db.collection("users").get();
    let updates = [];

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userRef = db.collection("users").doc(userId);
      let wallet = Number(userDoc.data()?.walletBalance || 0);

      const betsSnap = await userRef
        .collection("bets")
        .where("gameId", "==", gameId)
        .get();

      if (betsSnap.empty) continue;

      betsSnap.forEach((betDoc) => {
        const bet = betDoc.data();
        const betRef = betDoc.ref;

        const status = bet.selectedTeam === winnerTeam ? "won" : "lost";

        let winnings =
          status === "won" ? Number(bet.betAmount) * Number(bet.odds) : 0;

        if (winnings > 0) {
          winnings -= winnings * COMMISSION;
          wallet += winnings;
        }

        updates.push({
          ref: betRef,
          data: { status, winnings },
        });
      });

      updates.push({
        ref: userRef,
        data: { walletBalance: wallet },
      });
    }

    // batch in chunks
    for (let i = 0; i < updates.length; i += CHUNK) {
      const chunk = updates.slice(i, i + CHUNK);
      const batch = db.batch();

      chunk.forEach((u) => batch.update(u.ref, u.data));
      await batch.commit();

      console.log("Committed chunk", i / CHUNK + 1);
    }

    console.log("Winner update completed.");
    return null;
  } catch (err) {
    console.error("ERROR in updateBetsInstant:", err);
    throw err;
  }
});
