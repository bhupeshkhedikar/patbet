import React, { useState, useEffect } from "react";
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import ReactPlayer from "react-player";
import "./DeleteVideo.css";

const DeleteVideo = () => {
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

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await deleteDoc(doc(db, "youtubeVideos", videoId));
      setVideos(videos.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>📂 Admin Panel - Manage Videos</h2>
      <div className="video-list">
        {videos.map((video) => (
          <div key={video.id} className="video-card">
            <ReactPlayer url={video.url} width="100%" height="200px" controls />
            <p className="uploader">Uploaded by: {video.uploadedBy || "Unknown"}</p>
            <button className="delete-btn" onClick={() => handleDelete(video.id)}>
              ❌ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeleteVideo;
