import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { FaWallet } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        subscribeToBalance(user.uid); // Real-time subscription
      } else {
        setIsLoggedIn(false);
        setBalance(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const subscribeToBalance = (userId) => {
    const userRef = doc(db, "users", userId);
    
    // Real-time listener for wallet balance
    const unsubscribeBalance = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const newBalance = docSnap.data().walletBalance || 0;
        
        // Update balance only if there's a change
        setBalance((prev) => (prev !== newBalance ? newBalance : prev));
      } else {
        console.error("User document not found");
      }
    });

    return unsubscribeBalance;
  };

  return (
    <nav className="navbar">
      <img
        src="https://i.ibb.co/5WPzx53W/patbet-logo.png"
        alt="Logo"
        className="logo"
        onClick={() => navigate("/")}
      />

      {isLoggedIn && (
        <div className="wallet-section" onClick={() => navigate("/wallet")}>
          <FaWallet className="wallet-icon" />
          <span className="balance-amount">₹{balance.toFixed(2)}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
