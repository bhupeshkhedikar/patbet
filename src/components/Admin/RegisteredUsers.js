import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [editingBetId, setEditingBetId] = useState(null);
  const [newBetStatus, setNewBetStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      let fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "N/A",
        email: doc.data().email || "N/A",
        walletBalance: doc.data().walletBalance || 0,
        createdAt: doc.data().createdAt || null,
        bets: [],
        totalWinnings: 0,
      }));

      fetchedUsers.forEach((user) => {
        const betsRef = collection(db, "users", user.id, "bets");
        onSnapshot(betsRef, (betsSnapshot) => {
          const userBets = [];
          let totalWinnings = 0;
          betsSnapshot.forEach((betDoc) => {
            const betData = betDoc.data();
            userBets.push({ id: betDoc.id, ...betData });
            if (betData.status.toLowerCase() === "won") {
              totalWinnings += betData.betAmount;
            }
          });

          setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === user.id ? { ...u, bets: userBets, totalWinnings } : u))
          );
        });
      });

      // Sorting users with createdAt (newest first)
      const usersWithCreatedAt = fetchedUsers.filter((user) => user.createdAt);
      const usersWithoutCreatedAt = fetchedUsers.filter((user) => !user.createdAt);
      usersWithCreatedAt.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      fetchedUsers = [...usersWithCreatedAt, ...usersWithoutCreatedAt];

      setUsers(fetchedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateWallet = async (userId) => {
    if (!newWalletBalance || isNaN(newWalletBalance)) return;
    try {
      await updateDoc(doc(db, "users", userId), { walletBalance: Number(newWalletBalance) });
      setEditingUserId(null);
      setNewWalletBalance("");
    } catch (error) {
      console.error("Error updating wallet balance:", error);
    }
  };

  const handleUpdateBetStatus = async (userId, betId) => {
    if (!newBetStatus) return;
    try {
      await updateDoc(doc(db, "users", userId, "bets", betId), { status: newBetStatus });
      setEditingBetId(null);
      setNewBetStatus("");
    } catch (error) {
      console.error("Error updating bet status:", error);
    }
  };

  return (
    <div className="registered-users" style={{ marginBottom: "100px" }}>
      <h3 style={{ textAlign: "center", margin: "10px" }}>Registered Users ({users.length})</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: "center" }}>No registered users yet.</p>
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
                        <button onClick={() => handleUpdateWallet(user.id)} className="approve-btn">
                          Save
                        </button>
                        <button onClick={() => setEditingUserId(null)} className="reject-btn">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditingUserId(user.id)} className="approve-btn">
                        Edit Money
                      </button>
                    )}
                  </td>
                  <td>
                    <p className="total-bets">Total Bets: {user.bets.length}</p>
                    <p className="total-winnings">Winnings: ₹{user.totalWinnings}</p>
                    <div className="bets-container">
                      {user.bets.length > 0 ? (
                        user.bets.map((bet, idx) => (
                          <div key={idx}>
                            Bet {idx + 1}: ₹{bet.betAmount} | {bet.selectedTeam} |{" "}
                            {editingBetId === bet.id ? (
                              <>
                                <select
                                  value={newBetStatus}
                                  className="input-field"
                                  onChange={(e) => setNewBetStatus(e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="won">Won</option>
                                  <option value="lost">Lost</option>
                                  <option value="returned">Returned</option>
                                </select>
                                <button
                                  onClick={() => handleUpdateBetStatus(user.id, bet.id)}
                                  className="approve-btn"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingBetId(null)}
                                  className="reject-btn"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <span className={`status status-${bet.status.toLowerCase()}`}>
                                  {bet.status}
                                </span>
                                <button
                                  onClick={() => setEditingBetId(bet.id)}
                                  className="approve-btn"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        ))
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
