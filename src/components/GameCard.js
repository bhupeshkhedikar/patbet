import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BetNowModal from "./BetNowModal";
import { db } from "../firebase";
import {
  runTransaction,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { onSnapshot, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const GameCard = ({ game, selectedVillage }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(5000);
  const [betEnabled, setBetEnabled] = useState(game.isBetEnabled);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeDifference, setTimeDifference] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [betStartTime, setBetStartTime] = useState(null);
  const [betEndTime, setBetEndTime] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const getDeviceId = () => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("deviceId", id);
    }
    return id;
  };

  const deviceId = getDeviceId();

  const getRandomDelay = () =>
    Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;


  const whatsappMessage = `
🐂 शंकरपट ${selectedVillage} के टॉप 10 जोडीयो के लिये PatWin पर लाईव्ह गेम्स शुरू हो चुके हैं! 🐂

💎 अभी अपनी राय लगाइए
👉 https://www.patwin.online/

🏆 और जीतिए ढेर सारे कॉइन्स!

🎁 ख़ास बोनस आपके लिए
👉 मेरा रेफरल कोड इस्तेमाल करें ${referralCode}
💰 रजिस्टर करते ही पाएं 100 कॉइन्स बिल्कुल FREE!

⏳ देरी न करें — अभी रजिस्टर करें
👉 https://www.patwin.online/

👇 अभी जुड़ें और जीत की शुरुआत करें! 👇
https://www.patwin.online/
`;



  useEffect(() => {
    if (!user) return;

    const fetchReferral = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setReferralCode(snap.data().referralCode);
      }
    };

    fetchReferral();
  }, [user]);

  const handleWhatsappShare = async () => {
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const userRef = doc(db, "users", user.uid);

    // 🔒 Daily limit (₹15 = 5 shares)
    const q = query(
      collection(db, "whatsappRewardLogs"),
      where("userId", "==", user.uid),
      where("date", "==", today)
    );

    const snap = await getDocs(q);
    if (snap.size >= 3) {
      alert("❌ आज की ₹9 लिमिट पूरी हो चुकी है");
      return;
    }

    // 👉 WhatsApp OPEN IMMEDIATELY
    window.open(
      `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
      "_blank"
    );

    const delay = getRandomDelay(); // 5–10 sec

    setTimeout(async () => {
      try {
        await runTransaction(db, async (tx) => {
          tx.update(userRef, { walletBalance: increment(3) });

          tx.set(doc(collection(db, "whatsappRewardLogs")), {
            userId: user.uid,
            gameId: game.id,
            amount: 3,
            date: today,
            deviceId,
            createdAt: serverTimestamp(),
            delayMs: delay,
          });
        });

        alert("✅ ₹3 आपके वॉलेट में जुड़ गए");
      } catch (e) {
        console.error("Reward credit failed", e);
      }
    }, delay);
  };




  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBetTimes = async () => {
      const betTimesDoc = await getDoc(doc(db, "betTimes", "times"));
      if (betTimesDoc.exists()) {
        const data = betTimesDoc.data();
        setBetStartTime(new Date(data.starttime));
        setBetEndTime(new Date(data.endtime));
      }
    };

    fetchBetTimes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (betStartTime && betEndTime) {
        updateBettingStatus(now);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [betStartTime, betEndTime]);

  useEffect(() => {
    const gamesRef = collection(db, "games");

    const unsubscribe = onSnapshot(gamesRef, (querySnapshot) => {
      const gameList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          srNo: doc.data().srNo ? parseInt(doc.data().srNo) : Infinity, // Sr. No को integer में बदलना
        }))
        .sort((a, b) => a.srNo - b.srNo); // Ascending Order (छोटा से बड़ा)

      const updatedGame = gameList.find((g) => g.id === game.id);
      if (updatedGame) {
        setBetEnabled(updatedGame.isBetEnabled);
      }
    });

    return () => unsubscribe();
  }, [game.id]);



  const updateBettingStatus = (now) => {
    if (now < betStartTime) {
      setTimeDifference(`Betting starts at ${betStartTime.toLocaleTimeString()}`);
    } else if (now >= betStartTime && now <= betEndTime) {
      const diff = betEndTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeDifference(`⏱️ ${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeDifference(`Prediction Closed`);
    }
  };

  const isBeforeStart = betStartTime && currentTime < betStartTime;
  const isAfterEnd = betEndTime && currentTime > betEndTime;

  const handleBetNowClick = () => {
    setModalOpen(true);
  };

  return (
    <div className="game-card">
      {game.srNo && (
        <div className="sr-no-badge">{game.srNo}</div>
      )}
      <p className="league-title">{game.league}</p>
      <p className="timer">{timeDifference}</p>

      <div className="match-container">
        <div className="team">
          <img src={game.team1.logo} alt={game.team1.name} className="team-logo" />
          <p className="team-name" style={{ textAlign: 'center' }}><b>{game.team1.name}</b></p>
        </div>
        <div className="score"><img src="vs.gif" style={{ width: '70px' }} /></div>
        <div className="team">
          <img src={game.team2.logo} alt={game.team2.name} className="team-logo" />
          <p className="team-name" style={{ textAlign: 'center' }}><b>{game.team2.name}</b></p>
        </div>
      </div>
      <p className="match-time">{game.time}</p>

      <button
        className="bet-button"
        onClick={handleBetNowClick}
        disabled={!betEnabled || isBeforeStart || isAfterEnd}
      >
        {isBeforeStart ? "Prediction Not Started" : isAfterEnd || !betEnabled ? "Prediction Over" : "Play Now (राय लगाये)"}
      </button>
      {betEnabled && !isAfterEnd && (
        <button
          onClick={handleWhatsappShare}
          style={{
            marginTop: 10,
            width: "100%",
            background: "linear-gradient(135deg,#25D366,#128C7E)",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <img
            src="https://media.giphy.com/media/OrNkIcgmjBQeFM1vEs/giphy.gif"
            width={28}
            height={28}
            alt="wa"
          />
          WhatsApp पर शेयर करें और 9 कोईन्स जीतें
        </button>
      )}




      <BetNowModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        gameId={game.id}
        team1={game.team1.name}
        team2={game.team2.name}
        maxBetAmount={game.maxBetAmount}
      />
    </div>
  );
};

export default GameCard;
