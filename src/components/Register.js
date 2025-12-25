import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [referCode, setReferCode] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-fill referral code from URL (?ref=XXXX)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("ref");
    if (code) setReferCode(code);
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ⭐ Step 1: Check UNIQUE EMAIL
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const emailSnap = await getDocs(emailQuery);

      if (!emailSnap.empty) {
        toast.error("यह Email पहले से मौजूद है!");
        return;
      }

      // ⭐ Step 2: Check UNIQUE MOBILE NUMBER
      const mobileQuery = query(
        collection(db, "users"),
        where("mobile", "==", mobile)
      );
      const mobileSnap = await getDocs(mobileQuery);

      if (!mobileSnap.empty) {
        toast.error("यह मोबाइल नंबर पहले से रजिस्टर है!");
        return;
      }

      // ⭐ Firebase Auth Create User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userId = userCredential.user.uid;

      localStorage.setItem("userUID", userId);

      // ⭐ Unique Referral Code for User
      const myReferralCode = userId.slice(0, 6).toUpperCase();

      // ⭐ Save User in Firestore
      await setDoc(doc(db, "users", userId), {
        email,
        name,
        mobile,
        password,
        walletBalance: 50,
        isAdmin: false,
        bets: [],
        referralCode: myReferralCode,
        referredBy: referCode || null,
        createdAt: serverTimestamp(),
      });

      // ⭐ Referral Bonus System
      if (referCode) {
        const q = query(
          collection(db, "users"),
          where("referralCode", "==", referCode)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const refUser = querySnapshot.docs[0];
          const refUserId = refUser.id;
          const oldBalance = refUser.data().walletBalance || 0;

          await updateDoc(doc(db, "users", refUserId), {
            walletBalance: oldBalance + 100,
          });

          toast.success("Refer Successful! Refer करने वाले को ₹100 मिला!");
        } else {
          toast.error("गलत Refer Code!");
        }
      }

      toast.success("रजिस्ट्रेशन सफल हुआ!");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
      toast.error("रजिस्ट्रेशन असफल: " + err.message);
    }
  };

  return (
    <>
      <div className="auth-container" style={{ display: "flex", flexDirection: "column" }}>
        <ToastContainer /> <br/>
{/* <div className="bonus-container">
        <img
          src="/bonus.jpeg"
          className="bonus-image"
        />
      </div> */}
        <div className="auth-box">
          <h2>पंजीकरण करें</h2>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleRegister}>
            
            <input
              type="text"
              placeholder="नाम दर्ज करें"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="मोबाइल नंबर दर्ज करें"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="ईमेल दर्ज करें"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="पासवर्ड दर्ज करें"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Refer Code (यदि हो तो)"
              value={referCode}
              onChange={(e) => setReferCode(e.target.value)}
            />

            <button type="submit">रजिस्टर करें</button>
          </form>

          <p style={{ marginTop: "10px" }}>
            पहले से अकाउंट है?{" "}
            <Link to="/login">
              <p style={{ color: "yellow" }}>लॉगिन करें</p>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
