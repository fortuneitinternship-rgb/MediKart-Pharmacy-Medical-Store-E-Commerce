import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";

import "./ForgotPassword.css";
import {
  forgotPassword,
  resendOTP,
  resetPassword,
  verifyOTP,
} from "../../api/authApi";

const ForgotPassword = ({ onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (step !== "otp" || resendSeconds === 0) return undefined;

    const timer = window.setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [step, resendSeconds]);

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setStatusMessage("");

    try {
      await forgotPassword(email);

      setStep("otp");
      setResendSeconds(60);
      setStatusMessage("OTP sent. Check your email.");
      setError("");
    } catch (err) {
      console.error('Send OTP Error:', err);

      // Handle network errors specifically
      if (err.message === 'Failed to fetch') {
        setError(
          "Cannot connect to server. Please check if the backend is running at http://127.0.0.1:8000"
        );
      } else {
        setError(err.message || "Unable to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setStatusMessage("");

    try {
      await resendOTP(email);
      setOtp("");
      setResendSeconds(60);
      setStatusMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setStatusMessage("");

    try {
      await verifyOTP(email, otp);

      setStep("reset");
      setResendSeconds(0);
      setError("");
    } catch (err) {
      console.error('Verify OTP Error:', err);

      if (err.message === 'Failed to fetch') {
        setError(
          "Cannot connect to server. Please check if the backend is running at http://127.0.0.1:8000"
        );
      } else {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please enter your password.");
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

    setLoading(true);
    setError("");

    try {
      await resetPassword(email, otp, password);


      // Clear password fields
      setPassword("");
      setConfirmPassword("");
      setError("");

      // Move to success page
      setStep("success");
    } catch (err) {
      console.error('Reset Password Error:', err);

      if (err.message === 'Failed to fetch') {
        setError(
          "Cannot connect to server. Please check if the backend is running at http://127.0.0.1:8000"
        );
      } else {
        setError(err.message || "Unable to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK TO LOGIN
  // ==========================================

  const handleBackToLogin = () => {
    if (typeof onSwitchToLogin === "function") {
      onSwitchToLogin();
      return;
    }

    if (typeof onClose === "function") {
      onClose();
      return;
    }

    navigate("/login");
  };

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
      setResendSeconds(0);
      setStatusMessage("");
      setError("");
    } else if (step === "reset") {
      setStep("otp");
      setPassword("");
      setConfirmPassword("");
      setError("");
    } else {
      handleBackToLogin();
    }
  };

  // ==========================================
  // CLOSE
  // ==========================================

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      handleBackToLogin();
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="forgot-overlay">
      <div className="forgot-popup">

        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="forgot-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* ======================================
            STEP 1 - EMAIL
        ====================================== */}

        {step === "email" && (
          <>
            <div className="forgot-lock-icon">
              <FaLock />
            </div>

            <h2>Forgot Password?</h2>

            <p>
              Enter your registered email address
              and we'll send you a 6-digit OTP.
            </p>

            <form onSubmit={handleSendOTP}>
              <div className="forgot-input">
                <FaEnvelope />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="send-reset-btn"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>
            </form>

            <button
              type="button"
              className="back-login"
              onClick={handleBackToLogin}
            >
              <FaArrowLeft />
              Back to Login
            </button>
          </>
        )}

        {/* ======================================
            STEP 2 - OTP
        ====================================== */}

        {step === "otp" && (
          <>
            <div className="forgot-lock-icon">
              <FaEnvelope />
            </div>

            <h2>Verify OTP</h2>

            <p>
              Enter the 6-digit OTP sent to
              <br />
              <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div className="otp-input">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  required
                />
              </div>

              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="send-reset-btn"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>
            </form>

            {statusMessage && (
              <div className="forgot-success" role="status">
                {statusMessage}
              </div>
            )}

            <button
              type="button"
              className="resend-otp-btn"
              onClick={handleResendOTP}
              disabled={loading || resendSeconds > 0}
            >
              {loading
                ? "Resending..."
                : resendSeconds > 0
                  ? `Resend OTP in ${String(Math.floor(resendSeconds / 60)).padStart(2, "0")}:${String(resendSeconds % 60).padStart(2, "0")}`
                  : "Resend OTP"}
            </button>

            <button
              type="button"
              className="back-login"
              onClick={handleBack}
            >
              <FaArrowLeft />
              Back
            </button>
          </>
        )}

        {/* ======================================
            STEP 3 - RESET PASSWORD
        ====================================== */}

        {step === "reset" && (
          <>
            <div className="forgot-lock-icon">
              <FaLock />
            </div>

            <h2>Reset Password</h2>

            <p>
              Create a new password for your
              account.
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="forgot-input">
                <FaLock />

                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  minLength={6}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>

              <div className="forgot-input">
                <FaLock />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />
              </div>

              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="send-reset-btn"
                disabled={loading}
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            </form>

            <button
              type="button"
              className="back-login"
              onClick={handleBack}
            >
              <FaArrowLeft />
              Back
            </button>
          </>
        )}

        {/* ======================================
            STEP 4 - SUCCESS
        ====================================== */}

        {step === "success" && (
          <>
            <div className="success-icon">
              ✓
            </div>

            <h2>
              Password Reset Successfully
            </h2>

            <p>
              Your password has been changed
              successfully. You can now login with
              your new password.
            </p>

            <button
              type="button"
              className="send-reset-btn"
              onClick={handleBackToLogin}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;