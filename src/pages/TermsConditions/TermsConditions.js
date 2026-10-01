import React from "react";
import "./TermsConditions.css";

function TermsConditions() {
  return (
    <div className="terms-container">

      <div className="terms-header">
        <h1>Terms & Conditions</h1>
        <p>
          Welcome to <strong>MEDIKART</strong>. By accessing or using our
          website, you agree to comply with the following Terms and Conditions.
          Please read them carefully before placing an order.
        </p>
      </div>

      <div className="terms-content">

        <section className="terms-card">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using MEDIKART, you confirm that you have read, understood,
            and accepted these Terms and Conditions.
          </p>
        </section>

        <section className="terms-card">
          <h2>2. User Account</h2>
          <ul>
            <li>You are responsible for maintaining your account details.</li>
            <li>Keep your login credentials secure.</li>
            <li>You must provide accurate information.</li>
          </ul>
        </section>

        <section className="terms-card">
          <h2>3. Orders & Payments</h2>
          <ul>
            <li>All orders are subject to product availability.</li>
            <li>Prices may change without prior notice.</li>
            <li>Payments must be completed before order processing.</li>
          </ul>
        </section>

        <section className="terms-card">
          <h2>4. Shipping & Delivery</h2>
          <p>
            Delivery timelines depend on your location. Delays caused by
            weather, logistics, or unforeseen events may occur.
          </p>
        </section>

        <section className="terms-card">
          <h2>5. Returns & Refunds</h2>
          <ul>
            <li>Products can be returned only if eligible.</li>
            <li>Refunds are processed after successful verification.</li>
            <li>Prescription medicines cannot be returned.</li>
          </ul>
        </section>

        <section className="terms-card">
          <h2>6. Prohibited Activities</h2>
          <ul>
            <li>Misuse of the website.</li>
            <li>Providing false information.</li>
            <li>Attempting unauthorized access.</li>
            <li>Using the website for illegal activities.</li>
          </ul>
        </section>

        <section className="terms-card">
          <h2>7. Intellectual Property</h2>
          <p>
            All content including logos, images, graphics, and text belongs
            to MEDIKART and may not be copied without permission.
          </p>
        </section>

        <section className="terms-card">
          <h2>8. Limitation of Liability</h2>
          <p>
            MEDIKART shall not be liable for any indirect or incidental
            damages resulting from the use of our services.
          </p>
        </section>

        <section className="terms-card">
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms & Conditions at any
            time. Continued use of the website indicates acceptance of the
            revised terms.
          </p>
        </section>

        <section className="terms-card">
          <h2>10. Contact Us</h2>
          <p>Email: support@medikart.com</p>
          <p>Phone: +91 98765 43210</p>
        </section>

      </div>

    </div>
  );
}

export default TermsConditions;