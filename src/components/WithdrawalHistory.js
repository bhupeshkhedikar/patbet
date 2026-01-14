import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./WithdrawalHistory.css";

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const user = auth.currentUser;
      const storedUID = localStorage.getItem("userUID");
      const userId = user?.uid || storedUID;

      if (!userId) return;

      try {
        const withdrawalsRef = collection(db, "withdrawalRequests");
        const q = query(withdrawalsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const withdrawalData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWithdrawals(withdrawalData);
      } catch (error) {
        console.error("Error fetching Redemption:", error);
      }
    };

    fetchWithdrawals();
  }, []);

  const filteredWithdrawals = withdrawals.filter(
    (item) => item.status === activeTab
  );

  return (
    <div className="withdrawals-section">
      <h2 className="title">💸 Redemption History</h2>

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending
        </button>
        <button
          className={activeTab === "approved" ? "active" : ""}
          onClick={() => setActiveTab("approved")}
        >
          ✅ Approved
        </button>
        <button
          className={activeTab === "rejected" ? "active" : ""}
          onClick={() => setActiveTab("rejected")}
        >
          ❌ Rejected
        </button>
      </div>

      {/* LIST */}
      {filteredWithdrawals.length === 0 ? (
        <p className="empty-text">No {activeTab} redemption found.</p>
      ) : (
        filteredWithdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className={`withdrawal-card ${withdrawal.status}`}>
            <div className="card-top">
              <span className="amount">💵 {withdrawal.requestedAmount}</span>
              <span className={`badge ${withdrawal.status}`}>
                {withdrawal.status.toUpperCase()}
              </span>
            </div>

            <div className="card-body">
              <p>
                Final Amount:{" "}
                <strong className="final">₹{withdrawal.finalAmount}</strong>
              </p>

              <p>
                Date:{" "}
                {withdrawal.requestDate
                  ? new Date(
                      withdrawal.requestDate.seconds * 1000
                    ).toLocaleDateString()
                  : "N/A"}
              </p>

              {withdrawal.status === "rejected" && (
                <p className="reason">
                  Reason: {withdrawal.reason || "No reason provided"}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WithdrawalHistory;
