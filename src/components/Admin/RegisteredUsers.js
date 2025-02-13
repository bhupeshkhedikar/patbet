import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newWalletBalance, setNewWalletBalance] = useState("");

  useEffect(() => {
    setLoading(true);
    const usersRef = collection(db, "users");

    // Listen to Firestore for real-time updates
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        fetchedUsers.push({
          id: doc.id,
          name: userData.name || "N/A",
          email: userData.email || "N/A",
          walletBalance: userData.walletBalance || 0,
          createdAt: userData.createdAt || null,
          bets: [],
        });
      });

      // Fetch bets for each user
      fetchedUsers.forEach((user) => {
        const betsRef = collection(db, "users", user.id, "bets");
        onSnapshot(betsRef, (betsSnapshot) => {
          const userBets = [];
          betsSnapshot.forEach((betDoc) => {
            userBets.push(betDoc.data());
          });
          setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === user.id ? { ...u, bets: userBets } : u))
          );
        });
      });

      // Sorting Users with createdAt (newest first)
      const usersWithCreatedAt = fetchedUsers.filter((user) => user.createdAt);
      const usersWithoutCreatedAt = fetchedUsers.filter((user) => !user.createdAt);
      usersWithCreatedAt.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      const sortedUsers = [...usersWithCreatedAt, ...usersWithoutCreatedAt];

      setUsers(sortedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateWallet = async (userId) => {
    if (!newWalletBalance || isNaN(newWalletBalance)) return;

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { walletBalance: Number(newWalletBalance) });
      setEditingUserId(null);
      setNewWalletBalance("");
    } catch (error) {
      console.error("Error updating wallet balance:", error);
    }
  };

  return (
    <div className="registered-users">
      <h3 style={{ textAlign: "center", margin: "10px" }}>Registered Users</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p className="no-users" style={{ textAlign: "center" }}>
          No registered users yet.
        </p>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>User ID</th>
                <th>Email</th>
                <th>Wallet Balance</th>
                <th>Actions</th>
                <th>Bets</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>₹{user.walletBalance}</td>
                  <td>
                    {editingUserId === user.id ? (
                      <>
                        <input
                          type="number"
                          className="input-field"
                          value={newWalletBalance}
                          onChange={(e) => setNewWalletBalance(e.target.value)}
                        />
                        <button onClick={() => handleUpdateWallet(user.id)} className="approve-btn">Save</button>
                        <button onClick={() => setEditingUserId(null)} className="reject-btn">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditingUserId(user.id)} className="approve-btn">Edit Money</button>
                    )}
                  </td>
                  <td>
  <p className="total-bets">Total Bets: {user.bets.length}</p>
  <div className="bets-container">
    {user.bets.length > 0 ? (
      user.bets.map((bet, idx) => {
        let statusClass = "status-pending"; // Default class

        if (bet.status.toLowerCase() === "won") {
          statusClass = "status-won";
        } else if (bet.status.toLowerCase() === "lost") {
          statusClass = "status-lost";
        } else if (bet.status.toLowerCase() === "returned") {
          statusClass = "status-returned";
        }

        return (
          <p key={idx}>
            Bet {idx + 1}: ₹{bet.betAmount} | 
            <span className={`status ${statusClass}`}>{bet.status}</span>
          </p>
        );
      })
    ) : (
      <p>No Bets</p>
    )}
  </div>
</td>

                  <td>{user.createdAt ? user.createdAt.toDate().toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegisteredUsers;
