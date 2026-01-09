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
  const [isRegistering, setIsRegistering] = useState(false); // 🔥 loader state

  const navigate = useNavigate();
  const location = useLocation();

  const newUserWallet = referCode ? 100 : 60;

  /* ---------------------------------------------
     🔗 AUTO-FILL REFER CODE FROM URL
  --------------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("ref");
    if (code) setReferCode(code);
  }, [location]);

  /* ---------------------------------------------
     🔥 REGISTER HANDLER (WITH LOADER)
  --------------------------------------------- */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (isRegistering) return; // 🛑 prevent double click
    setIsRegistering(true);
    setError("");

    try {
      /* -------- UNIQUE EMAIL CHECK -------- */
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const emailSnap = await getDocs(emailQuery);

      if (!emailSnap.empty) {
        toast.error("यह Email पहले से मौजूद है!");
        setIsRegistering(false);
        return;
      }

      /* -------- UNIQUE MOBILE CHECK -------- */
      const mobileQuery = query(
        collection(db, "users"),
        where("mobile", "==", mobile)
      );
      const mobileSnap = await getDocs(mobileQuery);

      if (!mobileSnap.empty) {
        toast.error("यह मोबाइल नंबर पहले से रजिस्टर है!");
        setIsRegistering(false);
        return;
      }

      /* -------- FIREBASE AUTH -------- */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userId = userCredential.user.uid;
      localStorage.setItem("userUID", userId);

      /* -------- GENERATE REFERRAL CODE -------- */
      const myReferralCode = userId.slice(0, 6).toUpperCase();

      /* -------- SAVE USER -------- */
      await setDoc(doc(db, "users", userId), {
        email,
        name,
        mobile,
        password,
        walletBalance: newUserWallet,
        isAdmin: false,
        bets: [],
        referralCode: myReferralCode,
        referredBy: referCode || null,
        createdAt: serverTimestamp(),
      });

      /* -------- REFERRAL BONUS -------- */
      if (referCode) {
        const q = query(
          collection(db, "users"),
          where("referralCode", "==", referCode)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const refUserDoc = querySnapshot.docs[0];
          const refUserId = refUserDoc.id;
          const oldBalance = refUserDoc.data().walletBalance || 0;

          await updateDoc(doc(db, "users", refUserId), {
            walletBalance: oldBalance + 100,
          });

          toast.success("🎉 Refer सफल! ₹100 बोनस जोड़ा गया");
        } else {
          toast.error("❌ गलत Refer Code!");
        }
      }

      toast.success("✅ रजिस्ट्रेशन सफल हुआ!");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error("रजिस्ट्रेशन असफल: " + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <div
        className="auth-container"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <ToastContainer />

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
              disabled={isRegistering}
            />

            <input
              type="tel"
              placeholder="मोबाइल नंबर दर्ज करें"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              disabled={isRegistering}
            />

            <input
              type="email"
              placeholder="ईमेल दर्ज करें"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isRegistering}
            />

            <input
              type="password"
              placeholder="पासवर्ड दर्ज करें"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isRegistering}
            />

            <input
              type="text"
              placeholder="Refer Code (यदि हो तो)"
              value={referCode}
              onChange={(e) => setReferCode(e.target.value)}
              disabled={isRegistering}
            />

            <button
              type="submit"
              disabled={isRegistering}
              style={{
                opacity: isRegistering ? 0.7 : 1,
                cursor: isRegistering ? "not-allowed" : "pointer",
              }}
            >
              {isRegistering ? "रजिस्टर हो रहा है..." : "रजिस्टर करें"}
            </button>
          </form>

          <p style={{ marginTop: "10px" }}>
            पहले से अकाउंट है?{" "}
            <Link to="/login">
              <span style={{ color: "yellow" }}>लॉगिन करें</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
