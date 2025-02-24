import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db,auth } from "../firebase";
import Message from './Message';
import MessageInput from './MessageInput';
import './ChatRoom.css';
import AdBanner from './AdBanner';

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
  
    useEffect(() => {
      const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }, []);
  
  return (
    <><AdBanner /><div className='chat-container' style={{ marginBottom: '70px' }}>
      <div className='chat-header'>
        <img src='https://i.ibb.co/s9czLCDf/patbet.png' alt='PatBet Logo' className='chat-logo' />
        <h2>PatBet</h2>
      </div>
      <div className='chat-messages'>
        {messages.map(msg => <Message key={msg.id} message={msg} isUser={msg.userId === auth.currentUser?.uid} />)}
      </div>
      <img src='https://i.ibb.co/JwdccMm5/Screenshot-2025-02-24-192514.png' alt='one sided game'/>
      <MessageInput />
    </div></>
    );
  };
  
  export default ChatRoom;
  