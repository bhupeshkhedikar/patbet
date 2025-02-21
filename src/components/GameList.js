import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box, useMediaQuery, useTheme } from "@mui/material";
import { db } from "../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import GameCard from "./GameCard";
import AutoSlider from "./AutoSlider";
import AdBanner from "./AdBanner";
import Results from "./Results";
import Lots from "./Lots";
import Result from "./Result";
import VideoFeed from "./VideoFeed"; // Import VideoFeed component

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          sx={{
            width: "100%",
            "& .MuiTab-root": {
              color: "white !important",
              fontWeight: "bold",
              fontSize: isMobile ? "12px" : "16px",
              boxShadow: '0px 0px 10px rgba(255, 215, 0, 0.5) ',
              textTransform: "none",
              padding: isMobile ? "6px 8px" : "10px 20px",
              minWidth: "unset",
              flex: 1,
              "&.Mui-selected": {
                color: "white !important",
                backgroundColor: "#E91E63",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "yellow",
              height: "3px",
              top: 0,
            },
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Lots" />
          <Tab label="कौन जितेगा..?" />
          <Tab label="Video Feed" /> {/* New Tab for Video Feed */}
        </Tabs>
      </Box>

      {/* Render Content Based on Active Tab */}
      <Box sx={{ flexGrow: 1, padding: "10px" }}>
        {activeTab === 0 ? (
          <div className="game-list">
            <AdBanner />
            <AutoSlider />
            {message ? (
              <p
                style={{
                  textAlign: "center",
                  margin: "10px",
                  color: "yellow",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {message}
              </p>
            ) : (
              <p className="text-center text-white mt-4">
                No announcement available
              </p>
            )}
            <h2 className="section-title">Upcoming Games</h2>
            {games.length > 0 ? (
              games.map((game) => <GameCard key={game.id} game={game} />)
            ) : (
              <p>No upcoming games</p>
            )}
            <AdBanner />
          </div>
        ) : activeTab === 1 ? (
          <Lots />
        ) : activeTab === 2 ? (
          <Result />
        ) : (
          <VideoFeed /> // Render Video Feed in the fourth tab
        )}
      </Box>
    </Box>
  );
};

export default GameList;
