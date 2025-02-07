import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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
          createdAt: userData.createdAt || null, // Add createdAt field (null if not present)
        });
      }

      // Separate users with and without createdAt
      const usersWithCreatedAt = fetchedUsers
        .filter((user) => user.createdAt)
        .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()); // Sort descending

      const usersWithoutCreatedAt = fetchedUsers.filter((user) => !user.createdAt);

      // Combine both lists
      const sortedUsers = [...usersWithCreatedAt, ...usersWithoutCreatedAt];

      setUsers(sortedUsers);
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
                <th>#</th> {/* Numbering column */}
                <th>Name</th>
                <th>User ID</th>
                <th>Email</th>
                <th>Wallet Balance</th>
                <th>Total Winnings</th>
                <th>Total Bets</th>
                <th>Registered On</th> {/* Display registration date */}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td> {/* Numbering starts from 1 */}
                  <td>{user.name}</td>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>₹{user.walletBalance}</td>
                  <td>₹{user.totalWinnings}</td>
                  <td>{user.totalBets}</td>
                  <td>
                    {user.createdAt
                      ? user.createdAt.toDate().toLocaleDateString()
                      : "N/A"} {/* Show registration date or N/A */}
                  </td>
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
