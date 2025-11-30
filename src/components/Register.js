import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userId = userCredential.user.uid;

      localStorage.setItem("userUID", userId);

      await setDoc(doc(db, "users", userId), {
        email: email,
        name,
        walletBalance: 100,
        isAdmin: false,
        bets: [],
        password,
        createdAt: serverTimestamp()
      });

      toast.success("रजिस्ट्रेशन सफल हुआ!", { autoClose: 2000 });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message);
      toast.error("रजिस्ट्रेशन असफल! " + err.message);
    }
  };

  return (
    <>
      <div className="auth-container" style={{ display: "flex", flexDirection: "column" }}>
        <ToastContainer />

        <div className="bonus-container">
          <img src="https://i.ibb.co/LdL5xRp9/1741105411005.png" className="bonus-image" />
            {/* <img src='https://i.ibb.co/p6qMF6fY/1739549616894.png' height='30%' width='80%'/> */}
        </div>

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
