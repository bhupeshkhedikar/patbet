import React, { useState, useEffect } from "react";
import "../../src/WithdrawalRequest.css";
import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  onSnapshot,
  getDocs,
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

  /* --------------------------------------------------
     🔥 LIVE WALLET LISTENER
  -------------------------------------------------- */
  useEffect(() => {
    if (user) {
      setUserId(user.uid);

      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, snap => {
        if (snap.exists()) {
          setWalletBalance(snap.data().walletBalance || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  /* --------------------------------------------------
     🔥 ACTUAL WINNING CALCULATION (IMPORTANT)
     Example:
     Bet = 300, Winnings = 600
     Actual Profit = 600 - 300 = 300
  -------------------------------------------------- */
  const getActualWinning = async uid => {
    const betsRef = collection(db, "users", uid, "bets");
    const snapshot = await getDocs(betsRef);

    let actualWinning = 0;

    snapshot.forEach(docSnap => {
      const bet = docSnap.data();

      if (bet.status === "won") {
        const betAmount = Number(bet.betAmount || 0);
        const winnings = Number(bet.winnings || 0);

        const profit = winnings - betAmount;

        if (profit > 0) {
          actualWinning += profit;
        }
      }
    });

    return actualWinning;
  };

  /* --------------------------------------------------
     🔥 WITHDRAW REQUEST HANDLER
  -------------------------------------------------- */
  const handleRequestWithdrawal = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      setErrorMessage("");
      setSuccessMessage("");

      /* ---------------- ALERT ---------------- */
      alert(
        "⚠️ Withdrawal नियम:\n\n" +
          "Withdrawal तभी संभव है जब आपने Live Games / My Predictions में\n" +
          "कम से कम ₹300 की जीत हासिल की हो।\n\n" 
      );
// "❌ 2x दिखाई गई जीत actual नहीं मानी जाती।\n" +
//           "उदाहरण:\n" +
//           "₹300 Bet → ₹600 दिखे\n" +
//           "Actual जीत = ₹300\n"
      /* ---------------- BASIC VALIDATION ---------------- */
      if (!amount || amount < 600) {
        setErrorMessage("न्यूनतम रिडीम राशि ₹600 है।");
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

      if (walletBalance < amount) {
        setErrorMessage("वॉलेट बैलेंस अपर्याप्त है।");
        setIsSubmitting(false);
        return;
      }

      /* ---------------- ACTUAL WINNING CHECK ---------------- */
      const actualWinning = await getActualWinning(userId);

      if (actualWinning < 300) {
        setErrorMessage(
          `Withdrawal अस्वीकृत ❌\n\n` +
            `आपकी ACTUAL जीत: ₹${actualWinning}\n` +
            `न्यूनतम आवश्यक जीत: ₹300`
        );
        setIsSubmitting(false);
        return;
      }

      if (amount > actualWinning) {
        setErrorMessage(
          "आप केवल अपनी ACTUAL जीती हुई राशि ही निकाल सकते हैं।"
        );
        setIsSubmitting(false);
        return;
      }

      /* ---------------- DEDUCTION ---------------- */
      const deduction = amount * 0.05;
      const finalAmount = amount - deduction;

      /* ---------------- WALLET UPDATE ---------------- */
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        walletBalance: walletBalance - Number(amount),
      });

      /* ---------------- WITHDRAW REQUEST STORE ---------------- */
      await addDoc(collection(db, "withdrawalRequests"), {
        userId,
        requestedAmount: amount,
        actualWinning,
        deduction: deduction.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
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
    } catch (err) {
      console.error(err);
      setErrorMessage("रिडीम अनुरोध करते समय त्रुटि हुई।");
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
            24–48 घंटे में रिडीम प्रोसेस किया जाएगा
          </p>

          <p className="wallet-text" style={{ marginTop: "10px" }}>
            वॉलेट बैलेंस: 💵{walletBalance.toFixed(2)}
          </p>

          {errorMessage && <p className="error">{errorMessage}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <input
            type="number"
            min="600"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="न्यूनतम रिडीम राशि ₹600"
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
          >
            <option value="">भुगतान विधि चुनें</option>
            <option value="Bank">बैंक ट्रांसफर</option>
          </select>

          {paymentMethod === "Bank" && (
            <>
              <input
                type="text"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="बैंक खाता संख्या"
              />

              <input
                type="text"
                value={confirmBankAccount}
                onChange={e =>
                  setConfirmBankAccount(e.target.value)
                }
                placeholder="खाता संख्या की पुष्टि करें"
              />

              <input
                type="text"
                value={ifscCode}
                onChange={e => setIfscCode(e.target.value)}
                placeholder="IFSC कोड"
              />
            </>
          )}

          {amount > 0 && (
            <p style={{ color: "lightgreen", marginTop: 10 }}>
              अंतिम रिडीम राशि (5% शुल्क के बाद):{" "}
              <b>💵{finalAmount.toFixed(2)}</b>
            </p>
          )}

          <button
            onClick={handleRequestWithdrawal}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "14px",
              background: isSubmitting ? "#999" : "#08e676",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              marginTop: 20,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting
              ? "प्रोसेस हो रहा है..."
              : `निकालें 💵${finalAmount.toFixed(2)}`}
          </button>

          <p style={{ fontSize: 10, color: "grey", marginTop: 20 }}>
            • 5% रिडीम शुल्क लागू होगा <br />
            • लाइव गेम्स मे न्यूनतम जीत ₹300 अनिवार्य <br />
            • बोनस राशि निकाली नहीं जा सकती
          </p>
        </div>
      </div>

      <AdBanner />
    </>
  );
};

export default WithdrawalRequest;
