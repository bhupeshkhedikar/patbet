import React, { useState, useEffect } from "react";
import "../../src/WithdrawalRequest.css";
import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdBanner from "./AdBanner";

const WithdrawalRequest = () => {
  const [amount, setAmount] = useState();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [confirmBankAccount, setConfirmBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = auth.currentUser;
  const navigate = useNavigate();

  // 🔥 Live wallet update listener
  useEffect(() => {
    if (user) {
      setUserId(user.uid);

      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setWalletBalance(data.walletBalance || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  // ---------------------------------------------
  // 🔥 WITHDRAW REQUEST
  // ---------------------------------------------
  const handleRequestWithdrawal = async () => {
    if (isSubmitting) return; // prevent double click
    setIsSubmitting(true);

    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!amount || amount < 600) {
        setErrorMessage("सिक्के 600 रुपये से अधिक होनी चाहिए।");
        setIsSubmitting(false);
        return;
      }

      if (!paymentMethod) {
        setErrorMessage("कृपया भुगतान विधि चुनें।");
        setIsSubmitting(false);
        return;
      }

      if (!name) {
        setErrorMessage("कृपया अपना नाम दर्ज करें।");
        setIsSubmitting(false);
        return;
      }

      // ---------------------------------------------
      // 💰 DEDUCTION CALCULATION
      // ---------------------------------------------
      const deduction = amount * 0.05;
      const finalAmount = amount - deduction;

      // ---------------------------------------------
      // 💥 Correct validation: Wallet must ≥ entered amount
      // ---------------------------------------------
      if (walletBalance < amount) {
        setErrorMessage("आपके वॉलेट में पर्याप्त बैलेंस नहीं है।");
        setIsSubmitting(false);
        return;
      }

      const userRef = doc(db, "users", userId);

      // ------------------------------------------------
      // 🔥 Correct wallet update — subtract ENTERED amount
      // ------------------------------------------------
      await updateDoc(userRef, {
        walletBalance: walletBalance - Number(amount),
      });

      // ------------------------------------------------
      // 🔥 Store request for admin (finalAmount only info)
      // ------------------------------------------------
      await addDoc(collection(db, "withdrawalRequests"), {
        userId,
        amount, // user entered amount
        finalAmount: finalAmount.toFixed(2), // admin ko display ke liye
        deduction: deduction.toFixed(2),
        name,
        paymentMethod,
        upiId,
        bankAccount,
        ifscCode,
        status: "pending",
        requestDate: new Date(),
      });

      setSuccessMessage("रिडीम अनुरोध सफलतापूर्वक सबमिट किया गया!");
      navigate("/mywithdrawals");

    } catch (error) {
      console.error(error);
      setErrorMessage("रिडीम अनुरोध बनाते समय त्रुटि हुई।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalAmount = amount ? amount - amount * 0.05 : 0;

  return (
    <>
      <div className="auth-container" style={{ marginBottom: "100px" }}>
        <div className="auth-box">

          <h2>रिडीम अनुरोध</h2>
          <p style={{ fontSize: "13px", color: "yellow" }}>
            5 से 30 मिनट के अंदर इंस्टेंट रिडीम
          </p>

          <p className="wallet-text">
            वॉलेट बैलेंस: 💵{walletBalance.toFixed(2)}
          </p>

          {errorMessage && <p className="error">{errorMessage}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <input
            type="number"
            min="600"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="न्यूनतम कॉईन्स : 💵600 से अधिक"
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="अपना नाम दर्ज करें"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-method-select"
          >
            <option value="">भुगतान विधि चुनें</option>
            <option value="Bank">बैंक ट्रांसफर</option>
          </select>

          {paymentMethod === "Bank" && (
            <>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="बैंक खाता संख्या दर्ज करें"
              />

              <input
                type="text"
                value={confirmBankAccount}
                onChange={(e) => setConfirmBankAccount(e.target.value)}
                placeholder="खाता संख्या की पुष्टि करें"
              />

              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="IFSC कोड दर्ज करें"
              />
            </>
          )}

          {amount > 0 && (
            <p style={{ color: "lightgreen", marginTop: "10px" }}>
              अंतिम रिडीम सिक्के (5% शुल्क के बाद):{" "}
              <b>💵{finalAmount.toFixed(2)}</b>
            </p>
          )}

          <button
            onClick={handleRequestWithdrawal}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: isSubmitting ? "#999" : "#08e676",
              color: "black",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "700",
              boxShadow: isSubmitting ? "none" : "0 0 12px #08e676",
              marginTop: "20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting
              ? "प्रोसेस हो रहा है..."
              : `निकालें 💵${finalAmount.toFixed(2)}`}
          </button>

          <p style={{ fontSize: "10px", color: "grey", marginTop: "20px" }}>
            रिडीम पर 5% शुल्क लागू होगा। <br />
            न्यूनतम रिडीम कॉइन्स: 600 <br />
            बोनस राशि निकाली नहीं जा सकती। <br />
          </p>

        </div>
      </div>

      <AdBanner />
    </>
  );
};

export default WithdrawalRequest;
