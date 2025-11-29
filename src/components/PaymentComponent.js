import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "../../src/AddMoney.css";
import GoogleAd from "./GoogleAd";
import { useNavigate } from "react-router-dom";
import AdBanner from "./AdBanner";

const PaymentComponent = () => {
  const [urn, setUrn] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(false); // ⭐ ZOOM STATE

  const navigate = useNavigate();

  const upiId = "example@upi";
  const qrCodeUrl = "https://i.ibb.co/5h6hpXtQ/patbet.png";

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
      await addDoc(collection(db, "addMoneyRequests"), {
        userId: user.uid,
        urn,
        amount: parseFloat(amount),
        status: "pending",
        createdAt: new Date(),
      });

      alert("धन्यवाद, वेरीफाय करने के बाद पेमेंट आपके वालेट मे जमा किया जायेगा");
      setUrn("");
      setAmount("");
      navigate("/mydeposits");
    } catch (error) {
      console.error("Error adding money request:", error);
      alert("Error adding money request.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Download Image
  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "PatBet_QR.png";
    link.click();
  };

  return (
    <>
      {/* ⭐ ZOOM OVERLAY */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <img
            src={qrCodeUrl}
            alt="Zoomed QR"
            style={{
              width: "90%",
              maxWidth: "400px",
              borderRadius: "12px",
            }}
          />
        </div>
      )}

      <div className="add-money-container" style={{ marginBottom: "80px" }}>
        <h2>Add Money</h2>

        {/* ⭐ QR Section with Zoom + Download */}
        <div className="qr-section">
          <img
            src={qrCodeUrl}
            alt="UPI QR Code"
            className="qr-code"
            onClick={() => setZoom(true)} // ⭐ Zoom On Click
            style={{
              transition: "0.3s",
              cursor: "pointer",
            }}
          />

          <button
            onClick={downloadImage}
            style={{
              marginTop: "10px",
              background: "#FF9800",
              color: "white",
              padding: "8px 15px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            डाउनलोड QR
          </button>

          <p style={{ marginTop: "10px", fontSize: "14px" }}>
            QR कोड स्कॅन या फिर स्क्रीनशॉट ले करके पेमेंट का भुगतान करे और Transaction Id या UTR नंबर कॉपी करे।
          </p>
        </div>

        {/* ⭐ AMOUNT INPUT */}
        <input
          type="number"
          placeholder="Enter Amount (Min ₹50)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
        />

        {/* ⭐ UTR INPUT */}
        <input
          type="text"
          placeholder="Enter Transaction Id Or UTR Number"
          value={urn}
          onChange={(e) => setUrn(e.target.value)}
          className="input-field"
        />

        {/* ⭐ Submit Button */}
        <button
          onClick={handleAddMoney}
          disabled={!urn || !amount || loading}
          className={`add-money-button ${
            !urn || !amount || parseFloat(amount) < 50 ? "disabled" : ""
          }`}
        >
          {loading ? "Processing..." : "Add Money"}
        </button>
      </div>

      <AdBanner />
    </>
  );
};

export default PaymentComponent;
