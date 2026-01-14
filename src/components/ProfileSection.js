import React, { useEffect, useState } from "react";
import "../../src/ProfileSection.css";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GoogleAd from "./GoogleAd";
import AdBanner from "./AdBanner";

const ProfileSection = () => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      const storedUID = localStorage.getItem("userUID");

      if (user || storedUID) {
        setIsLoggedIn(true);
        const userId = user?.uid || storedUID;

        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
            fetchWithdrawals(userId);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

const fetchWithdrawals = async (userId) => {
  try {
    const withdrawalsRef = collection(db, "withdrawalRequests");

    // ✅ ONLY APPROVED WITHDRAWALS
    const q = query(
      withdrawalsRef,
      where("userId", "==", userId),
      where("status", "==", "approved")
    );

    const querySnapshot = await getDocs(q);

    const withdrawalData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setWithdrawals(withdrawalData);

    // ✅ SUM ONLY APPROVED AMOUNT
    const totalWithdrawn = withdrawalData.reduce(
      (total, w) => total + Number(w.amount || 0),
      0
    );

    setTotalWithdrawal(totalWithdrawn);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
  }
};


    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      const storedUID = localStorage.getItem("userUID");
      const userId = user?.uid || storedUID;

      if (!userId) return;

      try {
        // Fetch user's bets
        const betsRef = collection(db, "users", userId, "bets");
        const betsSnapshot = await getDocs(betsRef);

        let winnings = 0;
        let betsCount = 0;

        betsSnapshot.forEach((betDoc) => {
          const betData = betDoc.data();
          winnings += Number(betData.winnings) || 0;
          betsCount++;
        });

        setTotalWinnings(winnings);
        setTotalBets(betsCount);

        // Fetch user's approved deposits
        const depositsRef = query(
          collection(db, "addMoneyRequests"),
          where("userId", "==", userId),
          where("status", "==", "approved")
        );
        const depositsSnapshot = await getDocs(depositsRef);

        let depositsAmount = 0;
        depositsSnapshot.forEach((doc) => {
          depositsAmount += Number(doc.data().amount) || 0;
        });

        setTotalDeposits(depositsAmount);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userUID");

      toast.success("Logged out successfully!", {
        autoClose: 1000,
        onClose: () => navigate("/login"),
      });

      setIsLoggedIn(false);
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="profile-container" style={{ marginBottom: "80px" }}>
        <div className="profile-header">
          <img
            src={
              userData?.avatar ||
              "https://www.pngarts.com/files/3/Cool-Avatar-Transparent-Image.png"
            }
            className="avatar"
          />

          <div className="user-info">
            <h2>{userData?.name || "Guest User"}</h2>
            <p>Email: {userData?.email || "No email available"}</p>
          </div> <br/>

          {isLoggedIn && (
            <button className="action-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        {/* ⭐ USER STATS */}
        <div className="stats-container">
          <div className="stat-box">
            <p className="highlight" style={{ fontSize: "1.2em" }}>
              {userData?.walletBalance.toFixed(2) || "0"}
            </p>
            <p style={{fontSize:'10px',marginTop:'10px'}}>Total Coins</p>
          </div>

          <div className="stat-box">
            <p className="highlight">{totalWinnings.toFixed(2)}</p>
            <p style={{fontSize:'10px',marginTop:'10px'}}>Earned Coins</p>
          </div>

          <div className="stat-box">
            <p className="highlight">{totalDeposits.toFixed(2)}</p>
            <p style={{fontSize:'10px',marginTop:'10px'}}>Total TopUp</p>
          </div>

          <div className="stat-box">
            <p className="highlight">{totalWithdrawal.toFixed(2)}</p>
            <p style={{fontSize:'10px',marginTop:'10px'}}>Total Redeem</p>
          </div>

          <div className="stat-box">
            <p className="highlight">{totalBets}</p>
            <p style={{fontSize:'10px',marginTop:'10px'}}>Total Predictions</p>
          </div>

          <div className="stat-box">
            <p className="highlight">{totalWinnings.toFixed(2)}</p>
            <p style={{fontSize:'10px',marginTop:'10px'}}>All Winnings</p>
          </div>
        </div>

        {/* ⭐ REFER & EARN BANNER */}
        <div
          onClick={() => navigate("/referral")}
          style={{
            marginTop: 20,
            background: "linear-gradient(90deg,#ff9a00,#ff3d00)",
            padding: "18px 15px",
            borderRadius: 18,
            color: "white",
            fontWeight: 700,
            fontSize: 17,
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          🎁 दोस्तों को Invite करें और हर सफल रेफ़रल पर 100 कमाएँ!
        </div>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={() => navigate("/referral")}
            style={{
              background: "linear-gradient(90deg,#6a11cb,#2575fc)",
              border: "none",
              padding: "12px 25px",
              color: "white",
              borderRadius: 25,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            🚀 Refer Now
          </button>
        </div>

        {/* ⭐ ADS */}
        <AdBanner />

        {/* ⭐ ACTION BUTTONS */}
        <div className="action-buttons" style={{ marginTop: "15px" }}>
          <button className="action-btn" onClick={() => navigate("/addmoney")}>
            Top-up
          </button>
          <button
            className="action-btn withdrawal-btn"
            onClick={() => navigate("/withdrawal")}
          >
            Redemption
          </button>
        </div>

        {/* ⭐ MENU LIST */}
        <div className="menu-list">
          <div className="menu-item" onClick={() => navigate("/mydeposits")}>
            <img src="https://cdn-icons-png.flaticon.com/512/5776/5776487.png" />
            <span>My Top-ups</span>
          </div>

          <div className="menu-item" onClick={() => navigate("/mywithdrawals")}>
            <img src="https://cdn-icons-png.flaticon.com/512/8813/8813844.png" />
            <span>My Redemptions</span>
          </div>

          <div
            className="menu-item"
            onClick={() => navigate("/termsandconditions")}
          >
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjEHla3jGSCPLhR1UjGKruLlDiCk3xd2MwLg&s" />
            <span>Terms and Conditions</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSection;
