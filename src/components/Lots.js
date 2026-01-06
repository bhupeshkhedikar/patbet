import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { FaThumbsUp, FaThumbsDown, FaSearchPlus, FaSearchMinus, FaTimes } from "react-icons/fa";

const Lots = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});

  // 🔍 Zoom States
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  /* --------------------------------------------------
     FETCH LOTS (ORDERED)
  -------------------------------------------------- */
  useEffect(() => {
    const fetchFeed = async () => {
      const q = query(collection(db, "lots"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeed(data);
      setLoading(false);
    };

    fetchFeed();
  }, []);

  /* --------------------------------------------------
     LIKE / DISLIKE HANDLER
  -------------------------------------------------- */
  const handleLikeDislike = async (id, type) => {
    const docRef = doc(db, "lots", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    let likes = data.likes || 0;
    let dislikes = data.dislikes || 0;

    const current = userLikes[id];

    if (type === "like") {
      likes = current === "like" ? likes - 1 : likes + 1;
      if (current === "dislike") dislikes--;
      setUserLikes({ ...userLikes, [id]: current === "like" ? null : "like" });
    } else {
      dislikes = current === "dislike" ? dislikes - 1 : dislikes + 1;
      if (current === "like") likes--;
      setUserLikes({
        ...userLikes,
        [id]: current === "dislike" ? null : "dislike",
      });
    }

    await updateDoc(docRef, { likes, dislikes });

    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likes, dislikes } : item
      )
    );
  };

  /* --------------------------------------------------
     ZOOM CONTROLS
  -------------------------------------------------- */
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 1));
  const closeZoom = () => {
    setZoomImage(null);
    setZoomLevel(1);
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Feed...</p>
      </div>
    );

  return (
    <div style={{ padding: "20px", marginBottom: "100px" }}>
      <h2 className="section-title">Lots Feed</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {feed.length > 0 ? (
          feed.map((item, index) => (
            <div
              key={item.id}
              style={{ textAlign: "center", maxWidth: "360px" }}
            >
              <h4>#{index + 1}</h4>

              <img
                src={item.imageUrl}
                alt="Lot"
                onClick={() => setZoomImage(item.imageUrl)}
                style={{
                  width: "340px",
                  borderRadius: "8px",
                  cursor: "zoom-in",
                }}
              />

              <h3>{item.title}</h3>

              <div className="like-dislike-container">
                <button onClick={() => handleLikeDislike(item.id, "like")}>
                  <FaThumbsUp /> {item.likes || 0}
                </button>

                <button onClick={() => handleLikeDislike(item.id, "dislike")}>
                  <FaThumbsDown /> {item.dislikes || 0}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No lots available</p>
        )}
      </div>

      {/* --------------------------------------------------
          ZOOM MODAL
      -------------------------------------------------- */}
      {zoomImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={zoomImage}
              alt="Zoom"
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.2s ease",
              }}
            />

            {/* Controls */}
            <div
              style={{
                position: "absolute",
                bottom: "-50px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "15px",
              }}
            >
              <button onClick={zoomIn}><FaSearchPlus /></button>
              <button onClick={zoomOut}><FaSearchMinus /></button>
              <button onClick={closeZoom}><FaTimes /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lots;
