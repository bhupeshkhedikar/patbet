import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import ReactPlayer from "react-player";
import { Button, TextField, Card, CardContent, Typography } from "@mui/material";
import "./video.css";
const VideoFeed = () => {
    const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const videosRef = collection(db, "youtubeVideos");
      const snapshot = await getDocs(videosRef);
      const videoList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideos(videoList);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleUpload = async () => {
    if (!videoUrl) return;

    try {
      await addDoc(collection(db, "youtubeVideos"), {
        url: videoUrl,
        uploadedBy: auth.currentUser ? auth.currentUser.email : "Anonymous",
        timestamp: new Date(),
      });
      setVideoUrl("");
      fetchVideos();
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div className="youtube-feed-container">
      <h2>🎥 YouTube Video Feed</h2>
      <div className="upload-section">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button onClick={handleUpload}>Upload</button>
      </div>
      <div className="video-feed">
        {videos.map((video) => (
          <div key={video.id} className="video-card">
            <ReactPlayer url={video.url} width="100%" height="200px" controls />
          </div>
        ))}
      </div>
    </div>
  );
};


export default VideoFeed;
