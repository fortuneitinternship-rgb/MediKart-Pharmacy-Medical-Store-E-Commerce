import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaShoppingCart,
  FaThLarge,
  FaHeart,
  FaInfoCircle,
  FaPhone,
  FaUser,
  FaUserCircle,
  FaBox,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaSignInAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";

import "./MobileMenu.css";
import logo from "../../assets/Medikart-logo.png";

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navigate = useNavigate();

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getUser());

  /*
   * Update user when login/logout happens
   */
  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(getUser());
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener(
        "userUpdated",
        handleUserUpdate
      );
    };
  }, []);

  /*
   * Prevent body scrolling when sidebar is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");

    setUser(null);

    window.dispatchEvent(new Event("userUpdated"));

    closeMenu();

    navigate("/login");
  };

  const goTo = (path) => {
    closeMenu();
    navigate(path);
  };

  const menuItems = [
    {
      name: "Home",
      icon: <FaHome />,
      path: "/",
    },
    {
      name: "Shop",
      icon: <FaShoppingCart />,
      path: "/shop",
    },
    {
      name: "Categories",
      icon: <FaThLarge />,
      path: "/categories",
    },
    {
      name: "Wishlist",
      icon: <FaHeart />,
      path: "/wishlist",
    },
    {
      name : "Settings",
      icon : <FaCog />,
      path : "/settings"
    },
    {
      name: "Cart",
      icon: <FaShoppingCart />,
      path: "/cart",
    },
    {
      name: "About Us",
      icon: <FaInfoCircle />,
      path: "/about",
    },
    {
      name: "Contact Us",
      icon: <FaPhone />,
      path: "/contact",
    },
  ];

  return (
    <>
      {/* =========================================
          HAMBURGER BUTTON
      ========================================== */}

      <button
        className="mobile-menu-btn"
        onClick={openMenu}
        aria-label="Open mobile menu"
      >
        <FaBars />
      </button>


      {/* =========================================
          OVERLAY
      ========================================== */}

      {isOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMenu}
        />
      )}


      {/* =========================================
          SIDEBAR
      ========================================== */}

      <aside
        className={`mobile-sidebar ${isOpen ? "mobile-sidebar-open" : ""
          }`}
      >

        {/* =========================================
            SIDEBAR HEADER
        ========================================== */}

        <div className="mobile-sidebar-header">

          <div className="mobile-brand">
            <img
              src={logo}
              alt="Medikart Logo"
            />

            <div>
              <h2>MEDIKART</h2>
              <span>Your Health Partner</span>
            </div>
          </div>

          <button
            className="mobile-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

        </div>


        {/* =========================================
            USER / ACCOUNT
        ========================================== */}

        {user ? (
          <div className="mobile-user-section">

            <button
              className="mobile-user-button"
              onClick={() =>
                setAccountOpen(!accountOpen)
              }
            >

              <div className="mobile-user-info">

                <div className="mobile-user-avatar">

                  {user.photo || user.image ? (
                    <img
                      src={
                        user.photo ||
                        user.image
                      }
                      alt="Profile"
                    />
                  ) : (
                    <FaUser />
                  )}

                </div>

                <div className="mobile-user-text">
                  <span>Hello,</span>

                  <strong>
                    {user.name ||
                      user.username ||
                      "User"}
                  </strong>
                </div>

              </div>

              <FaChevronDown
                className={
                  accountOpen
                    ? "account-arrow account-arrow-open"
                    : "account-arrow"
                }
              />

            </button>


            {/* ACCOUNT DROPDOWN */}

            {accountOpen && (
              <div className="mobile-account-dropdown">

                <button
                  onClick={() =>
                    goTo("/profile")
                  }
                >
                  <FaUserCircle />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() =>
                    goTo("/orders")
                  }
                >
                  <FaBox />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() =>
                    goTo("/wishlist")
                  }
                >
                  <FaHeart />
                  <span>My Wishlist</span>
                </button>

                <button
                  onClick={() =>
                    goTo("/addresses")
                  }
                >
                  <FaMapMarkerAlt />
                  <span>Saved Addresses</span>
                </button>

                <button
                  onClick={() =>
                    goTo("/settings")
                  }
                >
                  <FaCog />
                  <span>Settings</span>
                </button>

              </div>
            )}

          </div>
        ) : (

          /* LOGIN CARD */

          <div className="mobile-login-card">

            <div className="mobile-login-icon">
              <FaUser />
            </div>

            <div className="mobile-login-content">
              <strong>Welcome to MEDIKART</strong>
              <span>Login to view your account</span>
            </div>

            <button
              onClick={() =>
                goTo("/login")
              }
            >
              <FaSignInAlt />
              Login
            </button>

          </div>
        )}


        {/* =========================================
            QUICK LINKS
        ========================================== */}

        {user && (
          <div className="mobile-quick-links">

            <button
              onClick={() =>
                goTo("/orders")
              }
            >
              <FaBox />
              <span>Orders</span>
            </button>

            <button
              onClick={() =>
                goTo("/wishlist")
              }
            >
              <FaHeart />
              <span>Wishlist</span>
            </button>

            <button
              onClick={() =>
                goTo("/cart")
              }
            >
              <FaShoppingCart />
              <span>Cart</span>
            </button>

          </div>
        )}


        {/* =========================================
            MAIN MENU
        ========================================== */}

        <div className="mobile-menu-heading">
          MENU
        </div>

        <nav className="mobile-nav">

          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive
                  ? "mobile-nav-item active"
                  : "mobile-nav-item"
              }
            >

              <span className="mobile-nav-icon">
                {item.icon}
              </span>

              <span className="mobile-nav-name">
                {item.name}
              </span>

              <span className="mobile-nav-arrow">
                ›
              </span>

            </NavLink>
          ))}

        </nav>


        {/* =========================================
            HELP
        ========================================== */}

        <div className="mobile-help">

          <FaQuestionCircle />

          <div>
            <strong>Need Help?</strong>
            <span>Contact MEDIKART Support</span>
          </div>

        </div>


        {/* =========================================
            BOTTOM LOGIN / LOGOUT
        ========================================== */}

        <div className="mobile-sidebar-footer">

          {user ? (
            <button
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          ) : (
            <button
              className="mobile-login-btn"
              onClick={() =>
                goTo("/login")
              }
            >
              <FaSignInAlt />
              <span>Login</span>
            </button>
          )}

        </div>

      </aside>
    </>
  );
}

export default MobileMenu;
