import { useEffect } from "react";

function AdBanner() {
  useEffect(() => {
    // Initialize the ad options
    window.atOptions = {
      key: 'c615fa491c497b76936cda90556ccc67',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {}
    };

    // Create and append the ad network script
    const adScript = document.createElement("script");
    adScript.type = "text/javascript";
    adScript.src = "//www.highperformanceformat.com/c615fa491c497b76936cda90556ccc67/invoke.js";
    adScript.async = true;
    
    // Append the script to the ad-container
    const adContainer = document.getElementById("ad-container");
    adContainer.appendChild(adScript);

    // Cleanup the ad when the component unmounts
    return () => {
      adContainer.innerHTML = "";
    };
  }, []);

  return (
    <div style={{ textAlign: "center", margin: "5px 0" }}>
      <div id="ad-container" style={{ minHeight: "60px" }}></div>
    </div>
  );
}

export default AdBanner;
