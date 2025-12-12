// UserPanel.jsx (सभी UI और कमेंट्स हिन्दी में)

/* --------------------------------------------------
   आवश्यक आयात
-------------------------------------------------- */
import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";

/* --------------------------------------------------
   सहायक सूची और फ़ंक्शन
-------------------------------------------------- */
const cartNames = [
  "गोल्डी और सिल्वर", "पर्ल और डायमंड", "वीर और वरद", "शक्ति और संजीवनी",
  "भैरव और भूपाल", "रणवीर और रणधीर", "दत्ता और दामोदर", "गणेश और गजानन",
  "सम्राट और सूर्यवीर", "यशवंत और युगंधर", "केसर और कृष्णा", "मल्लेश और मुरलीधर",
  "अग्निवीर और तेजस्वी", "प्रताप और प्रभाकर", "शिवराज और शौर्यवीर", "धनराज और देवेंद्र",
  "माणिक और मोती", "सागर और संदीप", "आदित्य और अविनाश", "दीपक और दिगंबर",
  "सिंहगर्जना और सिंहशक्ती", "गजेंद्र और गरुड़वीर", "सिद्धी और समाधी", "अमर और अनंता",
  "ध्रुव और दीपक", "आकाश और अनिल", "परशुराम और पांडुरंग", "भवानी और भैरवी",
  "रणधीर और रणजीत", "समर्थ और सत्यं", "कस्तूरी और कमल", "गंगाधर और गोविंद",
  "महादेव और मयूरेश", "शिवदास और सूर्यदास", "जगत और जनार्दन", "चंद्रहास और चंद्रशेखर"
];

const getRandomNames = () => cartNames[Math.floor(Math.random() * cartNames.length)];

