import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, } from "react-icons/fa";

import "./Contact.css";

function Contact() {
  const  [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    e.target.reset();
  };

  return (
    <>
      <div className="contact-page">

        {/* Hero */}

        <section className="contact-hero">
          <h1>Contact MEDIKART</h1>
          <p> We're here to help you 24×7 </p>
        </section>

        {/* Contact */}

        <div className="contact-container">

          {/* Left */}

          <div className="contact-info">

            <h2>Get In Touch</h2>

            <div className="info-box">
              <FaPhoneAlt />
              <div>
                <h4>Phone</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="info-box">
              <FaEnvelope />
              <div>
                <h4>Email</h4>
                <p>support@medikart.com</p>
              </div>
            </div>

            <div className="info-box">
              <FaMapMarkerAlt />
              <div>
                <h4>Address</h4>
                <p> Medikart Healthcare Pvt. Ltd. <br /> Hyderabad, Telangana <br /> India
                </p>
              </div>
            </div>

            <div className="info-box">
              <FaClock />
              <div>
                <h4>Working Hours</h4>
                <p> Monday - Sunday <br /> 9:00 AM - 9:00 PM
                </p>
              </div>
            </div>

          </div>

          {/* Right */}

          <div className="contact-form">

            <h2>Send a Message</h2>

            {submitted && (
              <div className="success">
                ✅ Message sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <input type="text" placeholder="Your Name" required />

              <input type="email" placeholder="Email Address" required />

              <input type="tel" placeholder="Mobile Number" required />

              <textarea rows="5" placeholder="Your Message" required ></textarea>

              <button type="submit"> Send Message </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;