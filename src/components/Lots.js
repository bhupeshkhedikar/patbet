import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"; // Import Like & Dislike Icons

const Lots = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});

  useEffect(() => {
    const fetchFeed = async () => {
      const feedCollection = collection(db, "lots");
      const feedSnapshot = await getDocs(feedCollection);
      const feedData = feedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeed(feedData);
      setLoading(false);
    };

    fetchFeed();
  }, []);

  const handleLikeDislike = async (id, type) => {
    const docRef = doc(db, "lots", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist!");
      return;
    }

    const data = docSnap.data();
    const isLiked = userLikes[id] === "like";
    const isDisliked = userLikes[id] === "dislike";

    let updatedLikes = data.likes || 0;
    let updatedDislikes = data.dislikes || 0;

    if (type === "like") {
      updatedLikes = isLiked ? updatedLikes - 1 : updatedLikes + 1;
      updatedDislikes = isDisliked ? updatedDislikes - 1 : updatedDislikes;
      setUserLikes((prev) => ({ ...prev, [id]: isLiked ? null : "like" }));
    } else {
      updatedDislikes = isDisliked ? updatedDislikes - 1 : updatedDislikes + 1;
      updatedLikes = isLiked ? updatedLikes - 1 : updatedLikes;
      setUserLikes((prev) => ({ ...prev, [id]: isDisliked ? null : "dislike" }));
    }

    await updateDoc(docRef, {
      likes: updatedLikes,
      dislikes: updatedDislikes,
    });

    setFeed((prevFeed) =>
      prevFeed.map((item) =>
        item.id === id
          ? { ...item, likes: updatedLikes, dislikes: updatedDislikes }
          : item
      )
    );
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Feed...</p>
      </div>
    );

  return (
    <div className="lots-container" style={{ padding: "20px",marginBottom:'100px' }}>
      <h2 className="section-title">Lots Feed</h2>

      <div className="feed" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {feed.length > 0 ? (
          feed.map((item) => (
            <div key={item.id} className="feed-item" style={{ maxWidth: "auto", textAlign: "center" }}>
              <img src={item.imageUrl} alt="Feed Item" style={{ width: "340px", borderRadius: "8px" }} />
              <h3>{item.title}</h3>
              <div className="like-dislike-container">
                {/* Like Button */}
                <button
                  onClick={() => handleLikeDislike(item.id, "like")}
                  className={`like-btn ${userLikes[item.id] === "like" ? "active" : ""}`}
                >
                  <FaThumbsUp size={20} /> {item.likes}
                </button>

                {/* Dislike Button */}
                <button
                  onClick={() => handleLikeDislike(item.id, "dislike")}
                  className={`dislike-btn ${userLikes[item.id] === "dislike" ? "active" : ""}`}
                >
                  <FaThumbsDown size={20} /> {item.dislikes}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>
    </div>
  );
};

export default Lots;
