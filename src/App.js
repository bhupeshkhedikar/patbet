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
function App() {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(undefined);  // Initially undefined to track loading state
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);  // Set user once the state is determined
    });

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

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <GameList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
            <Route
            path="/addgames"
            element={
              <ProtectedRoute user={user}>
                <AddGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addmoney"
            element={
              <ProtectedRoute user={user}>
                <PaymentComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawal"
            element={
              <ProtectedRoute user={user}>
                <WithdrawalRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bets"
            element={
              <ProtectedRoute user={user}>
                <BetStatusListener />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
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
      sx={{
        "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
        "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
      }}
    />
    <BottomNavigationAction
      label="Wallet"
      onClick={() => navigate("/addmoney")}
      icon={<AccountBalanceWalletIcon />}
      sx={{
        "& .MuiSvgIcon-root": { fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } },
        "& .MuiBottomNavigationAction-label": { fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" } }
      }}
    />
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
