import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import GameList from "./components/GameList";
import { BrowserRouter as Router, Routes, Route } from "react-router"; 
import "./styless.css"; 
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import useGameWinnerListener from "./components/useGameWinnerListener";
import PaymentComponent from "./components/PaymentComponent";
import WithdrawalRequest from "./components/WithdrawalRequest";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BetStatusListener from "./components/BetStatusListener";
import { useNavigate } from "react-router-dom"; 
import ProfileSection from "./components/ProfileSection";
import LoginIcon from '@mui/icons-material/Login';
import { getAuth, onAuthStateChanged } from "firebase/auth";  // Import Firebase Authentication
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [value, setValue] = React.useState(0);
  const [user, setUser] = useState(null);  // State to track user authentication status
  const navigate = useNavigate();

  useGameWinnerListener();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);  // If user is logged in, set user
      } else {
        setUser(null);  // If no user is logged in, set user to null
      }
    });

    return () => unsubscribe();  // Clean up the listener on unmount
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      
      {/* Main content section */}
      <main style={{ height: "600px", overflow: "scroll" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Only accessible when logged in */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GameList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
           
                <AdminPanel />
            }
          />
          <Route
            path="/addmoney"
            element={
              <ProtectedRoute>
                <PaymentComponent />
                </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawal"
            element={
              <ProtectedRoute>
                <WithdrawalRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bets"
            element={
              <ProtectedRoute>
                <BetStatusListener />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSection />
              </ProtectedRoute>
            }
          />
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
            label="Withdrawal"
            onClick={() => navigate("/withdrawal")}
            icon={<AccountBalanceIcon />}
          />
          <BottomNavigationAction
            label="Wallet"
            onClick={() => navigate("/addmoney")}
            icon={<AccountBalanceWalletIcon />}
          />
          <BottomNavigationAction
            label="Home"
            onClick={() => navigate("/")}
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Bets"
            onClick={() => navigate("/bets")}
            icon={<PaymentsIcon />}
          />
          {user ? (
            <BottomNavigationAction
              label="Profile"
              onClick={() => navigate("/profile")}
              icon={<AccountCircleIcon />}
            />
          ) : (
            <BottomNavigationAction
              label="Login"
              onClick={() => navigate("/login")}
              icon={<LoginIcon />}
            />
          )}
        </BottomNavigation>
      </Box>
    </div>
  );
}

export default App;
