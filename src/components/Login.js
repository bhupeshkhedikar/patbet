import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Firebase auth import
import { Link, useNavigate } from "react-router-dom"; // Router for navigation
import { ToastContainer, toast } from "react-toastify"; // Toast notifications
import "react-toastify/dist/ReactToastify.css"; // Toast styles

import { getDoc, doc } from "firebase/firestore"; // Firestore imports
import { db } from "../firebase"; // Firebase Firestore import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore to check if they are an admin
      const userDocRef = doc(db, "users", user.uid); // User document reference
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const isAdmin = userData.isAdmin; // Fetch isAdmin from Firestore

        // Save user data to localStorage (UID and isAdmin)
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("isAdmin", isAdmin);

        // Display success message
        toast.success("Login Successful!", { autoClose: 1000 });

        // Redirect directly to the Admin Panel if user is admin
        setTimeout(() => {
          if (isAdmin) {
            navigate("/admin"); // Redirect to Admin Panel if user is admin
          } else {
            navigate("/"); // Redirect to Home page if user is not an admin
          }
        }, 1000);
      } else {
        throw new Error("User data not found in Firestore.");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Login Failed! " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <div className="auth-box">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register"><p style={{color:'yellow'}}>Register</p></Link>
        </p>
      </div>
    </div>
    
  );
};

export default Login;
