import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const AdminImageUpload = () => {
  const [title, setTitle] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState({});
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  /* --------------------------------------------------
     FETCH LOTS (ORDERED)
  -------------------------------------------------- */
  const fetchFeed = async () => {
    const q = query(collection(db, "lots"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    setFeed(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  /* --------------------------------------------------
     FILE SELECT + PREVIEW
  -------------------------------------------------- */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
    setProgress({});
  };

  /* --------------------------------------------------
     MULTIPLE IMAGE UPLOAD WITH PROGRESS
  -------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || imageFiles.length === 0) {
      alert("Title आणि Images दोन्ही आवश्यक आहेत");
      return;
    }

    setUploading(true);

    try {
      for (const file of imageFiles) {
        const storageRef = ref(storage, `lots/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProgress(prev => ({
                ...prev,
                [file.name]: percent,
              }));
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              await addDoc(collection(db, "lots"), {
                title,
                imageUrl: downloadURL,
                storagePath: storageRef.fullPath,
                likes: 0,
                dislikes: 0,
                createdAt: serverTimestamp(),
              });

              resolve();
            }
          );
        });
      }

      alert("All images uploaded successfully");
      setTitle("");
      setImageFiles([]);
      setPreviews([]);
      setProgress({});
      fetchFeed();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* --------------------------------------------------
     DELETE IMAGE
  -------------------------------------------------- */
  const handleDelete = async (item) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath));
      }
      await deleteDoc(doc(db, "lots", item.id));
      fetchFeed();
    } catch (err) {
      alert("Delete failed");
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
    <div style={{ padding: "16px", maxWidth: "800px", margin: "auto" }}>
      <h2>Admin Image Upload (Lots)</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="पटाचे नाव व ठिकाण"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: "10px" }}
        />

        {/* IMAGE PREVIEWS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {previews.map((src, i) => (
            <div key={i} style={{ width: "110px" }}>
              <img
                src={src}
                alt="preview"
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              {progress[imageFiles[i]?.name] !== undefined && (
                <div style={{ marginTop: "4px" }}>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "#ddd",
                      borderRadius: "5px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress[imageFiles[i].name]}%`,
                        background: "#4caf50",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                  <small>{progress[imageFiles[i].name]}%</small>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={uploading}
          style={{
            marginTop: "12px",
            padding: "10px 20px",
            background: uploading ? "#999" : "#E91E63",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </form>

      {/* LIST */}
      <div style={{ marginTop: "40px" }}>
        <h3>Uploaded Lots</h3>

        {feed.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <img
                src={item.imageUrl}
                alt="lot"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <h4>#{index + 1} {item.title}</h4>
            </div>

            <button
              onClick={() => handleDelete(item)}
              style={{
                background: "#f44336",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminImageUpload;
