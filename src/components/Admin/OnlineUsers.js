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
        console.log(users,'users')
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="text-white p-4 bg-gray-800 rounded-lg shadow-md">
      <h5 className="text-xl font-bold mb-2">🟢 Online Users ({onlineUsers.length})</h5>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.id} className="text-lg">
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
