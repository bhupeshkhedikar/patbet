import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const AdminChatControl = () => {
  const [isChatEnabled, setIsChatEnabled] = useState(false);

  useEffect(() => {
    const fetchChatStatus = async () => {
      try {
        const chatRef = doc(db, "adminSettings", "chatControl");
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          setIsChatEnabled(chatSnap.data().isChatEnabled);
        } else {
          // If document doesn't exist, create it with default value
          await setDoc(chatRef, { isChatEnabled: false });
          setIsChatEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching chat status:", error);
      }
    };

    fetchChatStatus();
  }, []);

  const toggleChat = async () => {
    try {
      const chatRef = doc(db, "adminSettings", "chatControl");

      await updateDoc(chatRef, { isChatEnabled: !isChatEnabled });
      setIsChatEnabled((prev) => !prev);
    } catch (error) {
      console.error("Error updating chat status:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Chat Control</h2>
      <p>Chat is currently: <strong>{isChatEnabled ? "Enabled ✅" : "Disabled ❌"}</strong></p>
      <button onClick={toggleChat} style={styles.button}>
        {isChatEnabled ? "Disable Chat" : "Enable Chat"}
      </button>
    </div>
  );
};

// Basic Styles
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#1c1c1e",
    color: "#fff",
    borderRadius: "10px",
    width: "300px",
    margin: "20px auto",
    boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.2)",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#E91E63",
    color: "#fff",
  },
};

export default AdminChatControl;
