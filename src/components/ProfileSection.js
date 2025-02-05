import React, { useEffect, useState } from "react";
import "../../src/ProfileSection.css";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileSection = () => {
    const [userData, setUserData] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]); // New State for Withdrawals
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
  
      const fetchWithdrawals = async (userId) => {
        try {
          const withdrawalsRef = collection(db, "withdrawalRequests");
          const q = query(withdrawalsRef, where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
  
          const withdrawalData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setWithdrawals(withdrawalData);
        } catch (error) {
          console.error("Error fetching withdrawals:", error);
        }
      };
  
      fetchUserData();
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
    <><ToastContainer /><div className="profile-container">
      <div className="profile-header">
        <img src={userData?.avatar || "https://www.pngarts.com/files/3/Cool-Avatar-Transparent-Image.png"} className="avatar" />
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
          <p className="highlight">{userData?.walletBalance || "0"}</p>
          <p>Total Income</p>
        </div>
        <div className="stat-box">
          <p className="highlight">{userData?.walletBalance || "0"}</p>
          <p>Total Recharge</p>
        </div>
        <div className="stat-box">
          <p className="highlight">{userData?.walletBalance || "0"}</p>
          <p>Total Assets</p>
        </div>
        <div className="stat-box">
          <p className="highlight">00</p>
          <p>Total Withdraw</p>
        </div>
        <div className="stat-box">
          <p className="highlight">00.00</p>
          <p>Today's Income</p>
        </div>
        <div className="stat-box">
          <p className="highlight">0</p>
          <p>All Income</p>
        </div>
      </div>

      <div className="balance-section">
        <span>
          <span className="balance">
          ₹.{userData?.walletBalance || "0"} <br />Recharge
          </span>
        </span>
        <span>
          <p>
            <span className="balance">₹.{userData?.walletBalance || "0.00"} <br />Balance</span>
          </p>
        </span>
      </div>


      <div className="action-buttons">
        <button className="action-btn" onClick={() => navigate("/addmoney")}>Recharge</button>
        <button className="action-btn withdrawal-btn" onClick={() => navigate("/withdrawal")}>Withdrawal</button>
      </div>

        {/* Withdrawals Section */}
        {withdrawals.length > 0 && (
        <div className="withdrawals-section">
          <h3>Withdrawals History</h3>
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="withdrawal-item">
              <p>
                Amount: <strong>₹{withdrawal.amount}</strong>
              </p>
              <p>Status: <span className={`status ${withdrawal.status.toLowerCase()}`}>{withdrawal.status}</span></p>
              <p>Date:{" "}
            {withdrawal.requestDate
              ? new Date(withdrawal.requestDate.seconds * 1000).toLocaleDateString()
              : "N/A"}</p>
            </div>
          ))}
        </div>
      )}


      {/* <div className="menu-list">
        <div className="menu-item">
          <img src="https://cdn-icons-png.flaticon.com/512/709/709699.png" alt="Product" />
          <span>My Activation Product</span>
        </div>
        <div className="menu-item">
          <img src="https://cdn-icons-png.flaticon.com/512/709/709659.png" alt="Transactions" />
          <span>Transactions</span>
        </div>
        <div className="menu-item">
          <img src="https://cdn-icons-png.flaticon.com/512/709/709682.png" alt="Bonus" />
          <span>Redemption Bonus</span>
        </div>
      </div> */}

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
