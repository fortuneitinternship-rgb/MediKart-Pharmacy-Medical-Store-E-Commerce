import React from "react";
import { FaHeartbeat, FaShieldAlt, FaTruck, FaUsers, FaAward, FaPhoneAlt, } from "react-icons/fa";

import "./About.css";

function About() {
  return (
    <>
      <div className="about-page">
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <h1>About MEDIKART</h1>
            <p>
              Your trusted online healthcare and pharmacy partner delivering
              genuine medicines and wellness products across India.
            </p>
          </div>
        </section>

        {/* About */}
        <section className="about-container">
          <div className="about-text">
            <h2>Who We Are</h2>

            <p>
              MEDIKART is an online pharmacy dedicated to making healthcare
              simple, affordable, and accessible. We offer a wide range of
              medicines, healthcare products, personal care essentials,
              nutrition supplements, and medical devices.
            </p>

            <p>
              Every product is sourced from trusted manufacturers to ensure
              quality and authenticity. Our mission is to help every family
              access healthcare from the comfort of their home.
            </p>
          </div>

          <div className="about-icon">
            <FaHeartbeat />
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <h2>Why Choose MEDIKART?</h2>

          <div className="features-grid">
            <div className="feature-card">
              <FaShieldAlt />
              <h3>100% Genuine Medicines</h3>
              <p>Only authentic healthcare products from trusted brands.</p>
            </div>

            <div className="feature-card">
              <FaTruck />
              <h3>Fast Delivery</h3>
              <p>Quick and secure doorstep delivery across India.</p>
            </div>

            <div className="feature-card">
              <FaAward />
              <h3>Affordable Prices</h3>
              <p>Best prices with exciting discounts and offers.</p>
            </div>

            <div className="feature-card">
              <FaUsers />
              <h3>24×7 Customer Support</h3>
              <p>Friendly support team ready to assist you anytime.</p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="mission-section">
          <h2>Our Mission</h2>

          <p>
            Our mission is to provide trusted healthcare products at affordable
            prices while ensuring convenience, quality, and customer
            satisfaction through a reliable online pharmacy experience.
          </p>
        </section>

        {/* Contact */}
        <section className="contact-section">
          <FaPhoneAlt className="contact-icon" />

          <h2>Need Assistance?</h2>

          <p>Email : support@medikart.com</p>

          <p>Phone : +91 98765 43210</p>
        </section>
      </div>
    </>
  );
}

export default About;