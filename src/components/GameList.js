import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box, useMediaQuery, useTheme } from "@mui/material";
import { db } from "../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import GameCard from "./GameCard";
import AutoSlider from "./AutoSlider";
import AdBanner from "./AdBanner";
import Results from "./Results"; // Import Results component
import Lots from "./Lots";
import Result from "./Result";

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = Results

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small (mobile)

  useEffect(() => {
    const gamesCollection = collection(db, "games");

    const unsubscribe = onSnapshot(gamesCollection, (snapshot) => {
      const gamesList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      setGames(gamesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const announcementDocRef = doc(db, "announcements", "mainAnnouncement");
      const docSnap = await getDoc(announcementDocRef);
      if (docSnap.exists()) {
        setMessage(docSnap.data().message);
      }
    };
    fetchAnnouncement();
  }, []);

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Games...</p>
      </div>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Horizontal Tabs */}
      <Box
        sx={{
          bgcolor: "#222",
          color: "white !important",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          // padding: "10px",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable" // Allow scrolling if tabs don't fit
          scrollButtons="auto" // Show scroll buttons if needed
          textColor="inherit"
          sx={{
            width: "100%",
            "& .MuiTab-root": {
              color: "white !important",
              fontWeight: "bold",
              fontSize: isMobile ? "12px" : "16px", // Smaller font size on mobile
              textTransform: "none",
              padding: isMobile ? "6px 8px" : "10px 20px", // Reduced padding on mobile
              minWidth: "unset", // Allow tabs to shrink
              flex: 1, // Distribute space evenly among tabs
              "&.Mui-selected": {
                color: " white !important", // Keep text color for active tab
                backgroundColor: "#E91E63", // Remove background color
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: 'yellow', // Red underline for active tab
              height: "3px", // Adjust underline height
              top: 0, // Move the indicator to the top
            },
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Lots" />
          <Tab label="कौन जितेगा" />{/* Add a third tab */}
        </Tabs>
      </Box>

      {/* Render Content Based on Active Tab */}
      <Box sx={{ flexGrow: 1, padding: "10px" }}>
        {activeTab === 0 ? (
          <div className="game-list">
            <AdBanner />
            <AutoSlider />
            {message ? (
              <p style={{ textAlign: "center", margin: "10px", color: "yellow", fontSize: "14px", fontWeight: "bold" }}>{message}</p>
            ) : (
              <p className="text-center text-white mt-4">No announcement available</p>
            )}
                        <h2 className="section-title">Upcoming Games</h2>
            {games.length > 0 ? games.map((game) => <GameCard key={game.id} game={game} />) : <p>No upcoming games</p>}
            <AdBanner />
          </div>
        ) : activeTab === 1 ? (
          <Lots/>
          //  <Results />
        ) : (
          <div> <Result /></div> // Render content for the third tab
        )}
      </Box>
    </Box>
  );
};

export default GameList;