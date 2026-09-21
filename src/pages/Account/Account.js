import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUserCircle,
  FaBoxOpen,
  FaHeart,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaFileMedical,
  FaCreditCard,
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronRight,
  FaTruck,
  FaHistory,
  FaHome,
  FaEdit,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

import "./Account.css";

const Account = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "MEDIKART User",
    email: "user@example.com",
  });

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    loadAccountData();

    const handleStorage = () => {
      loadAccountData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleStorage);
    window.addEventListener("wishlistUpdated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleStorage);
      window.removeEventListener("wishlistUpdated", handleStorage);
    };
  }, []);

  const loadAccountData = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        setUser({
          name: parsedUser.name || "MEDIKART User",
          email: parsedUser.email || "user@example.com",
        });
      }

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const wishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );
      const orders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      setCartCount(Array.isArray(cart) ? cart.length : 0);
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      setOrdersCount(Array.isArray(orders) ? orders.length : 0);
    } catch (error) {
      console.error("Error loading account data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");

    navigate("/login");
  };

  const menuItems = [
    {
      icon: <FaBoxOpen />,
      title: "My Orders",
      description: "View and manage your orders",
      path: "/orders",
      count: ordersCount,
    },
    {
      icon: <FaTruck />,
      title: "Track Order",
      description: "Track your current deliveries",
      path: "/track-order",
    },
    {
      icon: <FaHeart />,
      title: "My Wishlist",
      description: "Products you saved",
      path: "/wishlist",
      count: wishlistCount,
    },
    {
      icon: <FaShoppingCart />,
      title: "My Cart",
      description: "View products in your cart",
      path: "/cart",
      count: cartCount,
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Saved Addresses",
      description: "Manage your delivery addresses",
      path: "/addresses",
    },
    {
      icon: <FaFileMedical />,
      title: "My Prescriptions",
      description: "Upload and manage prescriptions",
      path: "/prescriptions",
    },
    {
      icon: <FaCreditCard />,
      title: "Payments",
      description: "Manage payment methods",
      path: "/payments",
    },
    {
      icon: <FaBell />,
      title: "Notifications",
      description: "View your notifications",
      path: "/notifications",
    },
    {
      icon: <FaCog />,
      title: "Account Settings",
      description: "Manage your account preferences",
      path: "/settings",
    },
    {
      icon: <FaQuestionCircle />,
      title: "Help & Support",
      description: "Get help with your MEDIKART account",
      path: "/help",
    },
  ];

  return (
    <div className="account-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="account-header">
        <div className="account-header-inner">

          <div>
            <h1>My Account</h1>
            <p>Manage your MEDIKART account</p>
          </div>

          <Link to="/" className="account-home-button">
            <FaHome />
            Back to Home
          </Link>

        </div>
      </div>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="account-main">

        {/* =========================================
            PROFILE CARD
        ========================================= */}

        <section className="account-profile-card">

          <div className="account-profile-left">

            <div className="account-avatar">
              <FaUserCircle />
            </div>

            <div className="account-profile-info">

              <span className="account-welcome">
                Welcome back,
              </span>

              <h2>{user.name}</h2>

              <p>{user.email}</p>

              <span className="account-member">
                <FaShieldAlt />
                MEDIKART Member
              </span>

            </div>

          </div>

          <button
            className="account-edit-button"
            onClick={() => navigate("/settings")}
          >
            <FaEdit />
            Edit Profile
          </button>

        </section>


        {/* =========================================
            QUICK STATS
        ========================================= */}

        <section className="account-stats">

          <Link to="/orders" className="account-stat-card">

            <div className="stat-icon orders">
              <FaBoxOpen />
            </div>

            <div>
              <strong>{ordersCount}</strong>
              <span>Orders</span>
            </div>

          </Link>


          <Link to="/wishlist" className="account-stat-card">

            <div className="stat-icon wishlist">
              <FaHeart />
            </div>

            <div>
              <strong>{wishlistCount}</strong>
              <span>Wishlist</span>
            </div>

          </Link>


          <Link to="/cart" className="account-stat-card">

            <div className="stat-icon cart">
              <FaShoppingCart />
            </div>

            <div>
              <strong>{cartCount}</strong>
              <span>Cart Items</span>
            </div>

          </Link>


          <Link to="/track-order" className="account-stat-card">

            <div className="stat-icon tracking">
              <FaTruck />
            </div>

            <div>
              <strong>Track</strong>
              <span>My Delivery</span>
            </div>

          </Link>

        </section>


        {/* =========================================
            ACCOUNT CONTENT
        ========================================= */}

        <section className="account-section">

          <div className="account-section-heading">
            <div>
              <h2>Account</h2>
              <p>Manage your MEDIKART activities</p>
            </div>
          </div>


          <div className="account-menu-grid">

            {menuItems.map((item, index) => (

              <Link
                to={item.path}
                className="account-menu-card"
                key={index}
              >

                <div className="account-menu-icon">
                  {item.icon}
                </div>

                <div className="account-menu-content">

                  <div className="account-menu-title">

                    <h3>{item.title}</h3>

                    {item.count !== undefined &&
                      item.count > 0 && (
                        <span className="account-count">
                          {item.count}
                        </span>
                      )}

                  </div>

                  <p>{item.description}</p>

                </div>

                <FaChevronRight className="account-arrow" />

              </Link>

            ))}

          </div>

        </section>


        {/* =========================================
            RECENT ORDER
        ========================================= */}

        <section className="account-recent-card">

          <div className="recent-header">

            <div>
              <h2>Recent Activity</h2>
              <p>Your latest MEDIKART activity</p>
            </div>

            <Link to="/orders">
              View All
              <FaChevronRight />
            </Link>

          </div>


          {ordersCount > 0 ? (

            <div className="recent-order">

              <div className="recent-order-icon">
                <FaBoxOpen />
              </div>

              <div className="recent-order-info">
                <strong>Recent Order</strong>
                <span>Your latest order is available here.</span>
              </div>

              <Link to="/orders">
                View Order
              </Link>

            </div>

          ) : (

            <div className="empty-activity">

              <FaHistory />

              <h3>No recent orders</h3>

              <p>
                Once you place an order, you can see it here.
              </p>

              <Link to="/shop">
                Start Shopping
              </Link>

            </div>

          )}

        </section>


        {/* =========================================
            SUPPORT
        ========================================= */}

        <section className="account-support">

          <div className="support-icon">
            <FaHeadset />
          </div>

          <div className="support-content">
            <h3>Need Help?</h3>
            <p>
              Our MEDIKART support team is here to help you.
            </p>
          </div>

          <Link to="/help" className="support-button">
            Contact Support
          </Link>

        </section>


        {/* =========================================
            LOGOUT
        ========================================= */}

        <button
          className="account-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>

      </main>
    </div>
  );
};

export default Account;