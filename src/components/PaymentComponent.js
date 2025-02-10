import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import '../../src/AddMoney.css';

const PaymentComponent = () => {
  const [urn, setUrn] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [moneyRequests, setMoneyRequests] = useState([]);

  const upiId = "example@upi";  // Replace with your UPI ID
  const qrCodeUrl = "https://i.ibb.co/5h6hpXtQ/patbet.png";  // Replace with your QR code image URL

  const user = auth.currentUser;

  // Fetch Add Money Requests when component mounts
  useEffect(() => {
    if (user) {
      const requestRef = collection(db, "addMoneyRequests");
      const q = query(requestRef, where("userId", "==", user.uid));
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMoneyRequests(requests);
      });
  
      return () => unsubscribe();
    }
  }, [user]);
  

  const handleAddMoney = async () => {
    if (!urn || !amount || parseFloat(amount) < 50) {
      alert("Minimum amount to add is ₹50.");
      return;
    }

    setLoading(true);

    if (!user) {
      alert("User not logged in!");
      setLoading(false);
      return;
    }

    try {
      const requestRef = collection(db, "addMoneyRequests");

      await addDoc(requestRef, {
        userId: user.uid,
        urn,
        amount: parseFloat(amount),
        status: "pending",  // Admin will change this to "approved"
        createdAt: new Date(),
      });

      alert("धन्यवाद,वेरीफाय करने के बाद पेमेंट आपके वालेट मे जमा किया जायेगा");
      setUrn("");
      setAmount("");
    } catch (error) {
      console.error("Error adding money request:", error);
      alert("Error adding money request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <><div className="add-money-container">
      <h2>Add Money</h2>

      <div className="qr-section">
        <img src={qrCodeUrl} alt="UPI QR Code" className="qr-code" />
        <p>QR कोड स्कॅन करके पेमेंट का भुगतान करे.और Transaction Id या फिर RRN नंबर कॉपी करे.
        </p>
      </div>

      <input
        type="number"
        placeholder="Enter Amount (Min ₹50)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-field" />
      <input
        type="text"
        placeholder="Enter Transaction Id Or RRN Number"
        value={urn}
        onChange={(e) => setUrn(e.target.value)}
        className="input-field" />
      <button
        onClick={handleAddMoney}
        disabled={!urn || !amount || loading}
        className={`add-money-button ${(!urn || !amount || parseFloat(amount) < 50) ? "disabled" : ""}`}
      >
        {loading ? "Processing..." : "Add Money"}
      </button>
    </div><div className="requests-section">
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
      </div></>
  );
};

export default PaymentComponent;
