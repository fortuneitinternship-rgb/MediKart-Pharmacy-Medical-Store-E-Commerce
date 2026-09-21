import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
  FaApple,
  FaTimes,
} from "react-icons/fa";

import image from "../../assets/Login.png";
import "./Login.css";
import { getCurrentUser, loginUser } from "../../api/authApi";

const Login = ({
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  /* =====================================================
     CLOSE LOGIN
  ===================================================== */
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }

    if (typeof onLoginSuccess === "function") {
      onLoginSuccess();
      return;
    }

    navigate("/");
  };

  const handleOpenRegister = () => {
    if (typeof onSwitchToRegister === "function") {
      onSwitchToRegister();
      return;
    }

    navigate("/register");
  };

  const handleOpenForgotPassword = () => {
    if (typeof onSwitchToForgotPassword === "function") {
      onSwitchToForgotPassword();
      return;
    }

    navigate("/forgot-password");
  };

  /* =====================================================
     CLOSE WHEN CLICKING OUTSIDE
  ===================================================== */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /* =====================================================
     SAVE LOGIN SESSION
  ===================================================== */
  const saveLoginSession = (user) => {
    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem(
      "username",
      user.name || user.username || user.email
    );

    localStorage.setItem("user", JSON.stringify(user));

    if (remember) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    // Notify Navbar and other components
    window.dispatchEvent(new Event("userUpdated"));
  };

  /* =====================================================
     LOGIN
  ===================================================== */
  const handleLogin = async (e) => {
    e.preventDefault();

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password;

    /* =================================================
       VALIDATION
    ================================================= */
    if (!enteredEmail || !enteredPassword.trim()) {
      alert("Please enter email/username and password.");
      return;
    }

    try {
      const tokenResponse = await loginUser(
        enteredEmail,
        enteredPassword
      );

      localStorage.setItem(
        "access_token",
        tokenResponse.access_token
      );

      const currentUser = await getCurrentUser();
      saveLoginSession(currentUser);
      alert("Login successful!");
      handleClose();
    } catch (error) {
      localStorage.removeItem("access_token");
      alert(error.message || "Unable to login. Please try again.");
    }
  };

  return (
    <div
      className="login-popup-overlay"
      onMouseDown={handleOverlayClick}
    >
      {/* =================================================
          LOGIN POPUP
      ================================================= */}
      <div
        className="login-popup"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* =================================================
            CLOSE BUTTON
        ================================================= */}
        <button
          type="button"
          className="login-close-button"
          onClick={handleClose}
          aria-label="Close login"
          title="Close"
        >
          <FaTimes />
        </button>

        {/* =================================================
            LEFT IMAGE
        ================================================= */}
        <div className="auth-image-section">
          <img
            src={image}
            alt="MEDIKART Login"
            className="auth-image"
          />

          <div className="image-overlay">
            <h1>Welcome to MEDIKART</h1>

            <p>
              Your trusted online healthcare
              &amp; pharmacy partner.
            </p>
          </div>
        </div>

        {/* =================================================
            RIGHT FORM
        ================================================= */}
        <div className="auth-form-section">
          <div className="auth-form-box">

            {/* LOGO */}
            <div className="auth-logo">
              <span>MEDI</span>
              <strong>KART</strong>
            </div>

            {/* HEADING */}
            <h2>Login</h2>

            <p className="auth-subtitle">
              Login to continue shopping with MEDIKART
            </p>

            {/* =================================================
                FORM
            ================================================= */}
            <form onSubmit={handleLogin}>

              {/* EMAIL / USERNAME */}
              <div className="input-group">
                <FaUser className="input-icon" />

                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  aria-label="Email or Username"
                />
              </div>

              {/* PASSWORD */}
              <div className="input-group">
                <FaLock className="input-icon" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-label="Password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* =================================================
                  OPTIONS
              ================================================= */}
              <div className="login-options">

                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(e.target.checked)
                    }
                  />

                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleOpenForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="auth-button"
              >
                Login
              </button>
            </form>

            {/* =================================================
                OR
            ================================================= */}
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* =================================================
                SOCIAL LOGIN
            ================================================= */}
            <div className="social-login">

              <button
                type="button"
                aria-label="Google login"
                title="Google"
              >
                <FaGoogle />
              </button>

              <button
                type="button"
                aria-label="Facebook login"
                title="Facebook"
              >
                <FaFacebookF />
              </button>

              <button
                type="button"
                aria-label="Apple login"
                title="Apple"
              >
                <FaApple />
              </button>

            </div>

            {/* =================================================
                REGISTER
            ================================================= */}
            <p className="switch-auth">
              Don't have an account?{" "}
              <button
                type="button"
                className="register-link-button"
                onClick={handleOpenRegister}
              >
                Create Account
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
