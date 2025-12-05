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
  const [withdrawals, setWithdrawals] = useState([]); // New State for Withdrawals
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
            fetchWithdrawals(userId); // Fetch Withdrawals
          } else {
            console.error("User document not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    const fetchWithdrawals = async userId => {
      try {
        const withdrawalsRef = collection(db, "withdrawalRequests");
        const q = query(withdrawalsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const withdrawalData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWithdrawals(withdrawalData);
        const totalWithdrawn = withdrawalData.reduce(
          (total, withdrawal) => total + Number(withdrawal.amount || 0),
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
          betsCount += 1;
        });

        setTotalWinnings(winnings);
        setTotalBets(betsCount);

        // Fetch user's deposits
        const depositsRef = query(
          collection(db, "addMoneyRequests"),
          where("userId", "==", userId),
          where("status", "==", "approved")
        );
        const depositsSnapshot = await getDocs(depositsRef);

        let depositsAmount = 0;

        depositsSnapshot.forEach((depositDoc) => {
          const depositData = depositDoc.data();
          depositsAmount += Number(depositData.amount) || 0;
        });

        setTotalDeposits(depositsAmount);
      } catch (error) {
        console.error("Error fetching user details:", error);
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
      console.error("Error logging out:", error);
      toast.error("Error logging out, please try again!");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="profile-container" style={{marginBottom:'80px'}}>
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
          </div>
          <br />
          {isLoggedIn && (
            <button className="action-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        <div className="stats-container">
          <div className="stat-box">
            <p className="highlight" style={{fontSize:'1.2em'}}>💵{userData?.walletBalance.toFixed(2) || "0"} </p>
            <p>Total Balance</p>
          </div>
          <div className="stat-box">
            <p className="highlight">💵{totalWinnings.toFixed(2)}</p>
            <p>Total Income</p>
          </div>
          <div className="stat-box">
          <p className="highlight">💵{totalDeposits.toFixed(2)}</p>
            <p>Total Recharge</p>
          </div>
          <div className="stat-box">
            <p className="highlight">
              💵{totalWithdrawal.toFixed(2)}
            </p>
            <p>Total Redemption</p>
          </div>
          <div className="stat-box">
            <p className="highlight">{totalBets}</p>
            <p>Total Predictions</p>
          </div>
          <div className="stat-box">
            <p className="highlight">
              💵{totalWinnings.toFixed(2)}
            </p>
            <p>All Winnings</p>
          </div>
        </div>

        {/* <div className="balance-section">
          <span>
            <span className="balance">
              💵.{userData?.walletBalance || "0"} <br />
              Recharge
            </span>
          </span>
          <span>
            <p>
              <span className="balance">
                💵.{userData?.walletBalance || "0.00"} <br />
                Balance
              </span>
            </p>
          </span>
        </div> */}
        {/* <GoogleAd 
    client="ca-pub-9925801540177456" 
    slot="4077906455" 
      /> */}
          <AdBanner/>
        <div className="action-buttons" style={{marginTop:'15px'}}>
          <button className="action-btn" onClick={() => navigate("/addmoney")}>
            Recharge
          </button>
          <button
            className="action-btn withdrawal-btn"
            onClick={() => navigate("/withdrawal")}
          >
            Withdrawal
          </button>
        </div>

       <div className="menu-list">
        <div className="menu-item" onClick={() => navigate("/mydeposits")}>
          <img src="https://cdn-icons-png.flaticon.com/512/5776/5776487.png" alt="Product" />
          <span>My Top-ups</span>
        </div>
        <div className="menu-item" onClick={() => navigate("/mywithdrawals")}>
          <img src="https://cdn-icons-png.flaticon.com/512/8813/8813844.png" alt="Transactions" />
          <span>My Redemptions</span>
          </div>
          <div className="menu-item" onClick={() => navigate("/termsandconditions")}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjEHla3jGSCPLhR1UjGKruLlDiCk3xd2MwLg&s" alt="tc" />
          <span>Terms and Conditions </span>
        </div>
        {/* <div className="menu-item">
          <img src="https://cdn-icons-png.flaticon.com/512/709/709682.png" alt="Bonus" />
          <span>Redemption Bonus</span>
        </div> */}
      </div> 

        {/* <div className="bottom-nav">
        <div className="bottom-nav-item">Home</div>
        <div className="bottom-nav-item">Products</div>
        <div className="bottom-nav-item">Team</div>
        <div className="bottom-nav-item active">Personal</div>
    </div> */}
      </div>
    </>
  );
};

export default ProfileSection;
