import React from "react";

const Footer = () => {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#0F1325",
        color: "#B0B0B0",
        textAlign: "center",
        padding: "10px 8px",
        fontSize: "11px",
        lineHeight: "1.6",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        marginBottom: "78px", // ✅ Bottom Nav से टकराने से बचे
      }}
    >
      <div style={{ color: "#FF9800", fontWeight: "600" }}>
        PatWin Disclaimer
      </div>
      <div style={{ marginTop: "5px" }}>
        यह ऐप केवल एंटरटेनमेंट और प्रिडिक्शन गेम है। इसमें किसी भी प्रकार की
        सट्टेबाज़ी, जुआ या वास्तविक धन का लेनदेन नहीं होता है।
      </div>

      <div style={{ marginTop: "6px", fontSize: "10px", color: "#777" }}>
        © {new Date().getFullYear()} PatWin. All Rights Reserved.
      </div>
    </div>
  );
};

export default Footer;
