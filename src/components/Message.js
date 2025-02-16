import React from 'react';
import './Message.css';

const Message = ({ message, isUser }) => {
    return (
      <div className={`message ${isUser ? 'user-message' : 'other-message'}`}>  
        <div className='message-content'>
          <span className={`message-username ${isUser ? 'user-name' : 'other-name'}`}>{message.username}</span>
          <p className='message-text'>{message.text}</p>
          {message.fileUrl && <img src={message.fileUrl} alt='Uploaded file' className='chat-image' />}
        </div>
        <span className='message-time'>{new Date(message.timestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    );
  };
  
  export default Message;