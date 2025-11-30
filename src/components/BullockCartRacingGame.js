import React, { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

/* ***************************************
   CART NAMES
**************************************** */
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

const getRandomNames = () => cartNames[Math.floor(Math.random() * cartNames.length)];

const BullockCartRacingGame = () => {
  /* ***************************************
     STATES
  **************************************** */
  const [tracks, setTracks] = useState([
    { id: 1, cart: { id: 1, name: getRandomNames(), position: 0 } },
    { id: 2, cart: { id: 2, name: getRandomNames(), position: 0 } },
  ]);

  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [selectedCartName, setSelectedCartName] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [walletBalance, setWalletBalance] = useState(0);
  
  /* ********** NEW MODAL STATES *********** */
  const [showResultModal, setShowResultModal] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const user = auth.currentUser;

  /* ********** SOUNDS *********** */
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

  /* ********** LOAD USER WALLET *********** */
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

  /* ***************************************
     DECIDE WINNER + SHOW MODAL
  **************************************** */
  const decideWinner = async (currentTracks) => {
    const winner = currentTracks.reduce((a, b) =>
      a.cart.position > b.cart.position ? a : b
    );

    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    if (selectedCart === winner.cart.id) {
      const winAmountCalc = betAmount * 2;

      setWinAmount(winAmountCalc);
      setIsWin(true);
      setShowResultModal(true);

      setTimeout(() => setShowResultModal(false), 3000);

      const newBalance = walletBalance + winAmountCalc;
      await updateDoc(userRef, { walletBalance: newBalance });
      setWalletBalance(newBalance);

      if (winSound.current) winSound.current.play();
    } else {
      setIsWin(false);
      setShowResultModal(true);

      setTimeout(() => setShowResultModal(false), 3000);

      if (lossSound.current) lossSound.current.play();
    }
  };

  /* ***************************************
     START RACE
  **************************************** */
  const startRace = async () => {
    if (!user) return alert("कृपया पहले लॉगिन करें!");
    if (!selectedCart) return alert("कृपया एक बैलगाड़ी चुनें!");
    if (betAmount <= 0) return alert("कृपया सही राशि दर्ज करें!");
    if (betAmount > walletBalance) return alert("वॉलेट में पर्याप्त बैलेंस नहीं है!");

    const userRef = doc(db, "users", user.uid);

    try {
      const newBal = walletBalance - betAmount;
      await updateDoc(userRef, { walletBalance: newBal });
      setWalletBalance(newBal);
    } catch {
      setWalletBalance(prev => prev - betAmount);
    }

    if (startSound.current) startSound.current.play();
    setTimeout(() => runningSound.current?.play(), 300);

    setRaceStarted(true);
    setRaceFinished(false);

    setTracks(prev =>
      prev.map(t => ({
        ...t,
        cart: { ...t.cart, position: 0 }
      }))
    );
  };

  /* ***************************************
     RACING ANIMATION
  **************************************** */
  useEffect(() => {
    if (raceStarted && !raceFinished) {
      const interval = setInterval(() => {
        setTracks(prev =>
          prev.map(track => ({
            ...track,
            cart: { ...track.cart, position: track.cart.position + Math.random() * 10 }
          }))
        );
      }, 90);

      return () => clearInterval(interval);
    }
  }, [raceStarted, raceFinished]);

  /* ***************************************
     CHECK FINISH
  **************************************** */
  useEffect(() => {
    const finished = tracks.some(t => t.cart.position >= 500);
    if (finished) {
      setRaceFinished(true);
      setRaceStarted(false);
      runningSound.current?.pause();
      decideWinner(tracks);
    }
  }, [tracks]);

  /* ***************************************
     RESET GAME
  **************************************** */
  const resetGame = () => {
    setRaceStarted(false);
    setRaceFinished(false);
    setSelectedCart(null);
    setSelectedCartName(null);
    setBetAmount(10);

    setTracks([
      { id: 1, cart: { id: 1, name: getRandomNames(), position: 0 } },
      { id: 2, cart: { id: 2, name: getRandomNames(), position: 0 } },
    ]);
  };

  /* ***************************************
     RETURN UI
  **************************************** */
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ऑनलाइन बैलगाड़ी रेस</h1>
      <div style={styles.balance}>वॉलेट बैलेंस: ₹{walletBalance}</div>

      <div style={styles.trackContainer}>
        {tracks.map(track => (
          <div key={track.id} style={styles.trackWrapper}>
            <div style={styles.track}>
              <div
                style={{
                  ...styles.cart,
                  bottom: `${track.cart.position}px`
                }}
              >
                <img
                  src="https://i.ibb.co/01y6FtM/image-2-removebg-preview.png"
                  style={styles.cartImage}
                />
              </div>
            </div>

            <div style={styles.cartName}>{track.cart.name}</div>
          </div>
        ))}
      </div>

      {/* -----------------------------------------
          BETTING SECTION
      ------------------------------------------- */}
      {!raceStarted && !raceFinished && (
        <>
          <h2>बेट लगाएँ</h2>

          <div style={styles.cartSelection}>
            {tracks.map(track => (
              <button
                key={track.id}
                style={{
                  ...styles.cartButton,
                  backgroundColor:
                    selectedCart === track.cart.id ? "green" : "chocolate",
                }}
                onClick={() => {
                  setSelectedCart(track.cart.id);
                  setSelectedCartName(track.cart.name);
                }}
              >
                {track.cart.name}
              </button>
            ))}
          </div>

          <div style={styles.betBox}>
            <label style={styles.label}>राशि:</label>

            <input
              type="number"
              min="10"
              value={betAmount}
              placeholder="न्यूनतम राशि ₹10"
              onChange={(e) => setBetAmount(Number(e.target.value))}
              style={styles.input}
            />
          </div>

          <button style={styles.startButton} onClick={startRace}>
            रेस शुरू करें
          </button>
        </>
      )}

      {raceFinished && (
        <button style={styles.resetButton} onClick={resetGame}>
          फिर से खेलें
        </button>
      )}

      {/* ***************************************
          WIN / LOSS MODAL
      **************************************** */}
      {showResultModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            {isWin ? (
              <>
                <div style={modalStyles.emoji}>🎉🎉🎉</div>
                <h2 style={{ color: "#00ff99" }}>आप जीते! 🏆</h2>
                <p style={{ fontSize: "18px" }}>जीत की राशि:</p>
                <h1 style={{ color: "#FFD700", fontSize: "40px" }}>
                  ₹{winAmount}
                </h1>
              </>
            ) : (
              <>
                <div style={modalStyles.emoji}>😔</div>
                <h2 style={{ color: "red" }}>आप हार गए</h2>
                <p>अगली बार बेहतर किस्मत!</p>
              </>
            )}

            <p style={{ marginTop: "20px", fontSize: "12px", opacity: 0.7 }}>
              बंद हो रहा है...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ***************************************
   STYLES
**************************************** */
const styles = {
  container: { textAlign: "center", marginBottom: "90px" },
  title: { color: "white", fontSize: "22px" },
  balance: { color: "yellow", marginBottom: "10px" },

  trackContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    margin: "20px 0",
  },

  trackWrapper: { textAlign: "center" },

  track: {
    width: "150px",
    height: "500px",
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

  cartName: {
    marginTop: "8px",
    color: "white",
    fontWeight: "600",
  },

  cartSelection: { display: "flex", justifyContent: "center", gap: "10px" },

  cartButton: {
    padding: "10px",
    color: "white",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },

  betBox: {
    width: "90%",
    margin: "12px auto",
    padding: "12px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
  },

  label: { color: "white", marginBottom: "5px", display: "block" },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.3)",
    color: "white",
    border: "1px solid #ff4081",
  },

  startButton: {
    background: "green",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    marginTop: "10px",
  },

  resetButton: {
    background: "#e91e63",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    marginTop: "10px",
  },
};

/* ***************************************
   MODAL STYLES
**************************************** */
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
    backdropFilter: "blur(4px)",
    zIndex: 99999,
  },
  modal: {
    width: "80%",
    maxWidth: "350px",
    background: "rgba(20,20,20,0.95)",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 0 20px #00ff99",
    animation: "popup 0.5s ease-out",
  },
  emoji: {
    fontSize: "50px",
    marginBottom: "10px",
    animation: "bounce 1s infinite",
  },
};

export default BullockCartRacingGame;
