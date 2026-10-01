import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUserCircle,
  FaBoxOpen,
  FaHistory,
  FaTruck,
  FaHeart,
  FaShoppingCart,
  FaCreditCard,
  FaMapMarkerAlt,
  FaFileMedical,
  FaHeartbeat,
  FaGift,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import "./AccountDropdown.css";

const AccountDropdown = ({ username = "Satender" }) => {
  const navigate = useNavigate();

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("userUpdated"));

    navigate("/login");
  };

  return (
    <div className="account-dropdown">

      {/* ============================================
          ACCOUNT HEADER
      ============================================ */}

      <div className="account-header">

        <FaUserCircle className="account-avatar" />

        <div className="account-user-info">
          <h3>My Account</h3>
          <p>Hi, {username} 👋</p>
        </div>

      </div>

      <div className="account-divider"></div>

      {/* ============================================
          MY PROFILE
      ============================================ */}

      <Link
        to="/profile"
        className="account-item"
      >
        <FaUserCircle />
        <span>My Profile</span>
      </Link>

      {/* ============================================
          MY ORDERS
      ============================================ */}

      <Link
        to="/orders"
        className="account-item"
      >
        <FaBoxOpen />
        <span>My Orders</span>
      </Link>

      {/* ============================================
          ORDER HISTORY
      ============================================ */}

      <Link
        to="/order-history"
        className="account-item"
      >
        <FaHistory />
        <span>Order History</span>
      </Link>

      {/* ============================================
          TRACK ORDER
      ============================================ */}

      <Link
        to="/track-order"
        className="account-item"
      >
        <FaTruck />
        <span>Track Order</span>
      </Link>

      {/* ============================================
          WISHLIST
      ============================================ */}

      <Link
        to="/wishlist"
        className="account-item"
      >
        <FaHeart />
        <span>Wishlist</span>
      </Link>

      {/* ============================================
          MY CART
      ============================================ */}

      <Link
        to="/cart"
        className="account-item"
      >
        <FaShoppingCart />
        <span>My Cart</span>
      </Link>

      {/* ============================================
          SAVED PAYMENTS
      ============================================ */}

      <Link
        to="/payments"
        className="account-item"
      >
        <FaCreditCard />
        <span>Saved Payments</span>
      </Link>

      {/* ============================================
          SAVED ADDRESSES
      ============================================ */}

      <Link
        to="/addresses"
        className="account-item"
      >
        <FaMapMarkerAlt />
        <span>Saved Addresses</span>
      </Link>

      {/* ============================================
          UPLOAD PRESCRIPTION
      ============================================ */}

      <Link
        to="/upload-prescription"
        className="account-item"
      >
        <FaFileMedical />
        <span>Upload Prescription</span>
      </Link>

      {/* ============================================
          HEALTH RECORDS
      ============================================ */}

      <Link
        to="/health-records"
        className="account-item"
      >
        <FaHeartbeat />
        <span>Health Records</span>
      </Link>

      {/* ============================================
          OFFERS
      ============================================ */}

      <Link
        to="/offers"
        className="account-item"
      >
        <FaGift />
        <span>Offers & Coupons</span>
      </Link>

      {/* ============================================
          NOTIFICATIONS
      ============================================ */}

      <Link
        to="/notifications"
        className="account-item"
      >
        <FaBell />
        <span>Notifications</span>
      </Link>

      {/* ============================================
          SETTINGS
      ============================================ */}

      <Link
        to="/settings"
        className="account-item"
      >
        <FaCog />
        <span>Settings</span>
      </Link>

      <div className="account-divider"></div>

      {/* ============================================
          LOGOUT
      ============================================ */}

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>

    </div>
  );
};

export default AccountDropdown;