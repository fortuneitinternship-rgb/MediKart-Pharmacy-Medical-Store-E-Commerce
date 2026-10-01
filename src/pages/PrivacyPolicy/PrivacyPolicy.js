import React from "react";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacy-container">

      <div className="privacy-header">
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. This Privacy Policy explains how
          MEDIKART collects, uses, and protects your personal information.
        </p>
      </div>

      <div className="privacy-content">

        <section className="privacy-card">
          <h2>1. Information We Collect</h2>
          <p>
            We may collect your name, email address, phone number, shipping
            address, payment details, and order history when you use our
            website.
          </p>
        </section>

        <section className="privacy-card">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Process and deliver your orders.</li>
            <li>Provide customer support.</li>
            <li>Improve our products and services.</li>
            <li>Send offers and promotional updates.</li>
            <li>Prevent fraud and ensure security.</li>
          </ul>
        </section>

        <section className="privacy-card">
          <h2>3. Cookies</h2>
          <p>
            MEDIKART uses cookies to enhance your browsing experience,
            remember your preferences, and analyze website traffic.
          </p>
        </section>

        <section className="privacy-card">
          <h2>4. Data Security</h2>
          <p>
            We use industry-standard security measures to protect your
            personal information from unauthorized access, misuse, or loss.
          </p>
        </section>

        <section className="privacy-card">
          <h2>5. Third-Party Services</h2>
          <p>
            We may share information with trusted payment gateways,
            delivery partners, and service providers only for completing
            your orders.
          </p>
        </section>

        <section className="privacy-card">
          <h2>6. Your Rights</h2>
          <ul>
            <li>Access your personal information.</li>
            <li>Update or correct your information.</li>
            <li>Delete your account.</li>
            <li>Opt out of promotional emails.</li>
          </ul>
        </section>

        <section className="privacy-card">
          <h2>7. Contact Us</h2>
          <p>Email: support@medikart.com</p>
          <p>Phone: +91 98765 43210</p>
        </section>

      </div>
    </div>
  );
}

export default PrivacyPolicy;