import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendPasswordResetEmail } from "firebase/auth";


import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const isAdmin = userData.isAdmin;

        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("isAdmin", isAdmin);

        toast.success("लॉगिन सफल हुआ!", { autoClose: 1000 });

        setTimeout(() => {
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        throw new Error("यूज़र डेटा नहीं मिला।");
      }
    } catch (err) {
      setError(err.message);
      toast.error("लॉगिन असफल! " + err.message);
    }
  };


  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.warn("कृपया ईमेल दर्ज करें");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("रीसेट लिंक आपके ईमेल पर भेज दिया गया है");
      setShowForgotPopup(false);
      setResetEmail("");
    } catch (error) {
      toast.error("ईमेल नहीं मिला या कुछ गलत हुआ");
    }
  };



  return (
    <div className="auth-container" style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer />

      <div className="bonus-container">
        <img
          src="/bonus.jpeg"
          className="bonus-image"
        />
      </div>

      <div className="auth-box">
        <h2>लॉगिन करें</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="ईमेल दर्ज करें"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD FIELD WITH SHOW/HIDE */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="पासवर्ड दर्ज करें"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="password-input"
            />

            <span
              onClick={() => setShowPass(!showPass)}
              className="show-hide-btn"
            >
              {showPass ? "Hide" : "Show"}
            </span>
          </div>
          <p
            onClick={() => setShowForgotPopup(true)}
            style={{
              color: "#00e5ff",
              cursor: "pointer",
              fontSize: "13px",
              textAlign: "right",
              marginTop: "6px"
            }}
          >
            पासवर्ड भूल गए?
          </p>



          <button type="submit">लॉगिन</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          क्या आपका अकाउंट नहीं है?{" "}
          <Link to="/register">
            <p style={{ color: "yellow", display: "inline" }}>रजिस्टर करें</p>
          </Link>
        </p>
      </div>
      {showForgotPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#111",
              padding: "20px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "350px",
              boxShadow: "0 0 20px rgba(0,255,255,0.3)",
            }}
          >
            <h3 style={{ color: "#fff", marginBottom: "10px" }}>
              पासवर्ड रीसेट करें
            </h3>

            <input
              type="email"
              placeholder="ईमेल दर्ज करें"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                marginBottom: "12px",
              }}
            />

            <button
              onClick={handleResetPassword}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "linear-gradient(90deg,#00e5ff,#00bcd4)",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              रीसेट लिंक भेजें
            </button>

            <button
              onClick={() => setShowForgotPopup(false)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "8px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid #555",
                color: "#ccc",
                cursor: "pointer",
              }}
            >
              रद्द करें
            </button>
          </div>
        </div>
      )}

    </div>


  );
};

export default Login;
