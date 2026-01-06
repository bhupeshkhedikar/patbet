import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setActiveTab(path);
    setSidebarOpen(false);
  };

  // Click outside to close sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="admin-navbar">
        <div className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <ul>
          <li className={activeTab === "/apna" ? "active" : ""} onClick={() => handleNavigation("/apna")}>Dashboard</li>
          <li className={activeTab === "/manage-games" ? "active" : ""} onClick={() => handleNavigation("/manage-games")}>Manage Games</li>
          <li className={activeTab === "/transactions" ? "active" : ""} onClick={() => handleNavigation("/transactions")}>Transactions</li>
          <li className={activeTab === "/online-users" ? "active" : ""} onClick={() => handleNavigation("/online-users")}>Online Users</li>
          <li className={activeTab === "/registered-users" ? "active" : ""} onClick={() => handleNavigation("/registered-users")}>Registered Users</li>
          <li className={activeTab === "/bets-history" ? "active" : ""} onClick={() => handleNavigation("/bets-history")}>Bets History</li>
          <li className={activeTab === "/manage-times" ? "active" : ""} onClick={() => handleNavigation("/manage-times")}>Manage Times</li>
          <li className={activeTab === "/announcements" ? "active" : ""} onClick={() => handleNavigation("/announcements")}>Announcements</li>
          <li className={activeTab === "/chatcontrol" ? "active" : ""} onClick={() => handleNavigation("/chatcontrol")}>Chats Enable Disable</li>
          <li className={activeTab === "/lotsfeed" ? "active" : ""} onClick={() => handleNavigation("/lotsfeed")}>Lots Imgage Upload</li>
          <li className={activeTab === "/manageresults" ? "active" : ""} onClick={() => handleNavigation("/manageresults")}>Results Table</li>
          <li className={activeTab === "/delete-video" ? "active" : ""} onClick={() => handleNavigation("/delete-video")}>Delete Video</li>
          <li className={activeTab === "/referral-admin" ? "active" : ""} onClick={() => handleNavigation("/referral-admin")}>referral-admin</li>
          <li className={activeTab === "/radmin" ? "active" : ""} onClick={() => handleNavigation("/radmin")}>game admin</li>
          <li className={activeTab === "/reward" ? "active" : ""} onClick={() => handleNavigation("/reward")}>whatsapp admin</li>
        </ul>
      </nav>

      {/* Sidebar for mobile */}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <ul>
          <li className={activeTab === "/apna" ? "active" : ""} onClick={() => handleNavigation("/apna")}>Dashboard</li>
          <li className={activeTab === "/manage-games" ? "active" : ""} onClick={() => handleNavigation("/manage-games")}>Manage Games</li>
          <li className={activeTab === "/transactions" ? "active" : ""} onClick={() => handleNavigation("/transactions")}>Transactions</li>
          <li className={activeTab === "/online-users" ? "active" : ""} onClick={() => handleNavigation("/online-users")}>Online Users</li>
          <li className={activeTab === "/registered-users" ? "active" : ""} onClick={() => handleNavigation("/registered-users")}>Registered Users</li>
          <li className={activeTab === "/bets-history" ? "active" : ""} onClick={() => handleNavigation("/bets-history")}>Bets History</li>
          <li className={activeTab === "/manage-times" ? "active" : ""} onClick={() => handleNavigation("/manage-times")}>Manage Times</li>
          <li className={activeTab === "/announcements" ? "active" : ""} onClick={() => handleNavigation("/announcements")}>Announcements</li>
          <li className={activeTab === "/chatcontrol" ? "active" : ""} onClick={() => handleNavigation("/chatcontrol")}>Chats Enable Disable</li>
          <li className={activeTab === "/lotsfeed" ? "active" : ""} onClick={() => handleNavigation("/lotsfeed")}>Lots Imgage Upload</li>
          <li className={activeTab === "/manageresults" ? "active" : ""} onClick={() => handleNavigation("/manageresults")}>Results Table</li>
          <li className={activeTab === "/delete-video" ? "active" : ""} onClick={() => handleNavigation("/delete-video")}>Delete Video</li>
          <li className={activeTab === "/referral-admin" ? "active" : ""} onClick={() => handleNavigation("/referral-admin")}>referral-admin</li>
          <li className={activeTab === "/radmin" ? "active" : ""} onClick={() => handleNavigation("/radmin")}>game admin</li>
<li className={activeTab === "/reward" ? "active" : ""} onClick={() => handleNavigation("/reward")}>whatsapp admin</li>
            
        </ul>
      </div>
    </>
  );
};

export default AdminNavbar;
