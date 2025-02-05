import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
// /import "../../src/RegisteredUsers.css";
import { db } from "../../firebase";
const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersWithBetDetails = async () => {
      setLoading(true);
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const fetchedUsers = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Fetch the bets for this user
        const betsRef = collection(db, "users", userId, "bets");
        const betsSnapshot = await getDocs(betsRef);

        let totalBets = 0;
        let totalWinnings = 0;

        betsSnapshot.forEach((betDoc) => {
          const betData = betDoc.data();
          totalBets += 1;
          totalWinnings += Number(betData.winnings) || 0;
        });

        fetchedUsers.push({
          id: userId,
          name: userData.name || "N/A",
          email: userData.email || "N/A",
          walletBalance: userData.walletBalance || 0,
          totalBets,
          totalWinnings,
        });
      }

      setUsers(fetchedUsers);
      setLoading(false);
    };

    fetchUsersWithBetDetails().catch((error) => {
      console.error("Error fetching users and bets:", error);
      setLoading(false);
    });
  }, []);

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
                <th>Name</th>
                <th>User ID</th>
                <th>Email</th>
                <th>Wallet Balance</th>
                <th>Total Winnings</th>
                <th>Total Bets</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>₹{user.walletBalance}</td>
                  <td>₹{user.totalWinnings}</td>
                  <td>{user.totalBets}</td>
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
