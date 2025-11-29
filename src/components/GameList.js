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
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Games...</p>
      </div>
    );

  // ⭐ TAB DATA
  const tabData = [
    { label: "मुखपृष्ठ", icon: <HomeIcon />, color: "#FF9800" },
    { label: "लॉट", icon: <ContentPasteIcon />, color: "#43A047" },
    { label: "कोण जिंकेल..?", icon: <CampaignIcon />, color: "#E91E63" },
    { label: "पटाचे व्हिडीओ", icon: <VideoCameraFrontIcon />, color: "#2196F3" },
    { label: "ऑनलाइन पट", icon: <SportsEsportsIcon />, color: "#9C27B0" },
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
          <VideoFeed />
        ) : (
          <BullockCartRacingGame />
        )}
      </Box>
    </Box>
  );
};

export default GameList;