const toEpochMs = (v) => (v?.toMillis ? v.toMillis() : Number(v || 0));
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/* --------------------------------------------------
   मुख्य घटक: उपयोगकर्ता पैनल
-------------------------------------------------- */
const UserPanel = () => {

  const [tracks, setTracks] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [myEntries, setMyEntries] = useState([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);
  const [trackSpeeds, setTrackSpeeds] = useState({});
  const [loserGap, setLoserGap] = useState(160);

  const [selectedCart, setSelectedCart] = useState(null);
  const [participationAmount, setParticipationAmount] = useState(20);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [noEntry, setNoEntry] = useState(false);  // ⭐ NEW FLAG

  const resultShownRef = useRef(false);

  const startSound = useRef(null);
  const runningSound = useRef(null);
  const winSound = useRef(null);
  const lossSound = useRef(null);

  const user = auth.currentUser;


  /* --------------------------------------------------
     ध्वनियाँ लोड करें
-------------------------------------------------- */
  useEffect(() => {
    startSound.current = new Audio("/sounds/start.wav");
    runningSound.current = new Audio("/sounds/cart_moving.wav");
    winSound.current = new Audio("/sounds/victory.wav");
    lossSound.current = new Audio("/sounds/loss.wav");
    runningSound.current.loop = true;
  }, []);

  /* --------------------------------------------------
     चालू मैच सुनें
-------------------------------------------------- */
  useEffect(() => {
    const ref = doc(db, "game", "currentMatch");

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const match = snap.data();
      setCurrentMatch(match);

      if (match.team1Name && match.team2Name) {
        setTracks([
          { id: 1, cart: { id: 1, name: match.team1Name, position: 0 } },
          { id: 2, cart: { id: 2, name: match.team2Name, position: 0 } },
        ]);
      }

      resultShownRef.current = false;
      setShowResultModal(false);
      setNoEntry(false);
    });
  }, []);

  /* --------------------------------------------------
     वॉलेट Listener
-------------------------------------------------- */
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setWalletBalance(snap.data().walletBalance || 0);
    });
  }, [user]);

  /* --------------------------------------------------
     Bets Listener
-------------------------------------------------- */
  useEffect(() => {
    if (!user) return;

    const entriesRef = collection(db, "game", "currentMatch", "bets");
    const q = query(entriesRef, where("userId", "==", user.uid));

    return onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setMyEntries(arr);
      setEntriesLoaded(true);
    });
  }, [user]);

  const trackHeight = window.innerWidth < 450 ? 400 : 500;

  useEffect(() => {
    if (!currentMatch) return;
    setTrackSpeeds({
      1: 0.75 + Math.random() * 0.3,
      2: 0.75 + Math.random() * 0.3
    });
  }, [currentMatch?.matchId]);

  useEffect(() => {
    if (!currentMatch) return;

    setLoserGap({
      1: 120 + Math.random() * 180,  // 120–300px behind
      2: 120 + Math.random() * 180
    });
  }, [currentMatch?.matchId]);
  /* --------------------------------------------------
     गाड़ी एनिमेशन
-------------------------------------------------- */
  useEffect(() => {
    const iv = setInterval(() => {
      if (!currentMatch || tracks.length === 0) return;

      const now = Date.now();
      const startsAt = toEpochMs(currentMatch.startsAt);
      const endsAt = toEpochMs(currentMatch.endsAt);

      /* BEFORE RACE */
      if (now < startsAt) {
        setTracks(prev =>
          prev.map(t => ({
            ...t,
            cart: { ...t.cart, position: 0 }
          }))
        );
        runningSound.current.pause();
        return;
      }

      /* DURING RACE */

      if (now >= startsAt && now <= endsAt) {
        const frac = clamp((now - startsAt) / (endsAt - startsAt)); // 0 → 1

        if (runningSound.current.paused)
          runningSound.current.play().catch(() => { });

        const trackHeight = window.innerWidth < 450 ? 400 : 500;

        setTracks(prev =>
          prev.map(t => {
            let maxSpeed;

            if (currentMatch.winner) {
              /* ⭐ WINNER / LOSER FINAL POSITION LOGIC */

              if (t.id === currentMatch.winner) {
                maxSpeed = trackHeight - 20; // Winner almost reaches top
              } else {
                // ⭐ Loser gap is random: sometimes near, sometimes far
                const gap = loserGap[t.id] ?? 180; // random: 120–300 set earlier
                maxSpeed = trackHeight - gap;
              }

            } else {
              /* ⭐ NORMAL RACE (NO WINNER YET) — SMOOTH MEDIUM SPEED */
              const base = trackSpeeds[t.id] ?? 0.95;
              maxSpeed = (trackHeight - 80) * (base + 0.35);
            }

            // ⭐ Smooth motion
            const newPos = frac * maxSpeed;

            return {
              ...t,
              cart: { ...t.cart, position: newPos }
            };
          })
        );
        return;
      }

      /* AFTER RACE */
      runningSound.current.pause();

    }, 80);

    return () => clearInterval(iv);
  }, [currentMatch, trackSpeeds, loserGap]);



  // 🚀 NO tracks dependency → FIXED!





  /* --------------------------------------------------
     RESULT LOGIC — FIXED (NO DUPLICATE MODAL)
-------------------------------------------------- */
  useEffect(() => {
    if (!currentMatch) return;
    if (!entriesLoaded) return;
    if (currentMatch.winner == null) return;

    const check = async () => {
      if (resultShownRef.current) return;

      const now = Date.now();
      const endsAt = toEpochMs(currentMatch.endsAt);
      if (now < endsAt) return;

      resultShownRef.current = true;

      // ⭐ यदि entry नहीं लगाई
      if (myEntries.length === 0) {
        setNoEntry(true);
        setShowResultModal(true);
        return; // STOP HERE ❗
      }

      const winner = currentMatch.winner;

      const winEntries = myEntries.filter(e => e.cartId === winner);
      const totalEntry = myEntries.reduce((s, e) => s + e.amount, 0);
      const winTotal = winEntries.reduce((s, e) => s + e.amount, 0);

      if (winTotal > 0) {
        const winAmt = winTotal * 2;
        setIsWin(true);
        setWinAmount(winAmt);
        winSound.current.play().catch(() => { });

        await updateDoc(doc(db, "users", user.uid), {
          walletBalance: walletBalance + winAmt
        });
      } else {
        setIsWin(false);
        setWinAmount(totalEntry);
        lossSound.current.play().catch(() => { });
      }

      setShowResultModal(true);
    };

    const iv = setInterval(check, 300);
    return () => clearInterval(iv);

  }, [currentMatch, myEntries, entriesLoaded]);
  /* --------------------------------------------------
     PARTICIPATE — राय लगाना (same as before with success message)
  -------------------------------------------------- */
  const participate = async () => {
    if (!user) return alert("कृपया लॉगिन करें!");

    // ⭐ Prevent double bet (IMPORTANT)
    if (myEntries.length > 0) {
      return alert("आप पहले ही इस दौड़ में राय लगा चुके हैं!");
    }

    if (!selectedCart) return alert("कृपया किसी गाड़ी का चयन करें!");
    if (!participationAmount || Number(participationAmount) <= 0)
      return alert("कृपया वैध राशि दर्ज करें!");
    if (Number(participationAmount) > walletBalance)
      return alert("आपके पास पर्याप्त शेष राशि नहीं है!");

    const now = Date.now();
    const startsAt = toEpochMs(currentMatch.startsAt);
    if (now >= startsAt) return alert("राय लगाने का समय समाप्त!");

    try {
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, "users", user.uid);
        const snap = await tx.get(userRef);
        const bal = snap.exists() ? snap.data().walletBalance : 0;

        if (bal < Number(participationAmount))
          throw new Error("पर्याप्त राशि नहीं!");

        // Deduct balance
        tx.update(userRef, {
          walletBalance: bal - Number(participationAmount),
        });

        // Add entry
        const entryRef = doc(collection(db, "game", "currentMatch", "bets"));
        tx.set(entryRef, {
          userId: user.uid,
          cartId: selectedCart,
          amount: Number(participationAmount),
          createdAt: serverTimestamp(),
        });
      });

      startSound.current.play().catch(() => { });

      const selectedTeamName = tracks.find((t) => t.id === selectedCart)?.cart?.name;

      alert(
        `✔ राय सफल!\nआपने "${selectedTeamName ?? "टीम"}" पर ₹${participationAmount} की राय लगाई है।`
      );

      setSelectedCart(null);
      setParticipationAmount("");
      setShowEntryModal(false);
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };


  /* --------------------------------------------------
     नया मैच बनाना (team names Firebase में सेव होंगे)
  -------------------------------------------------- */
  const createMatchIfMissing = async () => {
    try {
      await runTransaction(db, async (tx) => {
        const matchRef = doc(db, "game", "currentMatch");
        const snap = await tx.get(matchRef);
        const now = Date.now();

        if (snap.exists()) {
          const m = snap.data();
          if (now < toEpochMs(m.endsAt)) return;
        }

        // Generate team names and ensure they are not identical
        let newTeam1 = getRandomNames();
        let newTeam2 = getRandomNames();
        while (newTeam2 === newTeam1) {
          newTeam2 = getRandomNames();
        }

        // Delete previous bets (if any)
        const betsSnap = await getDocs(collection(db, "game", "currentMatch", "bets"));
        betsSnap.forEach((b) => tx.delete(b.ref));

        resultShownRef.current = false;
        setEntriesLoaded(false);
        setNoEntry(false);
        setShowResultModal(false);

        const entryWindow = 20000; // 20s for bets
        const raceWindow = 25000; // 25s race
        const startsAt = now + entryWindow;
        const endsAt = startsAt + raceWindow;

        tx.set(
          matchRef,
          {
            matchId: "m_" + Math.floor(now / 1000),
            createdAt: serverTimestamp(),
            bettingOpen: true,
            startsAt,
            endsAt,
            winner: null,
            team1Name: newTeam1,
            team2Name: newTeam2,
          },
          { merge: true }
        );
      });
    } catch (e) {
      console.error("Match Create Error", e);
    }
  };

  /* --------------------------------------------------
     Auto Match Manager
  -------------------------------------------------- */
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!currentMatch) return;

      const now = Date.now();
      const startsAt = toEpochMs(currentMatch.startsAt);
      const endsAt = toEpochMs(currentMatch.endsAt);

      // Close betting when match starts
      if (currentMatch.bettingOpen && now >= startsAt) {
        try {
          await updateDoc(doc(db, "game", "currentMatch"), { bettingOpen: false });
        } catch (e) {
          // ignore
        }
      }

      // If admin didn't set winner, choose random at end
      if (currentMatch.winner == null && now > endsAt) {

        const rnd = crypto.getRandomValues(new Uint32Array(1))[0];
        const winner = rnd % 2 === 0 ? 1 : 2;

        try {
          await updateDoc(doc(db, "game", "currentMatch"), { winner });
        } catch (e) { }
      }


      // After short delay, create next match
      if (currentMatch.winner != null && now > endsAt + 3000) {
        await createMatchIfMissing();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMatch]);

  /* --------------------------------------------------
     UI START
  -------------------------------------------------- */
  const nowTime = Date.now();
  const startsAt = currentMatch ? toEpochMs(currentMatch.startsAt) : 0;
  const endsAtTime = currentMatch ? toEpochMs(currentMatch.endsAt) : 0;

  const entryPhase = currentMatch && nowTime < startsAt;
  const racePhase = currentMatch && nowTime >= startsAt && nowTime <= endsAtTime;
  const resultPhase = currentMatch && nowTime > endsAtTime;

  const secondsLeft = () => {
    if (!currentMatch) return "--";
    if (entryPhase) return Math.ceil((startsAt - nowTime) / 1000) + " सेकंड";
    if (racePhase) return Math.ceil((endsAtTime - nowTime) / 1000) + " सेकंड";
    return "0 सेकंड";
  };

  const selectedTeamName = myEntries.length > 0
    ? tracks.find((t) => t.id === myEntries[0].cartId)?.cart?.name
    : null;

  const winnerTeamName = currentMatch?.winner
    ? tracks.find(t => t.id === currentMatch.winner)?.cart?.name
    : null;


  return (
    <div style={styles.container}>
      {/* ट्रैक */}
      {/* ट्रैक और गाड़ियाँ (replace your existing tracks.map block with this) */}
      <div style={styles.trackContainer}>
        {tracks.map((t) => {
          // compute render-time progress (0..1)
          const startsAt = currentMatch ? toEpochMs(currentMatch.startsAt) : 0;
          const endsAt = currentMatch ? toEpochMs(currentMatch.endsAt) : 0;
          const nowTimeRender = Date.now();
          let fracRender = 0;
          if (currentMatch && endsAt > startsAt) {
            if (nowTimeRender < startsAt) fracRender = 0;
            else if (nowTimeRender > endsAt) fracRender = 1;
            else fracRender = clamp((nowTimeRender - startsAt) / (endsAt - startsAt));
          }

          // glow when this track is declared winner and race is near finish (or finished)
          const glow = currentMatch && currentMatch.winner === t.id && fracRender >= 0.85;

          return (
            <div key={t.id} style={styles.trackWrapper}>
              <div style={styles.track}>
                {/* FINISH LINE (optional) */}
                <div style={styles.finishLine}></div>

                {/* cart with conditional glow */}
                <div
                  style={{
                    ...styles.cart,
                    bottom: `${t.cart.position}px`,
                    // apply glow visually: drop-shadow + subtle scale
                    filter: glow ? "drop-shadow(0 0 14px rgba(255,215,0,0.95))" : "none",
                    transform: glow ? "translateX(-50%) scale(1.06)" : "translateX(-50%)",
                    transition: "filter 220ms ease, transform 220ms ease, bottom 120ms linear",
                    zIndex: glow ? 10 : 2
                  }}
                >
                  <img
                    src={racePhase ? "/racee.gif" : "https://i.ibb.co/01y6FtM/image-2-removebg-preview.png"}
                    style={styles.cartImage}
                    alt={t.cart.name}
                  />
                </div>
              </div>

              <div style={{
                ...styles.cartName,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4
              }}>
                <div>{t.cart.name}</div>
                {/* small winner badge during glow */}
                {glow && (
                  <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 800 }}>
                    🏆 विजेता
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* Play + Info Bar */}
      <div style={styles.hudBar}>

        {/* Play Button */}
        <div style={styles.playSection}>
          <button
            style={{
              ...styles.playBtn,
              background: entryPhase
                ? "linear-gradient(180deg, #ffe97a, #ff9800)"
                : "linear-gradient(180deg,#555,#333)",
              color: entryPhase ? "#000" : "#ccc",
            }}
            onClick={() => {
              if (!entryPhase) return alert("प्रवेश बंद है!");
              setShowEntryModal(true);
            }}
          >
            {entryPhase ? "🔥 खेले" : "खेल बंद"}
          </button>
          <span style={styles.playStatus}>
            {entryPhase ? "खुला है" : racePhase ? "दौड़ जारी" : "परिणाम"}
          </span>
        </div>

        {/* Info Card */}
        <div style={styles.infoCard}>
          <div style={styles.row}>
            <span style={{ opacity: 0.7, fontSize: '12px' }}>दौड़ संख्या: </span>
            <strong style={{ color: "#FFD54F", fontSize: '12px' }}>
              {currentMatch?.matchId ?? "---"}
            </strong>
          </div>

          <div style={{
            marginTop: 6,
            textAlign: "center",
            fontWeight: 700,
            fontSize: '10px',
            color: entryPhase ? "#00ff95" : racePhase ? "#ff9800" : "tomato"
          }}>
            {entryPhase && `⏳ राय लगाना बंद होने में: ${secondsLeft()} बाकी`}
            {racePhase && `🏁 दौड़ समाप्त: ${secondsLeft()} बाकी`}
            {resultPhase && "🎉 परिणाम घोषित"}
          </div>
          {/* ⚡ Animated Progress Bar */}
          <div
            style={{
              marginTop: 8,
              height: 8,
              width: "100%",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",

                /* WIDTH BASED ON GAME TIME */
                width: entryPhase
                  ? `${(secondsLeft().replace(" सेकंड", "") / 20) * 100}%`
                  : racePhase
                    ? `${(secondsLeft().replace(" सेकंड", "") / 25) * 100}%`
                    : "0%",

                background: entryPhase
                  ? "linear-gradient(90deg,#00ff95,#00c853)"
                  : racePhase
                    ? "linear-gradient(90deg,#ffb300,#ff6f00)"
                    : "red",

                transition: "width 0.4s linear",
                boxShadow: "0 0 10pxrgba(255,255,255,0.6)",
              }}
            ></div>
          </div>

          {/* display team names */}
          <div style={{ marginTop: 10, textAlign: "center" }}>
            {selectedTeamName ? (
              <div style={{ color: "#00ff95", fontWeight: "700", fontSize: 10 }}>
                ✔ चुनी हुई बैलगाडी: {selectedTeamName}
              </div>
            ) : (
              <><div style={{ color: "yellow", fontWeight: "700", fontSize: 10 }}>
                ⚠ आपने इस दौड़ में भाग नहीं लिया
              </div>
                {winnerTeamName && (
                  <div style={{ color: "#00ff00ff", fontWeight: "700", fontSize: 10 }}>
                    🏆 विजेता जोडी: {winnerTeamName}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <div style={bottomSheetStyles.backdrop} onClick={() => setShowEntryModal(false)}>
          <div style={bottomSheetStyles.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={bottomSheetStyles.dragHandle}></div>

            <h2 style={{ color: "#FFD700" }}>प्रवेश</h2>
            <h3 style={{ color: "white" }}>गाड़ी चुनें:</h3>

            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedCart(track.id)}
                  style={{
                    padding: 10,
                    background: selectedCart === track.id ? "green" : "chocolate",
                    color: "white",
                    borderRadius: 5,
                    border: "none",
                  }}
                >
                  {track.cart.name}
                </button>
              ))}
            </div>

            <label style={{ color: "white" }}>राशि:</label>
            <input
              type="number"
              value={participationAmount}
              onChange={(e) => setParticipationAmount(e.target.value)}
              style={styles.input}
            />

            <button style={styles.sheetSubmitBtn} onClick={participate}>
              जमा करें
            </button>
            <button style={styles.sheetCancelBtn} onClick={() => setShowEntryModal(false)}>
              रद्द करें
            </button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            {myEntries.length === 0 ? (
              <>
                <div style={modalStyles.emoji}>⚠️</div>
                <h2 style={{ color: "yellow", fontSize: "13px" }}>
                  आपने इस दौड़ में हिस्सा नहीं लिया
                </h2>

                {winnerTeamName && (
                  <h3 style={{ marginTop: 10, color: "#00ff00ff", fontSize: 15 }}>
                    🏆 विजेता जोडी: {winnerTeamName}
                  </h3>
                )}
              </>
            ) : isWin ?
              (
                <>
                  <div style={modalStyles.emoji}>🎉</div>
                  <h2 style={{ color: "#00ff99" }}>बधाई! आप जीते</h2>
                  <h1 style={{ color: "#FFD700" }}>₹{winAmount}</h1>
                </>
              ) : (
                <>
                  <div style={modalStyles.emoji}>😔</div>
                  <h2 style={{ color: "red" }}>आप हार गए</h2>
                  <h1 style={{ color: "orange" }}>₹{winAmount}</h1>
                </>
              )}
          </div>
        </div>
      )}

    </div>
  );
};

/* --------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = {
  container: { textAlign: "center", marginBottom: "90px" },
  trackContainer: { display: "flex", justifyContent: "center", gap: 20 },
  finishLine: {
    position: "absolute",
    top: "10px",        // finish line position (can adjust)
    left: 0,
    width: "100%",
    height: "6px",
    background: "linear-gradient(90deg, red, red)",
    boxShadow: "0 0 10px white, 0 0 20px white",
    opacity: 0.9,
    animation: "flash 0.8s infinite",
    zIndex: 5
  },

  trackWrapper: { width: 160, textAlign: "center" },
  track: {
    width: 150,
    height: window.innerWidth < 450 ? 430 : 500,
    background: "#a0522d",
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  cart: {
    position: "absolute",
    left: "80%",
    transform: "translateX(-50%)",
    transition: "bottom 0.08s linear",
  },
  cartImage: { width: 70 },
  cartName: { marginTop: 8, color: "yellow", fontSize: 13, fontWeight: "700", },

  hudBar: {
    width: "94%",
    marginInline: "auto",
    marginTop: 20,
    padding: 15,
    borderRadius: 16,
    background: "#111",
    display: "flex",
    gap: 12,
  },

  playSection: { width: 100, textAlign: "center" },
  playBtn: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: 50,
    border: "none",
    fontWeight: 900,
    fontSize: 14,
    transition: "0.25s",
  },
  playStatus: { fontSize: 11, color: "#ccc", marginTop: 6 },

  infoCard: {
    flex: 1,
    padding: 10,
    background: "#1a1a1a",
    borderRadius: 14,
    color: "white",
  },

  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    background: "rgba(255,255,255,0.15)",
    border: "1px solid #ff4081",
    color: "white",
  },

  sheetSubmitBtn: {
    width: "100%",
    padding: 12,
    background: "green",
    borderRadius: 10,
    color: "white",
    border: "none",
    marginTop: 12,
    fontWeight: 700,
  },
  sheetCancelBtn: {
    width: "100%",
    padding: 10,
    background: "#e91e63",
    borderRadius: 10,
    color: "white",
    border: "none",
    marginTop: 8,
    fontWeight: 700,
  },
};

const bottomSheetStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 9999,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    background: "rgba(30,30,30,0.95)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  dragHandle: {
    width: 50,
    height: 6,
    background: "#666",
    borderRadius: 3,
    margin: "0 auto 12px",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  modal: {
    background: "rgba(25,25,25,0.95)",
    padding: 25,
    borderRadius: 18,
    textAlign: "center",
    width: "80%",
    maxWidth: 350,
    color: "white",
  },
  emoji: { fontSize: 50, marginBottom: 10 },

};


export default UserPanel;
