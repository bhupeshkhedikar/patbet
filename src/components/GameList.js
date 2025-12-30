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
import VideoFeed from "./VideoFeed";
import BullockCartRacingGame from "./BullockCartRacingGame";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import ConstructionIcon from "@mui/icons-material/Construction";
import CampaignIcon from "@mui/icons-material/Campaign";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

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
          srNo: doc.data().srNo ? parseInt(doc.data().srNo) : Infinity,
        }))
        .sort((a, b) => a.srNo - b.srNo);

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
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#0e0e0e",
  }}
>
  {/* Logo */}
  <img
    src="/logonew.png"   // keep logo in public folder
    alt="Loading Logo"
    style={{
      width: 80,
      marginBottom: 16,
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />

  {/* Loader */}
  <div
    style={{
      width: 40,
      height: 40,
      border: "4px solid rgba(255,255,255,0.2)",
      borderTop: "4px solid #ff9800",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }}
  />

  {/* Text */}
  <p
    style={{
      marginTop: 14,
      fontSize: 14,
      color: "#ccc",
      letterSpacing: 1,
    }}
  >
    Loading Games...
  </p>

  {/* Inline Animations */}
  <style>
    {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.6; }
      }
    `}
  </style>
</div>
    );

  // ⭐ TAB DATA
  const tabData = [
  { label: "होम", icon: <HomeIcon />, color: "#FF9800" },
  { label: "ऑनलाइन पट", icon: <SportsEsportsIcon />, color: "#9C27B0" },
  { label: "लॉट", icon: <ContentPasteIcon />, color: "#43A047" },
  { label: "कौन जीतेगा?", icon: <CampaignIcon />, color: "#E91E63" },
  { label: "पट वीडियो", icon: <VideoCameraFrontIcon />, color: "#2196F3" },

];

  // ⭐ ICON TAB STYLE (Modern & Clean)
  const tabStyle = {
    width: "30%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    padding: "5px 0",
    borderRadius: "12px",
    border: "1.5px solid yellow",
    margin: "2.5px"
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* ⭐ BEAUTIFUL NEW TABS BAR */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "#1B1F36",
          padding: "10px 5px",
          display: "flex",
          justifyContent: "space-between",
          borderBottomLeftRadius: "18px",
          borderBottomRightRadius: "18px",
        }}
      >
        {tabData.map((tab, index) => (
          <Box
            key={index}
            onClick={() => setActiveTab(index)}
            sx={{
              ...tabStyle,
              backgroundColor:
                activeTab === index ? "rgba(255,255,255,0.08)" : "transparent",
              color: activeTab === index ? "#E91E63" : "#d2d2d2",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                color: activeTab === index ? tab.color : "#c2c2c2",
                transition: "0.3s",
              }}
            >
              {tab.icon}
            </div>

            <span
              style={{
                fontSize: "9px",
                fontWeight: activeTab === index ? "700" : "500",
                textAlign: "center",
              }}
            >
              {tab.label}
            </span>
          </Box>
        ))}
      </Box>

      {/* ⭐ TAB CONTENT */}
      <Box sx={{ flexGrow: 1, padding: "10px" }}>
        {activeTab === 0 ? (
          <div className="game-list">
            <AdBanner />
            <AutoSlider />

           {message ? (
  <p
    className="blink-color"
    style={{
      textAlign: "center",
      margin: "10px",
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
                <p style={{ textAlign:'center'}}>नये गेम्स जल्द हि शुरू होंगे! </p>
            )}
              <BullockCartRacingGame />
            <AdBanner />
          </div>
        ) : activeTab === 1 ? (
              <BullockCartRacingGame />
        
        ) : activeTab === 2 ? (
            <Lots />
      
        ) : activeTab === 3 ? (
              <Result />

        ) : (
                <VideoFeed />
        )}
      </Box>
    </Box>
  );
};

export default GameList;
