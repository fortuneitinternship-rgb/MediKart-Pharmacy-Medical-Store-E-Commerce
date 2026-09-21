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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }

    navigate("/");
  };

  const handleBackToLogin = () => {
    if (typeof onSwitchToLogin === "function") {
      onSwitchToLogin();
      return;
    }

    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await registerUser({ name, email, password });

      alert("Registration successful! Please login.");

      if (typeof onSwitchToLogin === "function") {
        onSwitchToLogin();
      } else {
        navigate("/login");
      }
    } catch (submitError) {
      setError(
        submitError.message ||
        "Unable to create account. Please try again."
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        {/* LEFT SIDE - FORM */}
        <div className="register-form-section">

          <button
            className="register-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <div className="register-content">

            <div className="register-header">
              <h1>Create Account</h1>
              <p>Join MEDIKART and manage your healthcare easily.</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">

              {/* NAME */}
              <div className="register-input-group">
                <label>Full Name</label>

                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="register-input-group">
                <label>Email Address</label>

                <div className="register-input-wrapper">
                  <FaEnvelope className="register-input-icon" />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="register-input-group">
                <label>Password</label>

                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="register-input-group">
                <label>Confirm Password</label>

                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && <div className="register-error">{error}</div>}

              <button type="submit" className="register-button">
                Create Account
              </button>

            </form>

            <div className="register-login">
              Already have an account?
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

        {/* RIGHT SIDE - IMAGE */}
        <div className="register-image-section">
          <img
            src={registerImage}
            alt="MEDIKART Healthcare"
            className="register-image"
          />

          <div className="register-image-overlay">
            <h2>Your Health, Our Priority</h2>
            <p>
              Get medicines, healthcare products and wellness essentials
              delivered to your doorstep.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;