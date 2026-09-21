import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./UserAction.module.css";

import {
  FaHeart,
  FaShoppingCart,
  FaCog,
  FaTruck,
  FaBoxOpen,
} from "react-icons/fa";

import Login from "../Login/Login";
import Register from "../Register/Register";
import ForgotPassword from "../ForgotPassword/ForgotPassword";

function UserActions() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [username, setUsername] = useState("");
  const [authModal, setAuthModal] = useState(null);
  const [showAccountDropdown, setShowAccountDropdown] =
    useState(false);

  // ==============================
  // UPDATE COUNTS & USER
  // ==============================

  const updateCount = () => {
    const cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const wishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    setCartCount(cart.length);
    setWishlistCount(wishlist.length);

    const user = localStorage.getItem("username");

    if (user) {
      setUsername(user);
    } else {
      setUsername("");
    }
  };

  // ==============================
  // USE EFFECT
  // ==============================

  useEffect(() => {
    updateCount();

    window.addEventListener("cartUpdated", updateCount);
    window.addEventListener(
      "wishlistUpdated",
      updateCount
    );
    window.addEventListener("userUpdated", updateCount);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCount
      );

      window.removeEventListener(
        "wishlistUpdated",
        updateCount
      );

      window.removeEventListener(
        "userUpdated",
        updateCount
      );
    };
  }, []);

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUsername("");
    setShowAccountDropdown(false);

    window.dispatchEvent(new Event("userUpdated"));

    navigate("/");
  };

  // ==============================
  // LOGIN SUCCESS
  // ==============================

  const handleLoginSuccess = () => {
    setAuthModal(null);
    setShowAccountDropdown(false);

    updateCount();

    window.dispatchEvent(
      new Event("userUpdated")
    );
  };

  // ==============================
  // CLOSE DROPDOWN
  // ==============================

  const closeDropdown = () => {
    setShowAccountDropdown(false);
  };

  return (
    <>
      <div className={styles.userActions}>

        {/* ==============================
            WISHLIST
        ============================== */}

        <Link
          to="/wishlist"
          className={styles.wishlistBtn}
        >
          ❤️

          <span className={styles.label}>
            Wishlist
          </span>

          {wishlistCount > 0 && (
            <span className={styles.badge}>
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* ==============================
            CART
        ============================== */}

        <Link
          to="/cart"
          className={styles.cartBtn}
        >
          🛒

          <span className={styles.label}>
            Cart
          </span>

          {cartCount > 0 && (
            <span className={styles.badge}>
              {cartCount}
            </span>
          )}
        </Link>

        {/* ==============================
            ACCOUNT
        ============================== */}

        <div className={styles.accountWrapper}>

          <button
            type="button"
            className={styles.accountBtn}
            onClick={() => {
              if (!username) {
                setAuthModal("login");
              } else {
                setShowAccountDropdown(
                  (prev) => !prev
                );
              }
            }}
          >
            👤

            <span className={styles.label}>
              {username || "Login"}
            </span>

            {username && (
              <span className={styles.arrow}>
                {showAccountDropdown
                  ? "▲"
                  : "▼"}
              </span>
            )}
          </button>

          {/* ==============================
              ACCOUNT DROPDOWN
          ============================== */}

          {username && showAccountDropdown && (
            <div className={styles.accountDropdown}>

              {/* =========================================
        ACCOUNT HEADER
    ========================================= */}

              <div className={styles.accountHeader}>

                <div className={styles.profileIcon}>
                  👤
                </div>

                <div>
                  <strong>{username}</strong>
                  <span>My Account</span>
                </div>

              </div>

              <div className={styles.dropdownDivider}></div>

              {/* =========================================
        MY ACCOUNT
    ========================================= */}

              <Link
                to="/account"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                👤

                <span>
                  My Account
                </span>
              </Link>

              {/* =========================================
        MY ORDERS
    ========================================= */}

              <Link
                to="/orders"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                <FaBoxOpen />

                <span>
                  My Orders
                </span>
              </Link>

              {/* =========================================
        ORDER HISTORY
    ========================================= */}

              <Link
                to="/order-history"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                📋

                <span>
                  Order History
                </span>
              </Link>

              {/* =========================================
        TRACK ORDER
    ========================================= */}

              <Link
                to="/track-order"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                <FaTruck />

                <span>
                  Track Order
                </span>
              </Link>

              {/* =========================================
        MY WISHLIST
    ========================================= */}

              <Link
                to="/wishlist"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                <FaHeart />

                <span>
                  My Wishlist
                </span>
              </Link>

              {/* =========================================
        MY CART
    ========================================= */}

              <Link
                to="/cart"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                <FaShoppingCart />

                <span>
                  My Cart
                </span>
              </Link>

              {/* =========================================
        SETTINGS
    ========================================= */}

              <Link
                to="/settings"
                className={styles.dropdownItem}
                onClick={closeDropdown}
              >
                <FaCog />

                <span>
                  Settings
                </span>
              </Link>

              <div className={styles.dropdownDivider}></div>

              {/* =========================================
        LOGOUT
    ========================================= */}

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
              >
                🚪

                <span>
                  Logout
                </span>
              </button>

            </div>
          )}

        </div>
      </div>

      {/* ==============================
          LOGIN POPUP
      ============================== */}

      {authModal && (
        <div
          className={styles.overlay}
          onClick={() => setAuthModal(null)}
        >

          <div
            className={styles.popup}
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setAuthModal(null)}
            >
              ✕
            </button>

            {authModal === "login" && (
              <Login
                onClose={() => setAuthModal(null)}
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setAuthModal("register")}
                onSwitchToForgotPassword={() => setAuthModal("forgot")}
              />
            )}

            {authModal === "register" && (
              <Register
                onClose={() => setAuthModal(null)}
                onSwitchToLogin={() => setAuthModal("login")}
              />
            )}

            {authModal === "forgot" && (
              <ForgotPassword
                onClose={() => setAuthModal(null)}
                onSwitchToLogin={() => setAuthModal("login")}
              />
            )}

          </div>

        </div>
      )}

    </>
  );
}

export default UserActions;