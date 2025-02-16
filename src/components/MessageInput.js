import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import './MessageInput.css';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [isChatEnabled, setIsChatEnabled] = useState(false); // Real-time chat control

  useEffect(() => {
    // Fetch real-time chat status
    const chatRef = doc(db, 'adminSettings', 'chatControl');
    const unsubscribeChat = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsChatEnabled(snapshot.data().isChatEnabled);
      }
    });

    // Fetch user data
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUsername(user.email);
      }
    };

    fetchUserData();

    return () => unsubscribeChat(); // Cleanup listener on unmount
  }, []);

  const sendMessage = async () => {
    if (!isChatEnabled) return; // Prevent sending messages if chat is disabled

    if (text.trim() || file) {
      let fileUrl = '';
      if (file) {
        const fileRef = ref(storage, `uploads/${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await addDoc(collection(db, 'messages'), {
        text,
        fileUrl,
        timestamp: new Date(),
        userId: currentUser.uid,
        username,
      });

      setText('');
      setFile(null);
    }
  };

  return (
    <div className='message-input'>
      <input
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isChatEnabled ? 'Type a message' : 'Chat is disabled by Admin'}
        disabled={!isChatEnabled} // Disable input when chat is off
      />
      <button onClick={sendMessage} disabled={!isChatEnabled}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
