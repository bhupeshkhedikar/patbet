import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import GameList from "./components/GameList";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import PaymentComponent from "./components/PaymentComponent";
import WithdrawalRequest from "./components/WithdrawalRequest";
import ProfileSection from "./components/ProfileSection";
import BetStatusListener from "./components/BetStatusListener";

import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LoginIcon from "@mui/icons-material/Login";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styless.css";
import { Navigate } from "react-router-dom";

import AddGame from "./components/Admin/AddGame";
import ManageGames from "./components/Admin/ManageGames";
import Transactions from "./components/Admin/Transactions";
import OnlineUsers from "./components/Admin/OnlineUsers";
import RegisteredUsers from "./components/Admin/RegisteredUsers";
import BetsHistory from "./components/Admin/BetsHistroy";
import ManageTimes from "./components/Admin/ManageTimes";
import AnnouncementManager from "./components/Admin/AnnouncementManager";
import AdminNavbar from "./components/Admin/AdminNavbar";
import MoneyRequestsList from "./components/MoneyRequestsList";
import WithdrawalHistory from "./components/WithdrawalHistory";
import ChatRoom from "./components/ChatRoom";
import AdminChatControl from "./components/Admin/AdminChatControl";
import AdminImageUpload from "./components/Admin/AdminImageUpload";
import ResultsTable from "./components/Admin/ResultsTable";
import DeleteVideo from "./components/Admin/DeleteVideo";
import BullockCartRacingGame from "./components/BullockCartRacingGame";
import TermsAndConditions from "./components/TermsAndConditions";

import { analytics } from "./firebase";
import { getFirestore, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import InstallPopup from "./components/InstallPopup";
import AdminPanell from "./components/Admin/gameadmin/AdminPanell";
import Footer from "./components/Footer";

function App() {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    logEvent(analytics, "app_open");

    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);

      if (currentUser) {
        const userRef = doc(db, "online_users", currentUser.uid);

        const markOnline = () => {
          setDoc(userRef, {
            uid: currentUser.uid,
            username: currentUser.displayName || currentUser.email || "Anonymous",
            online: true,
            last_active: serverTimestamp(),
          });
        };

        const markOffline = () =>
          updateDoc(userRef, {
            online: false,
            last_active: serverTimestamp(),
          });

        if (document.visibilityState === "visible") markOnline();

        const handleVisibilityChange = () =>
          document.visibilityState === "visible" ? markOnline() : markOffline();

        document.addEventListener("visibilitychange", handleVisibilityChange);

        const handleBeforeUnload = () => deleteDoc(userRef);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("beforeunload", handleBeforeUnload);
          deleteDoc(userRef);
        };
      }
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Games...</p>
      </div>
    );
  }

  // ⭐ Styling (Updated Theme Colors)
