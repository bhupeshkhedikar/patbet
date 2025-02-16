import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import './MessageInput.css';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [isChatEnabled, setIsChatEnabled] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    // Fetch User Data
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUsername(userSnap.data().name || user.email);
          } else {
            console.error('User document not found');
            setUsername(user.email);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUsername(user.email);
        }
      }
    };

    fetchUserData();

    // Fetch Real-time Chat Status
    const chatRef = doc(db, 'adminSettings', 'chatControl');
    const unsubscribeChat = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsChatEnabled(snapshot.data().isChatEnabled);
      }
    });

    return () => unsubscribeChat(); // Cleanup listener on unmount
  }, []);

  const sendMessage = async () => {
    if (!isChatEnabled) return;

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
        disabled={!isChatEnabled}
      />
      <button onClick={sendMessage} disabled={!isChatEnabled}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
