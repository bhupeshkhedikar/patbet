import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import "../Admin/AnnouncementManager.css";

const AnnouncementManager = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const announcementDocRef = doc(db, "announcements", "mainAnnouncement");

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    const docSnap = await getDoc(announcementDocRef);
    if (docSnap.exists()) {
      setMessage(docSnap.data().message);
    }
    setLoading(false);
  };

  const handleSaveAnnouncement = async () => {
    await setDoc(announcementDocRef, { message });
    fetchAnnouncement();
  };

  const handleDeleteAnnouncement = async () => {
    await deleteDoc(announcementDocRef);
    setMessage("");
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="announcement-manager">
    <h2>Manage Announcement</h2>

    <div className="form">
      <textarea
        placeholder="Enter your announcement here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>

      <button
        className="bg-green-500"
        onClick={handleSaveAnnouncement}
      >
        {message ? "Update Announcement" : "Add Announcement"}
      </button>

      {message && (
        <button
          className="bg-red-500"
          onClick={handleDeleteAnnouncement}
        >
          Delete Announcement
        </button>
      )}
    </div>

    {message ? (
      <div className="announcement-display">
        <p>{message}</p>
      </div>
    ) : (
      <p className="no-announcement">No announcement available</p>
    )}
  </div>
  );
};

export default AnnouncementManager;
