import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, } from "react-icons/fa";

import "./Contact.css";
import { submitContactMessage } from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      await submitContactMessage(form);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (submitError) {
      setError(getApiErrorMessage(
        submitError,
        "Unable to send your message. Please try again."
      ));
    } finally {
      setSubmitting(false);
    }
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
                Message sent successfully!
              </div>
            )}
            {error && <div className="error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>

              <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />

              <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />

              <input type="tel" name="phone" placeholder="Mobile Number" value={form.phone} onChange={handleChange} required />

              <textarea rows="5" name="message" placeholder="Your Message" value={form.message} onChange={handleChange} required ></textarea>

              <button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;