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
import BullockCartRacingGame from "./BullockCartRacingGame";

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
          srNo: doc.data().srNo ? parseInt(doc.data().srNo) : Infinity, // Ensure it's an integer
        }))
        .sort((a, b) => a.srNo - b.srNo); // Correct sorting from 1,2,3...

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
          <Tab label="Video Feed" />
           <Tab label="ऑनलाइन पट" />
          {/* New Tab for Video Feed */}
        </Tabs>
      </Box>

      {/* Render Content Based on Active Tab */}
      <Box sx={{ flexGrow: 1, padding: "10px" }}>
        {activeTab === 0 ? (
          <div className="game-list">
           {/* <h3 style={{ textAlign: "center", fontFamily: "Roboto, sans-serif" }}>
  होडी के गेम सुबह १० बजे से शुरू हो चुके हे | कम से कम १०० रू. से बेटिंग शुरू होगी | 
  अभी अपना अकाऊन्ट रिचार्ज करा के रखे
</h3> */}

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
      ) : activeTab === 3 ? (
        <VideoFeed /> // Tab 3 now shows VideoFeed
      ) : (
        <BullockCartRacingGame /> // Tab 4 for BullockCartRacingGame
      )}
      </Box>
    </Box>
  );
};

export default GameList;
