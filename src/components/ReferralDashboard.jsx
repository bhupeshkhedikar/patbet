import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ Reward Coin Animation CSS
const coinStyle = {
  animation: "spin 1.5s infinite linear",
  display: "inline-block",
  marginBottom: 5,
};

const ReferralDashboard = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referredUsers, setReferredUsers] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const code = snap.data().referralCode;
        setReferralCode(code);
        setReferralLink(`${window.location.origin}/register?ref=${code}`);

        fetchReferrals(code);
      }
    };

    loadData();
  }, []);

  const fetchReferrals = async code => {
    const q = query(collection(db, "users"), where("referredBy", "==", code));
    const refUsers = await getDocs(q);

    const list = refUsers.docs.map(d => ({ id: d.id, ...d.data() }));
    setReferredUsers(list);
    setTotalEarnings(list.length * 100);
  };

  const copyText = text => {
    navigator.clipboard.writeText(text);
    toast.success("कॉपी हो गया!");
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg,#6a11cb,#2575fc)",
        padding: "20px 15px",
        fontFamily: "Poppins, sans-serif",
        color: "white",
      }}
    >
      <ToastContainer />

      {/* ⭐ INVITE BANNER */}
      <div
        style={{
          background: "linear-gradient(90deg,#ff9a00,#ff3d00)",
          padding: "16px",
          color: "white",
          borderRadius: 18,
          marginBottom: 20,
          textAlign: "center",
          fontWeight: 600,
          fontSize: 16,
          boxShadow: "0px 5px 15px rgba(0,0,0,0.25)",
        }}
      >
        🎉 दोस्तों को PatWin पर Invite करें और हर रजिस्ट्रेशन पर ₹100 कमाएं!
      </div>

      {/* ⭐ MAIN CARD */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 24,
          padding: "30px 20px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* ⭐ Reward Coin Animation */}
        <div style={{ fontSize: 60, marginBottom: 10 }}>🎁</div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
          दोस्तों को रेफ़र करें और कमाएँ
        </h2>

        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 10,
            color: "#ffea00",
          }}
        >
          ⭐ ₹100 रिवॉर्ड पॉइंट्स प्रति रेफ़रल ⭐
        </p>

        <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
          आपका दोस्त साइनअप पर ₹100 पॉइंट्स पाएगा और आपको भी ₹100 पॉइंट्स तुरंत
          मिलेंगे।
        </p>

        {/* ⭐ REFERRAL CODE BOX */}
        <div
          style={{
            background: "white",
            color: "#222",
            borderRadius: 12,
            padding: "12px 15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 15,
          }}
        >
          <span>{referralCode}</span>
          <button
            onClick={() => copyText(referralCode)}
            style={{
              background: "#6a11cb",
              border: "none",
              padding: "6px 12px",
              color: "white",
              borderRadius: 8,
              fontWeight: 600,
              width: "50%",
            }}
          >
            कॉपी
          </button>
        </div>

        {/* ⭐ SHARE SECTION */}
        {/* ⭐ SHARE SECTION */}
        <p style={{ fontSize: 14, marginBottom: 12 }}>अपना कोड शेयर करें</p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              background: "#2AABEE",
              padding: "10px 18px",
              borderRadius: 20,
              color: "white",
              border: "none",
              fontWeight: 600,
              width: "30%",
              minWidth: 100,
              fontSize: 12,
            }}
          >
            Telegram
          </button>

          <button
            style={{
              background: "#1877F2",
              padding: "10px 18px",
              borderRadius: 20,
              color: "white",
              border: "none",
              fontWeight: 600,
              width: "30%",
              minWidth: 100,
              fontSize: 12,
            }}
          >
            Facebook
          </button>

          <button
            onClick={() =>
              (window.location.href = `https://wa.me/?text=*🔥 PatWin से जुड़ें और ऑनलाइन पट गेम खेलें, जीत की शुरुआत करें! 🔥*

🎯 *मेरा रेफरल कोड इस्तेमाल करें*
💰 *रजिस्टर करते ही पाएं 100 कॉइन्स बिल्कुल FREE!*

👇 अभी जॉइन करें:
👉 ${referralLink}
 *Play • Refer • Earn* ⚡
`)
            }
            style={{
              background: "#25D366",
              padding: "10px 18px",
              borderRadius: 20,
              color: "white",
              border: "none",
              fontWeight: 600,
              width: "30%",
              minWidth: 100,
              fontSize: 12,
            }}
          >
            WhatsApp
          </button>
        </div>

        {/* ⭐ COPY REFERRAL LINK BUTTON */}
        {/* ⭐ SHOW REFERRAL LINK IN INPUT + COPY BUTTON */}
        <div
          style={{
            marginTop: 20,
            background: "white",
            padding: "12px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #ddd",
          }}
        >
          {/* REFERRAL LINK INPUT */}
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              width: "70%",
              padding: "10px",
              borderRadius: 10,
              border: "1px solid #ccc",
              fontSize: 12,
              outline: "none",
            }}
          />

          {/* COPY BUTTON */}
          <button
            onClick={() => copyText(referralLink)}
            style={{
              background: "linear-gradient(90deg,#6a11cb,#2575fc)",
              padding: "10px 15px",
              borderRadius: 12,
              color: "white",
              border: "none",
              fontWeight: 600,
              marginLeft: 10,
              width: "28%",
              fontSize: 12,
              boxShadow: "0px 5px 10px rgba(0,0,0,0.15)",
            }}
          >
            कॉपी लिंक
          </button>
        </div>
      </div>

      {/* ⭐ REFERRAL STATS */}
      <div
        style={{
          marginTop: 25,
          background: "white",
          padding: 20,
          borderRadius: 20,
          color: "#222",
          boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ marginBottom: 15, fontSize: 18, fontWeight: 700 }}>
          रेफ़रल आँकड़े
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "48%", textAlign: "center" }}>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px 10px",
                borderRadius: 12,
              }}
            >
              <p style={{ fontSize: 14, color: "#888" }}>कुल रेफ़रल</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#6a11cb" }}>
                {referredUsers.length}
              </p>
            </div>
          </div>

          <div style={{ width: "48%", textAlign: "center" }}>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px 10px",
                borderRadius: 12,
              }}
            >
              <p style={{ fontSize: 14, color: "#888" }}>कुल कमाई</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#2575fc" }}>
                ₹{totalEarnings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ REFERRAL LIST */}
      <div
        style={{
          marginTop: 25,
          background: "white",
          padding: 20,
          borderRadius: 20,
          color: "#222",
          marginBottom: 20,
          boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ marginBottom: 15, fontSize: 18 }}>रेफ़रल हिस्ट्री</h3>

        {referredUsers.length === 0 ? (
          <p style={{ color: "#666" }}>अभी तक कोई रेफ़रल नहीं मिला।</p>
        ) : (
          referredUsers.map(u => (
            <div
              key={u.id}
              style={{
                padding: 12,
                background: "#f7f7f7",
                borderRadius: 12,
                marginBottom: 10,
                border: "1px solid #ddd",
              }}
            >
              <p>
                <b>नाम:</b> {u.name}
              </p>
              {/* <p><b>मोबाइल:</b> {u.mobile}</p>
              <p><b>ईमेल:</b> {u.email}</p> */}
              <p>
                <b>जॉइनिंग तारीख:</b>{" "}
                {u.createdAt?.toDate
                  ? u.createdAt.toDate().toLocaleString()
                  : "N/A"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;
