import React, { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const cartNames = [
  "गोल्डी आणि सिल्व्हर","पर्ल आणि डायमंड","वीर आणि वरद","शक्ती आणि संजीवनी",
  "भैरव आणि भूपाल","रणवीर आणि रणधीर","दत्ता आणि दामोदर","गणेश आणि गजानन",
  "सम्राट आणि सूर्यवीर","यशवंत आणि युगंधर","केसर आणि कृष्णा","मल्लेश आणि मुरलीधर",
  "अग्निवीर आणि तेजस्वी","प्रताप आणि प्रभाकर","शिवराज आणि शौर्यवीर","धनराज आणि देवेंद्र",
  "माणिक आणि मोती","सागर आणि संदीप","आदित्य आणि अविनाश","दीपक आणि दिगंबर",
  "सिंहगर्जना आणि सिंहशक्ती","गजेंद्र आणि गरुडवीर","सिद्धी आणि समाधी","अमर आणि अनंता",
  "ध्रुव आणि दीपक","आकाश आणि अनिल","परशुराम आणि पांडुरंग","भवानी आणि भैरवी",
  "रणधीर आणि रणजित","समर्थ आणि सत्यम","कस्तुरी आणि कमल","गंगाधर आणि गोविंद",
  "महादेव आणि मयूरेश","शिवदास आणि सूर्यदास","जगत आणि जनार्दन","चंद्रहास आणि चंद्रशेखर"
];

const getRandomNames = () => cartNames[Math.floor(Math.random() * cartNames.length)];

const BullockCartRacingGame = () => {
  const [tracks, setTracks] = useState([
    { id: 1, cart: { id: 1, name: getRandomNames(), position: 0 } },
    { id: 2, cart: { id: 2, name: getRandomNames(), position: 0 } },
  ]);

  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);

  // selectedCart stores the selected cart id (1 or 2)
  const [selectedCart, setSelectedCart] = useState(null);
  // selectedCartName stores the name at time of selection for clarity
  const [selectedCartName, setSelectedCartName] = useState(null);

  const [betAmount, setBetAmount] = useState(10);
  const [walletBalance, setWalletBalance] = useState(0);
  const [result, setResult] = useState("");

  const user = auth.currentUser;

  // ⭐ SOUND REFS
  const startSound = useRef(null);
  const runningSound = useRef(null);
  const winSound = useRef(null);
  const lossSound = useRef(null);

  useEffect(() => {
    // Load sound files
    startSound.current = new Audio("/sounds/start.wav");
    runningSound.current = new Audio("/sounds/cart_moving.wav");
    winSound.current = new Audio("/sounds/victory.wav");
    lossSound.current = new Audio("/sounds/loss.wav");

    runningSound.current.loop = true;
  }, []);

  // ⭐ Load Real Wallet Balance (listen to user doc)
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

  // Helper: decide winner using a *provided* snapshot of tracks to avoid stale closures
  const decideWinner = async (currentTracks) => {
    if (!currentTracks || currentTracks.length === 0) return;

    // find the winner based on positions in the *currentTracks* snapshot
    const winner = currentTracks.reduce((a, b) =>
      a.cart.position > b.cart.position ? a : b
    );

    // ensure we have a user
    if (!user) {
      // just set result message, no DB ops
      setResult(
        selectedCart === winner.cart.id
          ? `🏆 तुम्ही जिंकलात! तुम्ही बेट लावले होते: ${selectedCartName || selectedCart} — विजेता: ${winner.cart.name}`
          : `❌ तुम्ही हरलात! विजेता: ${winner.cart.name} (तुम्ही बेट लावले होते: ${selectedCartName || selectedCart})`
      );
      return;
    }

    const userRef = doc(db, "users", user.uid);

    // Compare selected cart id with winner's id
    if (selectedCart === winner.cart.id) {
      const winAmount = betAmount * 2;

      // Update DB with new wallet balance (compute from the latest UI balance snapshot)
      // note: using walletBalance from state; in highly concurrent apps one might re-fetch or use transactions.
      const newBalance = (walletBalance || 0) + winAmount;
      try {
        await updateDoc(userRef, { walletBalance: newBalance });
        setWalletBalance(newBalance);
      } catch (err) {
        // fallback: still update local state so UI shows win
        setWalletBalance((prev) => prev + winAmount);
      }

      setResult(
        `🏆 तुम्ही जिंकलात! तुम्ही बेट लावले होते: ${selectedCartName || selectedCart} — विजेता: ${winner.cart.name}`
      );

      if (winSound.current) winSound.current.play();
    } else {
      setResult(
        `❌ तुम्ही हरलात! विजेता: ${winner.cart.name} (तुम्ही बेट लावले होते: ${selectedCartName || selectedCart})`
      );

      if (lossSound.current) lossSound.current.play();
    }
  };

  // ⭐ Start Race
  const startRace = async () => {
    if (!user) return alert("Please login first!");
    if (!selectedCart) return alert("एक बैलगाड़ी निवडा!");
    if (betAmount <= 0) return alert("कृपया योग्य पैज निवडा!");
    if (betAmount > walletBalance) return alert("वॉलेट मध्ये पुरेसे पैसे नाहीत!");

    const userRef = doc(db, "users", user.uid);

    // deduct bet immediately (optimistic)
    try {
      const newBalAfterBet = (walletBalance || 0) - betAmount;
      await updateDoc(userRef, { walletBalance: newBalAfterBet });
      setWalletBalance(newBalAfterBet);
    } catch (err) {
      // still update local if DB update fails to avoid blocking the game UX
      setWalletBalance((prev) => prev - betAmount);
    }

    // 🔊 Play start sound
    if (startSound.current) startSound.current.play();

    // 🔊 Start running background sound
    setTimeout(() => {
      if (runningSound.current) runningSound.current.play();
    }, 300);

    setRaceStarted(true);
    setRaceFinished(false);

    // IMPORTANT FIX:
    // DO NOT re-randomize cart names here — keep the currently visible names.
    // Only reset positions to 0 so the carts start from the bottom with the same names the user saw.
    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        cart: {
          ...t.cart,
          position: 0,
        },
      }))
    );
  };

  // ⭐ Racing Animation
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

  // ⭐ Check if race finished - when finished, pass the current snapshot to decideWinner
  useEffect(() => {
    if (!tracks || tracks.length === 0) return;
    const finished = tracks.some((t) => t.cart.position >= 500);
    if (finished) {
      setRaceFinished(true);
      setRaceStarted(false);

      // stop running sound
      if (runningSound.current) runningSound.current.pause();

      // pass the current tracks snapshot to decideWinner to avoid stale closures
      decideWinner(tracks);
    }
    // intentionally depend on tracks so this runs as positions update
  }, [tracks]);

  const resetGame = () => {
    setRaceStarted(false);
    setRaceFinished(false);
    setSelectedCart(null);
    setSelectedCartName(null);
    setBetAmount(10);
    setResult("");

    // When resetting game, give fresh random names
    setTracks([
      { id: 1, cart: { id: 1, name: getRandomNames(), position: 0 } },
      { id: 2, cart: { id: 2, name: getRandomNames(), position: 0 } },
    ]);

    // Stop any playing sounds
    if (runningSound.current) {
      runningSound.current.pause();
      runningSound.current.currentTime = 0;
    }
    if (startSound.current) {
      startSound.current.pause();
      startSound.current.currentTime = 0;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ऑनलाईन शंकरपट</h1>

      <div style={styles.balance}>वॉलेट बॅलन्स: ₹{walletBalance}</div>

      {raceFinished && <h2>{result}</h2>}

      {/* RACE TRACKS */}
      <div style={styles.trackContainer}>
        {tracks.map((track) => (
          <div key={track.id} style={styles.trackWrapper}>

            {/* Track */}
            <div style={styles.track}>
              <div
                style={{
                  ...styles.cart,
                  bottom: `${track.cart.position}px`,
                }}
              >
                <img
                  src="https://i.ibb.co/01y6FtM/image-2-removebg-preview.png"
                  alt=""
                  style={styles.cartImage}
                />
              </div>
            </div>

            {/* Cart Name (NEW) */}
            <div style={styles.cartName}>{track.cart.name}</div>

          </div>
        ))}
      </div>

      {/* BETTING SECTION */}
      {!raceStarted && !raceFinished && (
        <>
          <h2>बेट लावा</h2>

          <div style={styles.cartSelection}>
            {tracks.map((track) => (
              <button
                key={track.cart.id}
                style={{
                  ...styles.cartButton,
                  backgroundColor:
                    selectedCart === track.cart.id ? "green" : "chocolate",
                }}
                onClick={() => {
                  // set both id and snapshot name to avoid confusion later
                  setSelectedCart(track.cart.id);
                  setSelectedCartName(track.cart.name);
                }}
              >
                {track.cart.name}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              background: "rgba(255, 255, 255, 0.15)",
              padding: "12px",
              borderRadius: "12px",
              width: "90%",
              margin: "10px auto",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <label
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "6px",
              }}
            >
              रक्कम:
            </label>

            <input
              type="number"
              min="10"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "15px",
                borderRadius: "10px",
                border: "1px solid #E91E63",
                outline: "none",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
                boxShadow: "inset 0 0 8px rgba(0,0,0,0.25)",
                transition: "0.3s",
              }}
            />
          </div>

          <button style={styles.startButton} onClick={startRace}>
            शर्यत सुरू करा
          </button>
        </>
      )}

      {raceFinished && (
        <button style={styles.resetButton} onClick={resetGame}>
          पुन्हा खेळा
        </button>
      )}
    </div>
  );
};

const styles = {
  container: { textAlign: "center", marginBottom: "100px" },
  title: { fontSize: "1.3rem", color: "white" },
  balance: { fontSize: "1rem", margin: "10px 0", color: "yellow" },

  trackContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    margin: "20px 0",
  },

  /* WRAPPER */
  trackWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  track: {
    width: "150px",
    height: "500px",
    background: "#a0522d",
    borderRadius: "10px",
    overflow: "hidden",
    position: "relative",
  },

  cart: {
    position: "absolute",
    left: "80%",
    transform: "translateX(-50%)",
    transition: "bottom 0.1s linear",
  },
  cartImage: { width: "70px" },

  cartName: {
    color: "white",
    fontWeight: "600",
    marginTop: "8px",
    fontSize: "15px",
    textAlign: "center",
    width: "100px",
  },

  cartSelection: { display: "flex", gap: "10px" },
  cartButton: {
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white",
  },
  betAmount: { margin: "10px 0" },

  startButton: {
    padding: "10px 20px",
    background: "green",
    color: "#fff",
    borderRadius: "5px",
  },
  resetButton: {
    padding: "10px 20px",
    background: "#dc3545",
    color: "#fff",
    borderRadius: "5px",
  },
};

export default BullockCartRacingGame;
