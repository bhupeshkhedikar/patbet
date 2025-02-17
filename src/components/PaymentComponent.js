import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import '../../src/AddMoney.css';
import GoogleAd from "./GoogleAd";
import { useNavigate } from "react-router-dom";

const PaymentComponent = () => {
  const [urn, setUrn] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()
  const upiId = "example@upi";  // Replace with your UPI ID
  const qrCodeUrl = "https://i.ibb.co/5h6hpXtQ/patbet.png";  // Replace with your QR code image URL

  const user = auth.currentUser;

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
        status: "pending",
        createdAt: new Date(),
      });

      alert("धन्यवाद, वेरीफाय करने के बाद पेमेंट आपके वालेट मे जमा किया जायेगा");
      setUrn("");
      setAmount("");
      navigate('/mydeposits')
    } catch (error) {
      console.error("Error adding money request:", error);
      alert("Error adding money request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="add-money-container">
        <h2>Add Money</h2>
        <iframe
          width="315"
          height="200"
          src="https://www.youtube.com/embed/X5qD0MRwjT4"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        <div className="qr-section">
          <img src={qrCodeUrl} alt="UPI QR Code" className="qr-code" />
          <p>QR कोड स्कॅन या फिर स्क्रीनशॉट ले करके पेमेंट का भुगतान करे और Transaction Id या UTR नंबर कॉपी करे।</p>
        </div>

        <input
          type="number"
          placeholder="Enter Amount (Min ₹50)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Enter Transaction Id Or UTR Number"
          value={urn}
          onChange={(e) => setUrn(e.target.value)}
          className="input-field"
        />
        <button
          onClick={handleAddMoney}
          disabled={!urn || !amount || loading}
          className={`add-money-button ${(!urn || !amount || parseFloat(amount) < 50) ? "disabled" : ""}`}
        >
          {loading ? "Processing..." : "Add Money"}
        </button>
      </div>
      {/* <GoogleAd client="ca-pub-9925801540177456" slot="4077906455" /> */}
    </>
  );
};

export default PaymentComponent;
