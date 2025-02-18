import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const AdminImageUpload = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [feed, setFeed] = useState([]); // State to store the list of images
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch the list of images from Firestore
  useEffect(() => {
    const fetchFeed = async () => {
      const feedCollection = collection(db, "lots");
      const feedSnapshot = await getDocs(feedCollection);
      const feedData = feedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFeed(feedData);
      setLoading(false);
    };

    fetchFeed();
  }, []);

  // Handle form submission for uploading image URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageUrl && title) {
      try {
        // Save the image URL and title to Firestore
        await addDoc(collection(db, "lots"), {
          title: title,
          imageUrl: imageUrl,
          likes: 0,
          dislikes: 0,
        });
        alert("Image URL uploaded successfully!");
        setImageUrl(""); // Reset the input fields
        setTitle("");

        // Refresh the feed after uploading
        const feedCollection = collection(db, "lots");
        const feedSnapshot = await getDocs(feedCollection);
        const feedData = feedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFeed(feedData);
      } catch (error) {
        console.error("Error uploading image URL:", error);
        alert("Failed to upload image URL.");
      }
    } else {
      alert("Please provide both title and image URL.");
    }
  };

  // Handle deleting an image
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteDoc(doc(db, "lots", id)); // Delete the document from Firestore
        alert("Image deleted successfully!");

        // Refresh the feed after deletion
        const feedCollection = collection(db, "lots");
        const feedSnapshot = await getDocs(feedCollection);
        const feedData = feedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFeed(feedData);
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image.");
      }
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Feed...</p>
      </div>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Admin Image Upload</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="पटाचे नाव व ठिकाण"
            style={{
              padding: "10px",
              width: "100%",
              fontSize: "16px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL"
            style={{
              padding: "10px",
              width: "100%",
              fontSize: "16px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            backgroundColor: "#E91E63",
            color: "#fff",
          }}
        >
          Upload Image URL
        </button>
      </form>

      {/* Display the list of images with delete buttons */}
      <div style={{ marginTop: "40px" }}>
        <h3>Uploaded Images</h3>
        {feed.length > 0 ? (
          feed.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={item.imageUrl}
                  alt="Uploaded"
                  style={{ width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover" }}
                />
                <div>
                  <h4>{item.title}</h4>
                  <p style={{ margin: 0 }}>{item.imageUrl}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminImageUpload;