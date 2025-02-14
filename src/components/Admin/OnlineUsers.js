import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const onlineQuery = query(collection(db, 'online_users'), where('online', '==', true));

    const unsubscribe = onSnapshot(onlineQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ height: 'auto',overflow:'scroll',marginBottom:'200px'}}>
      <h2>🟢 Online Users ({onlineUsers.length})</h2>
      <ul>
        {onlineUsers.map(user => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
