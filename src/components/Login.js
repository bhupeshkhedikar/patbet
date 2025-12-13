import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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


          <button type="submit">लॉगिन</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          क्या आपका अकाउंट नहीं है?{" "}
          <Link to="/register">
            <p style={{ color: "yellow", display: "inline" }}>रजिस्टर करें</p>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
