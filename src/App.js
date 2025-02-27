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
import { analytics } from "./firebase";
import { getFirestore, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { logEvent, getAnalytics } from 'firebase/analytics';
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
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ChatRoom from "./components/ChatRoom";
import AdminChatControl from "./components/Admin/AdminChatControl";
import Lots from "./components/Lots";
import AdminImageUpload from "./components/Admin/AdminImageUpload";
import ResultsTable from "./components/Admin/ResultsTable";
import DeleteVideo from './components/Admin/DeleteVideo';
import BullockCartRacingGame from "./components/BullockCartRacingGame";
function App() {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(undefined);  // Initially undefined to track loading state
  const navigate = useNavigate();

  useEffect(() => {
    logEvent(analytics, 'app_open');  // Log app open event
    
    const auth = getAuth();
    const db = getFirestore();
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);  // Set user state
  
      if (currentUser) {
        const userRef = doc(db, 'online_users', currentUser.uid);
  
        // Function to mark user online
        const markOnline = () => {
          setDoc(userRef, {
            uid: currentUser.uid,
            username: currentUser.displayName || currentUser.email || 'Anonymous',
            online: true,
            last_active: serverTimestamp(),
          });
        };
  
        // Function to mark user offline
        const markOffline = () => {
          updateDoc(userRef, {
            online: false,
            last_active: serverTimestamp(),
          });
        };
  
        // Mark user online if the page is visible
        if (document.visibilityState === 'visible') {
          markOnline();
        }
  
        // Listen for visibility changes (tab switches, minimize, etc.)
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            markOnline();
          } else {
            markOffline();
          }
        };
  
        document.addEventListener('visibilitychange', handleVisibilityChange);
  
        // Remove user from Firestore when the app is closed completely
        const handleBeforeUnload = () => {
          deleteDoc(userRef);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
  
        // Cleanup when component unmounts
        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('beforeunload', handleBeforeUnload);
          deleteDoc(userRef);  // Ensure user is removed from Firestore
        };
      }
    });
  
    // Cleanup Firebase auth listener when component unmounts
    return () => unsubscribe();
  }, []);
  if (user === undefined) {
    // Show a loading indicator while determining authentication state
    return  <div className="loader-container">
    <div className="loader"></div>
    <p>Loading Games...</p>
  </div>
  }

  return (
    <div className="app-container">
      <Navbar />
      <main style={{ height: "600px", overflow: "scroll" }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<ProtectedRoute user={user} allowGuest={true}><GameList /></ProtectedRoute>} />
          <Route path="/addmoney" element={<ProtectedRoute user={user}><PaymentComponent /></ProtectedRoute>} />
          <Route path="/withdrawal" element={<ProtectedRoute user={user}><WithdrawalRequest /></ProtectedRoute>} />
          <Route path="/bets" element={<ProtectedRoute user={user}><BetStatusListener /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user}><ProfileSection /></ProtectedRoute>} />
          <Route path="/mydeposits" element={<ProtectedRoute user={user}><MoneyRequestsList /></ProtectedRoute>} />
          <Route path="/mywithdrawals" element={<ProtectedRoute user={user}><WithdrawalHistory /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute user={user}><ChatRoom /></ProtectedRoute>} />
          {/* Admin Routes */}
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
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <Box sx={{ width: "100%" }} className="bottom-nav">
  <BottomNavigation
    showLabels
    value={value}
    onChange={(event, newValue) => {
      setValue(newValue);
    }}
        >
            <BottomNavigationAction
      label="Home"
      onClick={() => navigate("/")}
      icon={<HomeIcon />}
      sx={{
        "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
        "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
      }}
          />
             <BottomNavigationAction
      label="Bets"
      onClick={() => navigate("/bets")}
      icon={<PaymentsIcon />}
      sx={{
        "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
        "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
      }}
          />
              <BottomNavigationAction sx={{
        "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
        "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
      }}
      label="Chat"
      onClick={() => navigate("/chat")}
      icon={<ChatBubbleIcon />}
          />
    <BottomNavigationAction
      label="Withdrawal"
      onClick={() => navigate("/withdrawal")}
      icon={<AccountBalanceIcon />}
      sx={{
        "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
        "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
      }}
    />
       
           <BottomNavigationAction
    
    label="Money"
    onClick={() => navigate("/addmoney")}
    icon={<AccountBalanceWalletIcon />}
    sx={{
      "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
      "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
    }}
          />
          
    {user ? (
      <BottomNavigationAction
        label="Profile"
        onClick={() => navigate("/profile")}
        icon={<AccountCircleIcon />}
        sx={{
          "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
          "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
        }}
      />
    ) : (
      <BottomNavigationAction
        label="Login"
        onClick={() => navigate("/login")}
        icon={<LoginIcon />}
        sx={{
          "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
          "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
        }}
      />
    )}
  </BottomNavigation>
</Box>

    </div>
  );
}

export default App;
