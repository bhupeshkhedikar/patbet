import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const ReferralAdmin = () => {
  const [users, setUsers] = useState([]);
  const [referralData, setReferralData] = useState([]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const allUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(allUsers);

      // Prepare referral reporting
      let adminList = [];

      for (let user of allUsers) {
        if (!user.referralCode) continue;

        // Find which users used this user's referral code
        const q = query(
          collection(db, "users"),
          where("referredBy", "==", user.referralCode)
        );

        const referredSnapshot = await getDocs(q);
        const referredUsers = referredSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        adminList.push({
          userId: user.id,
          name: user.name,
          email: user.email,
          walletBalance: user.walletBalance || 0,
          referralCode: user.referralCode,
          referredCount: referredUsers.length,
          earningFromReferrals: referredUsers.length * 100,
          referredUsersList: referredUsers,
        });
      }

      setReferralData(adminList);
    } catch (error) {
      console.error("Error loading referral data:", error);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        ⭐ Referral Admin Panel
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#120e0eff",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
        }}
      >
        <thead style={{ background: "#6a11cb", color: "white" }}>
          <tr>
            <th style={thStyle}>User Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Wallet</th>
            <th style={thStyle}>Referral Code</th>
            <th style={thStyle}>Total Referred</th>
            <th style={thStyle}>Referral Earnings</th>
            <th style={thStyle}>Referred Users</th>
          </tr>
        </thead>

        <tbody>
          {referralData.map((u, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}>{u.name}</td>
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>₹{u.walletBalance}</td>
              <td style={tdStyle}>{u.referralCode}</td>
              <td style={tdStyle}>{u.referredCount}</td>
              <td style={tdStyle}>₹{u.earningFromReferrals}</td>
              <td style={tdStyle}>
                {u.referredUsersList.length === 0 ? (
                  <span style={{ color: "gray" }}>No Users</span>
                ) : (
                  <details>
                    <summary style={{ cursor: "pointer", color: "#2575fc" }}>
                      View ({u.referredUsersList.length})
                    </summary>
                    <ul style={{ paddingLeft: 0, marginTop: 5 }}>
                      {u.referredUsersList.map((rUser) => (
                        <li
                          key={rUser.id}
                          style={{
                            listStyle: "none",
                            background: "#050404ff",
                            padding: "6px 10px",
                            marginBottom: 5,
                            borderRadius: 6,
                          }}
                        >
                          <b>{rUser.name}</b> – {rUser.email}
                          <br />
                          <small>
                            Joined:{" "}
                            {rUser.createdAt?.toDate
                              ? rUser.createdAt.toDate().toLocaleString()
                              : "N/A"}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Table cell styling
const thStyle = {
  padding: "10px",
  fontWeight: "bold",
  fontSize: 14,
  borderBottom: "2px solid #4b0ea3",
};

const tdStyle = {
  padding: "10px",
  fontSize: 13,
  textAlign: "center",
};

export default ReferralAdmin;
