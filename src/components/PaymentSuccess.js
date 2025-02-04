import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <h2>Payment Successful! ✅</h2>
      <p>Your wallet has been updated.</p>
      <button onClick={() => navigate("/")}>Go Back to Home</button>
    </div>
  );
};

export default PaymentSuccess;
