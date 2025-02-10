import React, { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const OnlineUsers = () => {
  const db = getFirestore();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const onlineUsersRef = collection(db, 'online_users');

    // Listen to changes in the online_users collection
    const unsubscribe = onSnapshot(onlineUsersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
        setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, []);

  return (
      <div style={{ height: '150px',overflow:'scroll'}}>
      <h5 className="">🟢 Online Users ({onlineUsers.length})</h5>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.id} className="text-lg">
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
