import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);

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
        console.error("Error fetching withdrawals:", error);
      }
    };

    fetchWithdrawals();
  }, []);

  return (
    <div className="withdrawals-section">
      <h3>Withdrawals History</h3>
      {withdrawals.length === 0 ? (
        <p>No withdrawals found.</p>
      ) : (
        withdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className="withdrawal-item">
            <p>
              Amount: <strong>💵{withdrawal.amount}</strong>
            </p>
            <p>
              Status:{" "}
              <span className={`status ${withdrawal.status.toLowerCase()}`}>
                {withdrawal.status}
              </span>
            </p>
            {withdrawal.status === "rejected" && (
              <p className="rejection-reason">
                Reason: {withdrawal.reason || "No reason provided"}
              </p>
            )}
            <p>
              Date:{" "}
              {withdrawal.requestDate
                ? new Date(withdrawal.requestDate.seconds * 1000).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default WithdrawalHistory;
