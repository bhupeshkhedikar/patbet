import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import '../../src/AddMoney.css';
const MoneyRequestsList = () => {
  const [moneyRequests, setMoneyRequests] = useState([]);

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
        
        // 🔹 सबसे नया request ऊपर दिखाने के लिए sort करें
        requests.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setMoneyRequests(requests);
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <div className="requests-section">
      <h3>Your Add Money Requests</h3>
      {moneyRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {moneyRequests.map((request) => (
              <tr key={request.id}>
                <td>₹{request.amount}</td>
                <td className={request.status.toLowerCase()}>{request.status}</td>
                <td>{new Date(request.createdAt?.toDate()).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MoneyRequestsList;
