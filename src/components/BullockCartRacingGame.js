import React, { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const cartNames = [
  "गोल्डी और सिल्वर","पर्ल और डायमंड","वीर और वरद","शक्ति और संजीवनी",
  "भैरव और भूपाल","रणवीर और रणधीर","दत्ता और दामोदर","गणेश और गजानन",
  "सम्राट और सूर्यवीर","यशवंत और युगंधर","केसर और कृष्णा","मल्लेश और मुरलीधर",
  "अग्निवीर और तेजस्वी","प्रताप और प्रभाकर","शिवराज और शौर्यवीर","धनराज और देवेंद्र",
  "माणिक और मोती","सागर और संदीप","आदित्य और अविनाश","दीपक और दिगंबर",
  "सिंहगर्जना और सिंहशक्ती","गजेंद्र और गरुड़वीर","सिद्धी और समाधी","अमर और अनंता",
  "ध्रुव और दीपक","आकाश और अनिल","परशुराम और पांडुरंग","भवानी और भैरवी",
  "रणधीर और रणजीत","समर्थ और सत्यं","कस्तूरी और कमल","गंगाधर और गोविंद",
  "महादेव और मयूरेश","शिवदास और सूर्यदास","जगत और जनार्दन","चंद्रहास और चंद्रशेखर"
];

const getRandomNames = () =>
  cartNames[Math.floor(Math.random() * cartNames.length)];

const BullockCartRacingGame = () => {
  const [tracks, setTracks] = useState([
    { id: 1, cart: { id: 1, name: getRandomNames(), position: 0 } },
    { id: 2, cart: { id: 2, name: getRandomNames(), position: 0 } },
  ]);

  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);

  const [selectedCart, setSelectedCart] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [walletBalance, setWalletBalance] = useState(0);

  const [showResultModal, setShowResultModal] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);

  const [isWin, setIsWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const user = auth.currentUser;

  const startSound = useRef(null);
  const runningSound = useRef(null);
  const winSound = useRef(null);
  const lossSound = useRef(null);

  useEffect(() => {
    startSound.current = new Audio("/sounds/start.wav");
    runningSound.current = new Audio("/sounds/cart_moving.wav");
    winSound.current = new Audio("/sounds/victory.wav");
    lossSound.current = new Audio("/sounds/loss.wav");
    runningSound.current.loop = true;
  }, []);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setWalletBalance(snap.data().walletBalance || 0);
      }
    });

    return () => unsub();
  }, [user]);

  /* -----------------------------------
            WINNER LOGIC
  ------------------------------------*/
  const decideWinner = async (currentTracks) => {
    const winner = currentTracks.reduce((a, b) =>
      a.cart.position > b.cart.position ? a : b
    );

    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    if (selectedCart === winner.cart.id) {
      const winAmountCalc = betAmount * 2;

      setIsWin(true);
      setWinAmount(winAmountCalc);
      setShowResultModal(true);

      const newBalance = walletBalance + winAmountCalc;
      await updateDoc(userRef, { walletBalance: newBalance });

      setWalletBalance(newBalance);
      winSound.current?.play();
    } else {
      setIsWin(false);
      setWinAmount(betAmount);
      setShowResultModal(true);
      lossSound.current?.play();
    }

    setTimeout(() => setShowResultModal(false), 3000);
  };

  /* -----------------------------------
            START RACE
  ------------------------------------*/
  const startRace = async () => {
    if (!user) return alert("कृपया पहले लॉगिन करें!");
    if (!selectedCart) return alert("कृपया एक बैलगाड़ी चुनें!");
    if (betAmount <= 0) return alert("कृपया सही राशि दर्ज करें!");
    if (betAmount > walletBalance)
      return alert("वॉलेट में पर्याप्त बैलेंस नहीं है!");

    const userRef = doc(db, "users", user.uid);
    const newBal = walletBalance - betAmount;

    await updateDoc(userRef, { walletBalance: newBal });
    setWalletBalance(newBal);

    startSound.current?.play();
    setTimeout(() => runningSound.current?.play(), 300);

    setShowBetModal(false);
    setRaceStarted(true);
    setRaceFinished(false);

    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        cart: { ...t.cart, position: 0 },
      }))
    );
  };

  /* -----------------------------------
         RACE MOVEMENT ANIMATION
  ------------------------------------*/
  useEffect(() => {
    if (raceStarted && !raceFinished) {
      const interval = setInterval(() => {
        setTracks((prev) =>
          prev.map((track) => ({
            ...track,
            cart: {
              ...track.cart,
              position: track.cart.position + Math.random() * 10,
            },
          }))
        );
      }, 90);
      return () => clearInterval(interval);
    }
  }, [raceStarted, raceFinished]);

  /* -----------------------------------
            CHECK FINISH
  ------------------------------------*/
  useEffect(() => {
    const finished = tracks.some((t) => t.cart.position >= 500);

    if (finished) {
      runningSound.current?.pause();
      setRaceFinished(true);
      setRaceStarted(false);
      decideWinner(tracks);
    }
  }, [tracks]);

  /* -----------------------------------
             RESET GAME
  ------------------------------------*/
  const resetGame = () => {
    setRaceStarted(false);
    setRaceFinished(false);
    setSelectedCart(null);
    setBetAmount(10);

    setTracks([
      { id: 1, cart: { id: 1, name: getRandomNames(), position: 0 } },
      { id: 2, cart: { id: 2, name: getRandomNames(), position: 0 } },
    ]);
  };

  return (
    <div style={styles.container}>
      {/* -----------------------
            TRACK SECTION
      ------------------------- */}
      <div style={styles.trackContainer}>
        {tracks.map((track) => (
          <div key={track.id} style={styles.trackWrapper}>
            <div style={styles.track}>
              <div
                style={{
                  ...styles.cart,
                  bottom: `${track.cart.position}px`,
                }}
              >
                <img
                  src={
                    raceStarted
                      ? "/racee.gif"
                      : "https://i.ibb.co/01y6FtM/image-2-removebg-preview.png"
                  }
                  style={styles.cartImage}
                />
              </div>
            </div>
            <div style={styles.cartName}>{track.cart.name}</div>
          </div>
        ))}
      </div>

      {/* BET BUTTON */}
      {!raceStarted && !raceFinished && (
        <button
          style={styles.betOpenButton}
          onClick={() => setShowBetModal(true)}
        >
          बेट लगाएँ
        </button>
      )}

      {raceFinished && (
        <button style={styles.resetButton} onClick={resetGame}>
          फिर से खेलें
        </button>
      )}

      {/* ---------------------------
          MODERN BOTTOM SHEET MODAL
      --------------------------- */}
      {showBetModal && (
        <div
          style={bottomSheetStyles.backdrop}
          onClick={() => setShowBetModal(false)}
        >
          <div
            style={bottomSheetStyles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div style={bottomSheetStyles.dragHandle}></div>

            <h2 style={{ color: "#FFD700" }}>बेट लगाएँ</h2>

            <h3 style={{ color: "white", marginTop: "10px" }}>गाड़ी चुनें:</h3>

            <div
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              {tracks.map((track) => (
                <button
                  key={track.cart.id}
                  onClick={() => setSelectedCart(track.cart.id)}
                  style={{
                    padding: "10px",
                    background:
                      selectedCart === track.cart.id ? "green" : "chocolate",
                    borderRadius: "5px",
                    border: "none",
                    color: "white",
                  }}
                >
                  {track.cart.name}
                </button>
              ))}
            </div>

            <label
              style={{
                color: "white",
                marginTop: "15px",
                display: "block",
                textAlign: "left",
              }}
            >
              राशि दर्ज करें:
            </label>

            <input
              type="number"
              min="10"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              placeholder="न्यूनतम राशि ₹10"
              style={styles.input}
            />

            <button
              style={styles.sheetSubmitBtn}
              onClick={startRace}
            >
              Place Bet
            </button>

            <button
              style={styles.sheetCancelBtn}
              onClick={() => setShowBetModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------
           RESULT MODAL
      ---------------------------- */}
      {showResultModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            {isWin ? (
              <>
                <div style={modalStyles.emoji}>🎉</div>
                <h2 style={{ color: "#00ff99" }}>आप जीते! 🏆</h2>
                <h1 style={{ color: "#FFD700", fontSize: "38px" }}>
                  ₹{winAmount}
                </h1>
              </>
            ) : (
              <>
                <div style={modalStyles.emoji}>😔</div>
                <h2 style={{ color: "red" }}>आप हार गए</h2>
                <h1 style={{ color: "orange", fontSize: "35px" }}>
                  ₹{winAmount}
                </h1>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------- STYLES ------------------- */

const styles = {
  container: { textAlign: "center", marginBottom: "90px" },

  trackContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "20px",
  },

  trackWrapper: { textAlign: "center", width: "160px" },

  track: {
    width: "150px",
    height: window.innerWidth < 450 ? "400px" : "500px",
    background: "#a0522d",
    borderRadius: "10px",
    position: "relative",
    overflow: "hidden",
  },

  cart: {
    position: "absolute",
    left: "80%",
    transform: "translateX(-50%)",
    transition: "bottom 0.1s linear",
  },

  cartImage: { width: "70px" },

  cartName: { marginTop: "8px", color: "white" },

  betOpenButton: {
    marginTop: "15px",
    background: "#ff9800",
    color: "white",
    padding: "12px 25px",
    fontWeight: "700",
    borderRadius: "8px",
    border: "none",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid #ff4081",
    marginTop: "8px",
  },

  sheetSubmitBtn: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    background: "green",
    borderRadius: "10px",
    color: "white",
    fontWeight: "700",
    border: "none",
    fontSize: "17px",
  },

  sheetCancelBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    background: "#e91e63",
    borderRadius: "10px",
    color: "white",
    border: "none",
    fontWeight: "600",
  },

  resetButton: {
    marginTop: "15px",
    background: "#e91e63",
    color: "white",
    padding: "10px 25px",
    borderRadius: "8px",
    border: "none",
  },
};

/* ------------------ BOTTOM SHEET STYLE ------------------ */

const bottomSheetStyles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "94vh",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(3px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 999999,
    animation: "fadeIn 0.3s ease",
  },

  sheet: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(30,30,30,0.95)",
    borderTopLeftRadius: "25px",
    borderTopRightRadius: "25px",
    padding: "20px",
    animation: "slideUp 0.35s ease",
    boxShadow: "0 -5px 25px rgba(0,0,0,0.45)",
  },

  dragHandle: {
    width: "50px",
    height: "6px",
    background: "#666",
    borderRadius: "3px",
    margin: "0 auto 12px",
  },
};

/* ------------------ RESULT MODAL ------------------ */

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },

  modal: {
    background: "rgba(25,25,25,0.95)",
    borderRadius: "18px",
    padding: "25px",
    textAlign: "center",
    color: "white",
    width: "80%",
    maxWidth: "350px",
    boxShadow: "0 0 25px #00ff99",
  },

  emoji: { fontSize: "50px", marginBottom: "10px" },
};

/* ------------------ GLOBAL ANIMATIONS ------------------ */
const globalStyles = document.createElement("style");
globalStyles.innerHTML = `
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;
document.head.appendChild(globalStyles);

export default BullockCartRacingGame;
