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

const REQUIRED_WINNING = 300;

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

  // 🔥 NEW
  const [actualWinning, setActualWinning] = useState(0);
  const [loadingWinning, setLoadingWinning] = useState(true);

  const user = auth.currentUser;
  const navigate = useNavigate();

  /* --------------------------------------------------
     🔥 LIVE WALLET LISTENER
  -------------------------------------------------- */
  useEffect(() => {
    if (!user) return;

    setUserId(user.uid);

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, snap => {
      if (snap.exists()) {
        setWalletBalance(snap.data().walletBalance || 0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  /* --------------------------------------------------
     🔥 ACTUAL WINNING CALCULATION
  -------------------------------------------------- */
  const getActualWinning = async uid => {
    const betsRef = collection(db, "users", uid, "bets");
    const snapshot = await getDocs(betsRef);

    let total = 0;

    snapshot.forEach(docSnap => {
      const bet = docSnap.data();
      if (bet.status === "won") {
        const betAmount = Number(bet.betAmount || 0);
        const winnings = Number(bet.winnings || 0);
        const profit = winnings - betAmount;
        if (profit > 0) total += profit;
      }
    });

    return total;
  };

  /* --------------------------------------------------
     🔥 LOAD WINNING FOR PROGRESS
  -------------------------------------------------- */
  useEffect(() => {
    if (!userId) return;

    const loadWinning = async () => {
      setLoadingWinning(true);
      const win = await getActualWinning(userId);
      setActualWinning(win);
      setLoadingWinning(false);
    };

    loadWinning();
  }, [userId]);

  /* --------------------------------------------------
     🔥 WITHDRAW REQUEST HANDLER
  -------------------------------------------------- */
  const handleRequestWithdrawal = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      setErrorMessage("");
      setSuccessMessage("");

      alert(
        "⚠️ Withdrawal नियम:\n\n" +
        "Live Games / My Predictions में\n" +
        "कम से कम ₹300 की ACTUAL जीत अनिवार्य है।"
      );

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

      if (actualWinning < REQUIRED_WINNING) {
        setErrorMessage(
          `Withdrawal संभव नहीं ❌\n` +
          `आपने ₹${actualWinning} जीते हैं\n` +
          `₹${REQUIRED_WINNING - actualWinning} और जीतना बाकी है`
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

      const deduction = amount * 0.05;
      const finalAmount = amount - deduction;

      await updateDoc(doc(db, "users", userId), {
        walletBalance: walletBalance - Number(amount),
      });

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
  const progressPercent = Math.min(
    (actualWinning / REQUIRED_WINNING) * 100,
    100
  );

  return (
    <>
      <div className="auth-container" style={{ marginBottom: "100px" }}>
        <div className="auth-box">
          <h2>रिडीम अनुरोध</h2>

          <p style={{ fontSize: "13px", color: "yellow" }}>
            24–48 घंटे में रिडीम प्रोसेस किया जाएगा
          </p>
          {/* 🔥 ELIGIBILITY PROGRESS */}
          {!loadingWinning && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 10, marginBottom: '5px' }}>
                ⏳ रिडीम अनुरोध के लिए अभी {Math.max(0, REQUIRED_WINNING - actualWinning)} और जीतना बाकी है
              </p>
              <div
                style={{
                  height: 8,
                  width: "100%",
                  background: "#333",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    background:
                      progressPercent >= 100
                        ? "#00e676"
                        : "#ff9800",
                    transition: "0.4s",
                  }}
                />
              </div>

              <p style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                💰 जीती हुई कोईन्स: ₹{actualWinning} / ₹{REQUIRED_WINNING}

                {actualWinning >= REQUIRED_WINNING && (
                  <span style={{ color: "#00e676", marginLeft: 6 }}>
                    ✅ Eligible
                  </span>

                )}

              </p>

            </div>
          )}
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
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="बैंक खाता संख्या"
              />
              <input
                value={confirmBankAccount}
                onChange={e =>
                  setConfirmBankAccount(e.target.value)
                }
                placeholder="खाता संख्या की पुष्टि करें"
              />
              <input
                value={ifscCode}
                onChange={e => setIfscCode(e.target.value)}
                placeholder="IFSC कोड"
              />
            </>
          )}

          {amount > 0 && (
            <p style={{ color: "lightgreen", marginTop: 10 }}>
              अंतिम रिडीम राशि:{" "}
              <b>💵{finalAmount.toFixed(2)}</b>
            </p>
          )}

          <button
            onClick={handleRequestWithdrawal}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: 14,
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
            • लाइव गेम्स में न्यूनतम जीत ₹300 अनिवार्य <br />
            • बोनस राशि निकाली नहीं जा सकती
          </p>
        </div>
      </div>

      <AdBanner />
    </>
  );
};

export default WithdrawalRequest;
