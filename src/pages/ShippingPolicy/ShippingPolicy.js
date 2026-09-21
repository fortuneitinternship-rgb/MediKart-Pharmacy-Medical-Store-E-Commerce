import React from "react";
import "./ShippingPolicy.css";

function ShippingPolicy() {
  return (
    <div className="shipping-container">

      <div className="shipping-header">
        <h1>Shipping Policy</h1>

        <p>
          At <strong>MEDIKART</strong>, we are committed to delivering your
          healthcare products quickly, safely, and securely. Please read our
          shipping policy carefully before placing your order.
        </p>
      </div>

      <div className="shipping-content">

        <section className="shipping-card">
          <h2>1. Order Processing</h2>

          <p>
            Orders are processed within <strong>24–48 hours</strong> after
            successful payment confirmation. Orders placed on weekends or
            public holidays will be processed on the next working day.
          </p>
        </section>

        <section className="shipping-card">
          <h2>2. Delivery Time</h2>

          <ul>
            <li>Metro Cities: 1–3 Business Days</li>
            <li>Other Cities: 3–5 Business Days</li>
            <li>Remote Areas: 5–7 Business Days</li>
          </ul>
        </section>

        <section className="shipping-card">
          <h2>3. Shipping Charges</h2>

          <ul>
            <li>Orders above ₹499 – FREE Delivery</li>
            <li>Orders below ₹499 – ₹49 Shipping Fee</li>
            <li>Medical Devices may have additional delivery charges.</li>
          </ul>
        </section>

        <section className="shipping-card">
          <h2>4. Order Tracking</h2>

          <p>
            Once your order has been shipped, you will receive a tracking
            number via SMS and Email. You can also track your order from the
            "Track Order" page.
          </p>
        </section>

        <section className="shipping-card">
          <h2>5. Delivery Partners</h2>

          <p>
            We work with trusted courier partners to ensure fast and secure
            delivery across India.
          </p>
        </section>

        <section className="shipping-card">
          <h2>6. Delayed Deliveries</h2>

          <p>
            Delivery may be delayed due to weather conditions, natural
            disasters, public holidays, or other unforeseen circumstances.
            We appreciate your patience.
          </p>
        </section>

        <section className="shipping-card">
          <h2>7. Damaged Package</h2>

          <p>
            If your package arrives damaged, please contact our customer
            support within <strong>24 hours</strong> of delivery with
            photographs of the package.
          </p>
        </section>

        <section className="shipping-card">
          <h2>8. Incorrect Address</h2>

          <p>
            Customers are responsible for providing the correct delivery
            address. MEDIKART is not responsible for orders delivered to
            incorrect addresses provided by customers.
          </p>
        </section>

        <section className="shipping-card">
          <h2>9. International Shipping</h2>

          <p>
            Currently, MEDIKART delivers only within India. International
            shipping services will be introduced in the future.
          </p>
        </section>

        <section className="shipping-card">
          <h2>10. Contact Us</h2>

          <p>Email: support@medikart.com</p>
          <p>Phone: +91 98765 43210</p>
        </section>

      </div>

    </div>
  );
}

export default ShippingPolicy;