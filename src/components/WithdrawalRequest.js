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
import GoogleAd from "./GoogleAd";
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

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      const userRef = doc(db, "users", user.uid);

      const unsubscribe = onSnapshot(userRef, docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setWalletBalance(data.walletBalance || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleRequestWithdrawal = async () => {
    try {
      // Clear previous messages
      setErrorMessage("");
      setSuccessMessage("");

      if (!amount || amount <= 600) {
        alert("सिक्के 600 रुपये से अधिक होनी चाहिए।");
        setErrorMessage("सिक्के600 रुपये से अधिक होनी चाहिए।");
        return;
      }

      if (!paymentMethod) {
        alert("कृपया भुगतान विधि चुनें।");
        setErrorMessage("कृपया भुगतान विधि चुनें।");
        return;
      }

      if (!name) {
        alert("कृपया अपना नाम दर्ज करें।");
        setErrorMessage("कृपया अपना नाम दर्ज करें।");
        return;
      }

      if (paymentMethod === "UPI" && !upiId) {
        alert("कृपया अपना UPI ID दर्ज करें।");
        setErrorMessage("कृपया अपना UPI ID दर्ज करें।");
        return;
      }

      if (paymentMethod === "Bank") {
        if (!bankAccount) {
          alert("कृपया अपना बैंक खाता नंबर दर्ज करें।");
          setErrorMessage("कृपया अपना बैंक खाता नंबर दर्ज करें।");
          return;
        }

        if (!confirmBankAccount) {
          alert("कृपया खाता नंबर की पुष्टि करें।");
          setErrorMessage("कृपया खाता नंबर की पुष्टि करें।");
          return;
        }

        if (bankAccount !== confirmBankAccount) {
          alert("दोनों खाता नंबर मैच नहीं हो रहे हैं।");
          setErrorMessage("दोनों खाता नंबर मैच नहीं हो रहे हैं।");
          return;
        }

        if (!ifscCode) {
          alert("कृपया IFSC कोड दर्ज करें।");
          setErrorMessage("कृपया IFSC कोड दर्ज करें।");
          return;
        }

        if (ifscCode.length !== 11) {
          alert("कृपया वैध 11 अंकों का IFSC कोड दर्ज करें।");
          setErrorMessage("कृपया वैध 11 अंकों का IFSC कोड दर्ज करें।");
          return;
        }
      }

      const deduction = amount * 0.05;
      const finalAmount = amount - deduction;

      const walletBalanceFloat = parseFloat(walletBalance);
      if (walletBalanceFloat < finalAmount) {
        alert("आपके वॉलेट में पर्याप्त बैलेंस नहीं है।");
        setErrorMessage("आपके वॉलेट में पर्याप्त बैलेंस नहीं है।");
        return;
      }

      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        walletBalance: walletBalanceFloat - finalAmount,
      });

      await addDoc(collection(db, "withdrawalRequests"), {
        userId,
        amount,
        finalAmount: finalAmount.toFixed(2),
        deduction: deduction.toFixed(2),
        name,
        paymentMethod,
        upiId: paymentMethod === "UPI" ? upiId : null,
        bankAccount: paymentMethod === "Bank" ? bankAccount : null,
        ifscCode: paymentMethod === "Bank" ? ifscCode : null,
        status: "pending",
        requestDate: new Date(),
        reason: null,
      });

      alert("रिडीम अनुरोध सफलतापूर्वक सबमिट किया गया!");
      setSuccessMessage("रिडीम अनुरोध सफलतापूर्वक सबमिट किया गया!");

      navigate("/mywithdrawals");
    } catch (error) {
      alert("रिडीम अनुरोध बनाते समय त्रुटि हुई।");
      setErrorMessage("रिडीम अनुरोध बनाते समय त्रुटि हुई।");
      console.error("Error:", error);
    }
  };

  const finalAmount = amount ? amount - amount * 0.05 : 0;

  return (
    <>
      <div className="auth-container" style={{ marginBottom: "100px" }}>
        <div className="auth-box" tyle={{ marginBottom: "50px" }}>
          <h2>रिडीम अनुरोध</h2>
          <p style={{ fontSize: "13px", color: "yellow" }}>
            5 से 30 मिनट के अंदर इंस्टेंट रिडीम
          </p>
          <br />
          <p className="wallet-text">वॉलेट बैलेंस: 💵{walletBalance.toFixed(2)}</p>

          {errorMessage && <p className="error">{errorMessage}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <input
            type="number"
            min="1001"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="न्यूनतम कॉईन्स : 💵600 से अधिक"
          />

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="अपना नाम दर्ज करें"
          />

          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className="payment-method-select"
          >
            <option value="">भुगतान विधि चुनें</option>
            {/* <option value="UPI">UPI</option> */}
            <option value="Bank">बैंक ट्रांसफर</option>
          </select>

          {paymentMethod === "UPI" && (
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="UPI ID दर्ज करें"
            />
          )}

          {paymentMethod === "Bank" && (
            <>
              <input
                type="text"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="बैंक खाता संख्या दर्ज करें"
              />
              <input
                type="text"
                value={confirmBankAccount}
                onChange={e => setConfirmBankAccount(e.target.value)}
                placeholder="खाता संख्या की पुष्टि करें"
              />
              <input
                type="text"
                value={ifscCode}
                onChange={e => setIfscCode(e.target.value)}
                placeholder="IFSC कोड दर्ज करें"
              />
            </>
          )}

          {amount > 0 && (
            <p style={{ color: "lightgreen", marginTop: "10px" }}>
              अंतिम रिडीम सिक्के(5% शुल्क के बाद):{" "}
              <b>💵{finalAmount.toFixed(2)}</b>
            </p>
          )}

          <button
            onClick={handleRequestWithdrawal}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#08e676",
              color: "black",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "700",
              boxShadow: "0 0 12px #08e676",
              marginTop: "20px",
              cursor: "pointer",
            }}
          >
            निकालें 💵{finalAmount.toFixed(2)}
          </button>

<p style={{ fontSize: "10px", color: "grey", marginTop: "20px" }}>
  रिडीम सिक्कों पर 5% शुल्क लागू होगा। <br />
  न्यूनतम रिडीम कॉइन्स : 600 <br />
  बोनस राशि निकाली नहीं जा सकती। <br />
</p>

        </div>
      </div>

      <AdBanner />
    </>
  );
};

export default WithdrawalRequest;
