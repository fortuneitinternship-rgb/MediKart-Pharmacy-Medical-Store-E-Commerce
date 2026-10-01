import React, { useState } from "react";
import { FaUser, FaBell, FaLock, FaGlobe, FaMoon, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaSignOutAlt, } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("user");

    alert("Logged out successfully!");
    window.location.href = "/login";
  };

  return (
    <div className={`settings-page ${darkMode ? "dark" : ""}`}>
      <div className="settings-container">

        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your MEDIKART account and preferences</p>
        </div>

        {/* Account */}
        <div className="settings-section">
          <h2>Account</h2>

          <div className="settings-item">
            <div className="settings-icon">
              <FaUser />
            </div>

            <div className="settings-content">
              <h3>Profile</h3>
              <p>Manage your personal information</p>
            </div>

            <button
              onClick={() => {
                window.location.href = "/profile";
              }}
            >
              Open
            </button>
          </div>

          <div className="settings-item">
            <div className="settings-icon">
              <FaLock />
            </div>

            <div className="settings-content">
              <h3>Password & Security</h3>
              <p>Change your password and security settings</p>
            </div>

            <button
              onClick={() => {
                window.location.href = "/forgot-password";
              }}
            >
              Manage
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h2>Notifications</h2>

          <div className="settings-item">
            <div className="settings-icon">
              <FaBell />
            </div>

            <div className="settings-content">
              <h3>Notifications</h3>
              <p>Receive MEDIKART notifications</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() =>
                  setNotifications(!notifications)
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-icon">
              <FaShoppingBag />
            </div>

            <div className="settings-content">
              <h3>Order Updates</h3>
              <p>Get updates about your orders</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={orderUpdates}
                onChange={() =>
                  setOrderUpdates(!orderUpdates)
                }
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h2>Preferences</h2>

          <div className="settings-item">
            <div className="settings-icon">
              <FaGlobe />
            </div>

            <div className="settings-content">
              <h3>Language</h3>
              <p>Choose your preferred language</p>
            </div>

            <select defaultValue="English">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="settings-item">
            <div className="settings-icon">
              <FaMoon />
            </div>

            <div className="settings-content">
              <h3>Dark Mode</h3>
              <p>Change the appearance of MEDIKART</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Shopping */}
        <div className="settings-section">
          <h2>Shopping</h2>

          <div
            className="settings-item clickable"
            onClick={() => {
              window.location.href = "/orders";
            }}
          >
            <div className="settings-icon">
              <FaShoppingBag />
            </div>

            <div className="settings-content">
              <h3>My Orders</h3>
              <p>View and track your orders</p>
            </div>

            <span>›</span>
          </div>

          <div
            className="settings-item clickable"
            onClick={() => {
              window.location.href = "/wishlist";
            }}
          >
            <div className="settings-icon">
              <FaHeart />
            </div>

            <div className="settings-content">
              <h3>Wishlist</h3>
              <p>View your saved products</p>
            </div>

            <span>›</span>
          </div>

          <div
            className="settings-item clickable"
            onClick={() => {
              window.location.href = "/addresses";
            }}
          >
            <div className="settings-icon">
              <FaMapMarkerAlt />
            </div>

            <div className="settings-content">
              <h3>Saved Addresses</h3>
              <p>Manage your delivery addresses</p>
            </div>

            <span>›</span>
          </div>
        </div>

        {/* Logout */}
        <div className="settings-section logout-section">
          <div
            className="settings-item logout"
            onClick={handleLogout}
          >
            <div className="settings-icon">
              <FaSignOutAlt />
            </div>

            <div className="settings-content">
              <h3>Logout</h3>
              <p>Sign out from your MEDIKART account</p>
            </div>

            <span>›</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
