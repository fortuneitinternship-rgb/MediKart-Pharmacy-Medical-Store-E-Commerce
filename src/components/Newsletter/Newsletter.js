import React, { useState, useEffect } from "react";
import styles from "./Newsletter.module.css";

import { subscribeNewsletter } from "../../api/newsletterApi";


const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);


  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  // Auto hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);


  const handleSubscribe = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");


    // Empty email validation
    if (!email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }


    // Email validation
    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }


    try {
      setLoading(true);

      await subscribeNewsletter(email);


      setMessage(
        "Thank you for subscribing! You'll receive our latest updates and offers."
      );

      setMessageType("success");

      setEmail("");
    } catch (error) {
      setMessage(
        error.message ||
        "Something went wrong. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className={styles.newsletterSection}>

      <div className={styles.container}>

        <div className={styles.content}>

          <h2 className={styles.title}>
            Subscribe to Our Newsletter
          </h2>


          <p className={styles.description}>
            Subscribe to our newsletter and be the first to know about
            new arrivals, health essentials, exclusive discounts, and
            special promotional campaigns.
          </p>


          <form
            className={styles.form}
            onSubmit={handleSubscribe}
          >

            <input
              type="email"
              placeholder="Enter your email address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />


            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >

              {loading ? "Subscribing..." : "Subscribe"}

            </button>

          </form>


          {message && (
            <p
              className={`${styles.message} ${
                messageType === "success"
                  ? styles.success
                  : styles.error
              }`}
            >
              {message}
            </p>
          )}

        </div>

      </div>

    </section>
  );
};


export default Newsletter;