const navItem = {
  "& .MuiSvgIcon-root": {
    fontSize: "1.6rem",
    color: "#B0B0B0",
    marginBottom: "3px", // aligns icon perfectly
  },
  "&.Mui-selected .MuiSvgIcon-root": {
    color: "#E91E63",
  },
  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.50rem",
    marginTop: "2px",
    color: "#B0B0B0",
  },
  "&.Mui-selected .MuiBottomNavigationAction-label": {
    color: "#E91E63",
    fontWeight: "600",
  },
};


  return (
    
    <>
    
      <InstallPopup /><div className="app-container">

      <Navbar />
      <main style={{ height: "600px", overflow: "scroll" }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          <Route
            path="/"
            element={<ProtectedRoute user={user} allowGuest={true}><GameList /></ProtectedRoute>} />
          <Route path="/addmoney" element={<ProtectedRoute user={user}><PaymentComponent /></ProtectedRoute>} />
          <Route path="/withdrawal" element={<ProtectedRoute user={user}><WithdrawalRequest /></ProtectedRoute>} />
          <Route path="/bets" element={<ProtectedRoute user={user}><BetStatusListener /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user}><ProfileSection /></ProtectedRoute>} />
          <Route path="/mydeposits" element={<ProtectedRoute user={user}><MoneyRequestsList /></ProtectedRoute>} />
          <Route path="/mywithdrawals" element={<ProtectedRoute user={user}><WithdrawalHistory /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute user={user}><ChatRoom /></ProtectedRoute>} />

          {/* ADMIN ROUTES */}
          <Route path="/apna/*" element={<ProtectedRoute user={user}><AdminNavbar /><AdminPanel /></ProtectedRoute>} />
          <Route path="/manage-games" element={<ProtectedRoute user={user}><AdminNavbar /><ManageGames /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute user={user}><AdminNavbar /><Transactions /></ProtectedRoute>} />
          <Route path="/online-users" element={<ProtectedRoute user={user}><AdminNavbar /><OnlineUsers /></ProtectedRoute>} />
          <Route path="/registered-users" element={<ProtectedRoute user={user}><AdminNavbar /><RegisteredUsers /></ProtectedRoute>} />
          <Route path="/bets-history" element={<ProtectedRoute user={user}><AdminNavbar /><BetsHistory /></ProtectedRoute>} />
          <Route path="/manage-times" element={<ProtectedRoute user={user}><AdminNavbar /><ManageTimes /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute user={user}><AdminNavbar /><AnnouncementManager /></ProtectedRoute>} />
          <Route path="/chatcontrol" element={<ProtectedRoute user={user}><AdminNavbar /><AdminChatControl /></ProtectedRoute>} />
          <Route path="/lotsfeed" element={<ProtectedRoute user={user}><AdminNavbar /><AdminImageUpload /></ProtectedRoute>} />
          <Route path="/manageresults" element={<ProtectedRoute user={user}><AdminNavbar /><ResultsTable /></ProtectedRoute>} />
          <Route path="/delete-video" element={<ProtectedRoute user={user}><DeleteVideo /></ProtectedRoute>} />
          <Route path="/race" element={<ProtectedRoute user={user}><BullockCartRacingGame /></ProtectedRoute>} />
          <Route path="/termsandconditions" element={<ProtectedRoute user={user}><TermsAndConditions /></ProtectedRoute>} />
             <Route path="/radmin" element={<ProtectedRoute user={user}><AdminPanell /></ProtectedRoute>} />
        </Routes>
      </main>
     <Footer />
      {/* ⭐ UPDATED BOTTOM NAV WITHOUT CHAT + NEW COLORS */}
      {/* ⭐ FIXED ALIGNMENT BOTTOM NAVIGATION */}
      <Box
        sx={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#1B1F36",
          boxShadow: "0px -2px 8px rgba(0,0,0,0.25)",
          zIndex: 2000,
          paddingBottom: "3px",
          height: "78px",
        }}
      >
        {/* ⭐ Floating Center Button */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "-32px",
            transform: "translateX(-50%)",
            width: "65px",
            height: "65px",
            background: "#FF9800",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
            cursor: "pointer",
            marginTop: "5px",
            zIndex: 3000,
          }}
          onClick={() => navigate("/")}
        >
          <HomeIcon style={{ fontSize: "34px", color: "white" }} />
        </div>

        <BottomNavigation
          showLabels
          value={value}
          onChange={(e, newValue) => setValue(newValue)}
          sx={{
            height: "78px",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            backgroundColor: "#1B1F36",
          }}
        >
          {/* ⭐ Hindi Titles */}
          <BottomNavigationAction
            label="मेरी राय"
            icon={<PaymentsIcon />}
            onClick={() => navigate("/bets")}
            sx={navItem} />

          <BottomNavigationAction
            label="रिडीम करें"
            icon={<AccountBalanceIcon />}
            onClick={() => navigate("/withdrawal")}
            sx={navItem} />

          {/* Center gap */}
          <div style={{ width: "70px" }}></div>

          <BottomNavigationAction
            label="टॉप-अप करें"
            icon={<AccountBalanceWalletIcon />}
            onClick={() => navigate("/addmoney")}
            sx={navItem} />

          {user ? (
            <BottomNavigationAction
              label="प्रोफ़ाइल"
              icon={<AccountCircleIcon />}
              onClick={() => navigate("/profile")}
              sx={navItem} />
          ) : (
            <BottomNavigationAction
              label="लॉगिन"
              icon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={navItem} />
          )}
        </BottomNavigation>
      </Box>


    </div></>
  );
}

export default App;
