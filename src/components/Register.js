import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // Import Firebase Auth & Firestore
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import { Link, useNavigate } from "react-router-dom"; // Fixed incorrect import
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles
import { serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset any existing errors

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Get the user ID
      const userId = userCredential.user.uid;

      // Save UID to localStorage
      localStorage.setItem("userUID", userId);

      // Add user data to Firestore
      await setDoc(doc(db, "users", userId), {
        email: email,
        name,
        walletBalance: 100,  // Initial wallet balance
        isAdmin: false, // Default admin status
        bets: [], // Initialize empty array for user's bets
        createdAt: serverTimestamp()
      });

      // Show success toast
      toast.success("Registration Successful!", { autoClose: 2000 });

      // Redirect after showing the toast
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      setError(err.message); // Set error if registration fails
      toast.error("Registration Failed! " + err.message);
    }
  };

  return (
    <>
   
    <div className="auth-container" style={{display:'flex', flexDirection:'column'}}>
        <ToastContainer /> {/* Toast container for notifications */}
        <div className="bonus-container">
        <img src='https://i.ibb.co/LdL5xRp9/1741105411005.png' className="bonus-image" />
    </div>
        {/* <img src='https://i.ibb.co/p6qMF6fY/1739549616894.png' height='30%' width='80%'/> */}
        <div className="auth-box">
       
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleRegister}>
        <input
            type="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login"><p style={{color:'yellow'}}>Login</p></Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Register;
