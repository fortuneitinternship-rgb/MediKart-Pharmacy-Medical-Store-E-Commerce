import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTimes,
} from "react-icons/fa";

import "./Register.css";
import { registerUser } from "../../api/authApi";

import registerImage from "../../assets/register/register.png";

const Register = ({ onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ============================
  // CLOSE REGISTER
  // ============================
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }

    navigate("/");
  };

  // ============================
  // GO TO LOGIN
  // ============================
  const handleBackToLogin = () => {
    if (typeof onSwitchToLogin === "function") {
      onSwitchToLogin();
      return;
    }

    navigate("/login");
  };

  // ============================
  // SUBMIT REGISTER FORM
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
    } = formData;

    // ----------------------------
    // Required field validation
    // ----------------------------
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // ----------------------------
    // Password length validation
    // ----------------------------
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // ----------------------------
    // Password match validation
    // ----------------------------
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // Convert frontend field names to FastAPI field names
      const response = await registerUser({
        username: name.trim(),
        email: email.trim(),
        password: password,
        confirm_password: confirmPassword,
      });

      console.log("Registration successful:", response);

      alert("Registration successful! Please login.");

      // Go to login
      if (typeof onSwitchToLogin === "function") {
        onSwitchToLogin();
      } else {
        navigate("/login");
      }
    } catch (submitError) {
      console.error("Registration error:", submitError);

      setError(
        submitError?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        {/* =====================================
            LEFT SIDE - REGISTER FORM
        ====================================== */}
        <div className="register-form-section">

          {/* CLOSE BUTTON */}
          <button
            type="button"
            className="register-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <div className="register-content">

            {/* HEADER */}
            <div className="register-header">
              <h1>Create Account</h1>

              <p>
                Join MEDIKART and manage your healthcare easily.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="register-form"
            >

              {/* =====================================
                  NAME
              ====================================== */}
              <div className="register-input-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* =====================================
                  EMAIL
              ====================================== */}
              <div className="register-input-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="register-input-wrapper">
                  <FaEnvelope className="register-input-icon" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* =====================================
                  PASSWORD
              ====================================== */}
              <div className="register-input-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* =====================================
                  CONFIRM PASSWORD
              ====================================== */}
              <div className="register-input-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* =====================================
                  ERROR MESSAGE
              ====================================== */}
              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}

              {/* =====================================
                  CREATE ACCOUNT BUTTON
              ====================================== */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>

            {/* =====================================
                LOGIN LINK
            ====================================== */}
            <div className="register-login">
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                className="login-link-button"
                onClick={handleBackToLogin}
              >
                Login
              </button>
            </div>

          </div>
        </div>

        {/* =====================================
            RIGHT SIDE - IMAGE
        ====================================== */}
        <div className="register-image-section">

          <img
            src={registerImage}
            alt="MEDIKART Healthcare"
            className="register-image"
          />

          <div className="register-image-overlay">
            <h2>
              Your Health, Our Priority
            </h2>

            <p>
              Get medicines, healthcare products
              and wellness essentials delivered to
              your doorstep.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;