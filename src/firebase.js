
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";  // Correct import for Realtime Database
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Firebase config (use your own config here)

const firebaseConfig = {
  apiKey: "AIzaSyC8m-U7ZgEtdnhsuVQKCVl7-4O_R6Tu6oA",
  authDomain: "patbet-a645f.firebaseapp.com",
  projectId: "patbet-a645f",
  storageBucket: "patbet-a645f.firebasestorage.app",
  messagingSenderId: "235562665382",
  appId: "1:235562665382:web:e2b716daf8389382763b67",
  measurementId: "G-0W2Q81JBGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Database instances
const auth = getAuth(app);
const db = getFirestore(app); // Use getDatabase instead of directly using .ref

export { auth, db };  // Export db and auth
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };
