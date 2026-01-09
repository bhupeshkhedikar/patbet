import React, { useEffect, useState } from "react";
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

const WithdrawalRequests = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [reasonMap, setReasonMap] = useState({});

  /* ---------------- FETCH WITHDRAWALS ---------------- */
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        const ref = collection(db, "withdrawalRequests");
        const q = query(ref, orderBy("requestDate", "desc"));
        const snap = await getDocs(q);

        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWithdrawalRequests(list);
      } catch (err) {
        console.error(err);
        setErrorMessage("Error fetching withdrawal requests");
      }
    };

    fetchWithdrawalRequests();
  }, []);

  /* ---------------- APPROVE ---------------- */
  const handleApprove = async id => {
    try {
      await updateDoc(doc(db, "withdrawalRequests", id), {
        status: "approved",
      });

      setWithdrawalRequests(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: "approved" } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- REJECT (SAFE) ---------------- */
  const handleReject = async (id, userId, amount) => {
    try {
      const requestRef = doc(db, "withdrawalRequests", id);
      const snap = await getDoc(requestRef);

      if (!snap.exists()) return;

      const data = snap.data();

      if (data.status === "approved" || data.status === "rejected") {
        return;
      }

      const reason = reasonMap[id] || "";

      await updateDoc(requestRef, {
        status: "rejected",
        reason,
      });

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const balance = userSnap.data().walletBalance || 0;

      await updateDoc(userRef, {
        walletBalance: balance + Number(amount),
      });

      setWithdrawalRequests(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: "rejected" } : r
        )
      );
    } catch (err) {
      console.error(err);
      setErrorMessage("Error rejecting withdrawal.");
    }
  };

  return (
    <div className="withdrawal-requests">
      <h3>Withdrawal Requests</h3>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <table className="requests-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Method</th>
            <th>UPI</th>
            <th>Bank</th>
            <th>IFSC</th>
            <th>Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {withdrawalRequests.map(req => (
            <tr key={req.id}>
              <td>{req.name || "N/A"}</td>
              <td>{req.userId}</td>
              <td>
                💵{req.finalAmount} / {req.amount}
              </td>
              <td>{req.paymentMethod}</td>
              <td>{req.upiId || "N/A"}</td>
              <td>{req.bankAccount || "N/A"}</td>
              <td>{req.ifscCode || "N/A"}</td>
              <td>
                {req.requestDate
                  ? new Date(req.requestDate.toDate()).toLocaleString()
                  : "N/A"}
              </td>

              <td>
                <input
                  type="text"
                  placeholder="Reason"
                  value={reasonMap[req.id] || req.reason || ""}
                  onChange={e =>
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
                  disabled={req.status === "approved"}
                  onClick={() => handleApprove(req.id)}
                >
                  Approve
                </button>

                <button
                  className="reject-btn"
                  disabled={req.status === "rejected"}
                  onClick={() =>
                    handleReject(req.id, req.userId, req.amount)
                  }
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalRequests;
