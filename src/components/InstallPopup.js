import React, { useEffect, useState } from "react";

const InstallPopup = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(true); // Always show

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Auto open install popup immediately when allowed
      e.prompt();
    });
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert(
        "Your browser will show the install option automatically when PWA is supported.\n\n" +
          "Tips:\n• Use Chrome\n• Visit at least once\n• Use HTTPS\n• Avoid Facebook/Instagram in-app browser"
      );
      return;
    }

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      localStorage.setItem("pwaInstalled", "true");
      setVisible(false);
    }
  };

  const closePopup = () => setVisible(false);

  if (!visible) return null;

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        {/* Close Button */}
        <span style={styles.closeBtn} onClick={closePopup}>
          ✕
        </span>

        {/* Left Section */}
        <div style={styles.left}>
          <img src="icon-144x144.png" alt="PatBet" style={styles.icon} />

          <div>
            <p style={styles.title}>Install PatWin App</p>
            <p style={styles.subtitle}>Download Our App Now</p>
          </div>
        </div>

        {/* Install Button */}

        <a style={styles.installBtn} href="/PatWin.apk">
          Install
        </a>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   PATBET THEME POPUP WITH CLOSE BUTTON
------------------------------------------------------------------- */
const styles = {
  outer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    zIndex: 999999,
    paddingTop: "8px",
  },

  card: {
    width: "92%",
    background: "rgba(20,20,20,0.95)",
    borderRadius: "14px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 0 12px rgba(8, 230, 118, 0.4)",
    border: "1px solid rgba(8, 230, 118, 0.4)",
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    right: "10px",
    top: "6px",
    color: "#ffffffaa",
    fontSize: "18px",
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: "50%",
    marginTop: "5px",
    transition: "0.2s",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    marginRight: "10px",
  },

  icon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "2px solid #08e676",
    boxShadow: "0 0 10px rgba(8, 230, 118, 0.5)",
  },

  title: {
    margin: 0,
    color: "#08e676",
    fontSize: "14px",
    fontWeight: "700",
  },

  subtitle: {
    margin: 0,
    marginTop: "2px",
    color: "#cccccc",
    fontSize: "11px",
  },

  installBtn: {
    background: "#08e676",
    color: "black",
    border: "none",
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    width: "70px",
    boxShadow: "0 0 10px #08e676",
    cursor: "pointer",
    marginRight: "30px",
    textDecoration: "none",
  },
};

export default InstallPopup;
