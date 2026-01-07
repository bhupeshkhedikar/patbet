import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import "../Admin/AdminPanel.css";

const Transactions = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [addMoneyRequests, setAddMoneyRequests] = useState([]);

  // 🔥 NEW — Store reason per request
  const [reasonMap, setReasonMap] = useState({});

  // ---------------- DEPOSITS (ADD MONEY) ----------------
  useEffect(() => {
    const fetchAddMoneyRequests = async () => {
      try {
        const depositsRef = collection(db, "addMoneyRequests");
        const depositsQuery = query(depositsRef, orderBy("createdAt", "desc"));
        const depositSnapshot = await getDocs(depositsQuery);

        const allDeposits = depositSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAddMoneyRequests(allDeposits);
      } catch (error) {
        console.error("Error fetching add money requests:", error);
      }
    };

    fetchAddMoneyRequests();
  }, []);

  // ---------------- WITHDRAWALS ----------------
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        const withdrawalsRef = collection(db, "withdrawalRequests");
        const withdrawalsQuery = query(
          withdrawalsRef,
          orderBy("requestDate", "desc")
        );

        const snapshot = await getDocs(withdrawalsQuery);

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWithdrawalRequests(list);
      } catch (error) {
        setErrorMessage("Error fetching withdrawal requests");
      }
    };

    fetchWithdrawalRequests();
  }, []);

  // ---------------- DEPOSIT HISTORY ----------------
  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const depositsRef = collection(db, "deposits");
        const depositsQuery = query(depositsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(depositsQuery);

        const depositList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toLocaleString(),
        }));

        setDeposits(depositList);
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };

    fetchDeposits();
  }, []);

  // ---------------- APPROVE DEPOSIT ----------------
  const handleApproveDeposit = async (depositId, userId, amount) => {
    try {
      const depositRef = doc(db, "addMoneyRequests", depositId);

      // Update request status
      await updateDoc(depositRef, { status: "approved" });

      // Fetch user balance
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User not found!");
        return;
      }

      const currentBalance = userSnap.data().walletBalance || 0;

      await updateDoc(userRef, {
        walletBalance: currentBalance + Number(amount),
      });

      // Update UI
      setAddMoneyRequests((prev) =>
        prev.map((req) =>
          req.id === depositId ? { ...req, status: "approved" } : req
        )
      );

      alert("Deposit approved & wallet updated!");
    } catch (error) {
      console.error("Error approving deposit:", error);
    }
  };

  // ---------------- REJECT DEPOSIT ----------------
  const handleRejectDeposit = async (depositId) => {
    try {
      const depositRef = doc(db, "addMoneyRequests", depositId);
      await updateDoc(depositRef, { status: "rejected" });

      setAddMoneyRequests((prev) =>
        prev.map((req) =>
          req.id === depositId ? { ...req, status: "rejected" } : req
        )
      );

      alert("Deposit request rejected.");
    } catch (error) {
      console.error("Error rejecting deposit:", error);
    }
  };

  // ---------------- APPROVE WITHDRAWAL ----------------
  const handleApprove = async (id) => {
    try {
      const requestRef = doc(db, "withdrawalRequests", id);

      await updateDoc(requestRef, {
        status: "approved",
      });

      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved" } : req
        )
      );
    } catch (error) {
      console.error("Error approving withdrawal:", error);
    }
  };

  // ---------------- REJECT WITHDRAWAL (FIXED) ----------------
  const handleReject = async (id, userId, amount) => {
    try {
      const requestRef = doc(db, "withdrawalRequests", id);
      const snap = await getDoc(requestRef);

      if (!snap.exists()) return;

      const data = snap.data();

      // 🔥 Prevent double reject / double balance add
      if (data.status === "approved" || data.status === "rejected") {
        console.log("Already processed. Skipping...");
        return;
      }

      const reason = reasonMap[id] || snap.data().reason || "";


      // Update status
      await updateDoc(requestRef, {
        status: "rejected",
        reason: reason,
      });

      // Refund amount
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const currentBalance = userSnap.data().walletBalance || 0;

      await updateDoc(userRef, {
        walletBalance: currentBalance + Number(amount),
      });

      // Update UI
      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "rejected" } : req
        )
      );
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      setErrorMessage("Error rejecting withdrawal.");
    }
  };

  // ==========================================================================================
  return (
    <>
      {/* ---------------- DEPOSIT REQUESTS ---------------- */}
      <div className="deposit-requests" style={{ marginBottom: "100px" }}>
        <h3>Deposit Requests</h3>

        <table className="requests-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>URN</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {addMoneyRequests.length > 0 ? (
              addMoneyRequests.map((deposit) => (
                <tr key={deposit.id}>
                  <td>{deposit.userId}</td>
                  <td>{deposit.urn}</td>
                  <td>💵{deposit.amount}</td>
                  <td>{deposit.status}</td>
                  <td>
                    {deposit.createdAt
                      ? new Date(deposit.createdAt.toDate()).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApproveDeposit(
                          deposit.id,
                          deposit.userId,
                          deposit.amount
                        )
                      }
                      disabled={deposit.status === "approved"}
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleRejectDeposit(deposit.id)}
                      disabled={deposit.status === "rejected"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No pending requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- WITHDRAWAL REQUESTS ---------------- */}
      <div className="withdrawal-requests">
        <h3>Withdrawal Requests</h3>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <table className="requests-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>UPI ID</th>
              <th>Bank Account</th>
              <th>IFSC</th>
              <th>Request Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {withdrawalRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.name || "N/A"}</td>
                <td>{req.userId}</td>
                <td>
                  {req.finalAmount} / 💵{req.amount}
                </td>
                <td>{req.paymentMethod || "N/A"}</td>
                <td>{req.upiId || "N/A"}</td>
                <td>{req.bankAccount || "N/A"}</td>
                <td>{req.ifscCode || "N/A"}</td>

                <td>
                  {req.requestDate
                    ? new Date(req.requestDate.toDate()).toLocaleString()
                    : "N/A"}
                </td>

                {/* 🔥 Individual reason input */}
                <td>
                  <input
                    type="text"
                    placeholder="Enter reason"
                    value={
                      reasonMap[req.id] !== undefined
                        ? reasonMap[req.id]
                        : req.reason || ""
                    }
                    onChange={(e) =>
                      setReasonMap({
                        ...reasonMap,
                        [req.id]: e.target.value,
                      })
                    }
                  />

                </td>

                <td>{req.status}</td>

                <td>
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(req.id)}
                    disabled={req.status === "approved"}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      handleReject(req.id, req.userId, req.amount)
                    }
                    disabled={req.status === "rejected"}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Transactions;
