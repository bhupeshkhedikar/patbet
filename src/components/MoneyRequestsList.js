import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./MoneyRequestsList.css";

const MoneyRequestsList = () => {
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const requestRef = collection(db, "addMoneyRequests");
      const q = query(requestRef, where("userId", "==", user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // newest first
        requests.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setMoneyRequests(requests);
      });

      return () => unsubscribe();
    }
  }, []);

  const filteredRequests = moneyRequests.filter(
    (item) => item.status === activeTab
  );

  return (
    <div className="money-section">
      <h2 className="title">💰 Top-up History</h2>

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
      {filteredRequests.length === 0 ? (
        <p className="empty-text">No {activeTab} top-up found.</p>
      ) : (
        filteredRequests.map((request) => (
          <div key={request.id} className={`money-card ${request.status}`}>
            <div className="card-top">
              <span className="amount">💵 {request.amount}</span>
              <span className={`badge ${request.status}`}>
                {request.status.toUpperCase()}
              </span>
            </div>

            <div className="card-body">
              <p>
                Date:{" "}
                {request.createdAt
                  ? new Date(request.createdAt.seconds * 1000).toLocaleString()
                  : "N/A"}
              </p>

              {request.status === "rejected" && (
                <p className="reason">
                  Reason: {request.reason || "No reason provided"}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MoneyRequestsList;
