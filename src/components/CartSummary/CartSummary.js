import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTruck,
  FaCreditCard,
  FaTag,
  FaRupeeSign,
  FaPercent,
} from "react-icons/fa";

import styles from "./CartSummary.module.css";

const CartSummary = ({
  cartItems = [],
  totalItems = 0,
  totalPrice = 0,
  subtotal,
  discount,
  delivery,
}) => {
  const navigate = useNavigate();

  // Delivery charge calculation:
  // Base delivery: ₹10 if subtotal < 499 (otherwise FREE)
  // Special surcharge for Medical Devices and Premium Healthcare: +₹50
  const isSpecialCategory = (category) => {
    if (!category) return false;
    const cat = String(category).toLowerCase().replace(/[-_]/g, " ");
    return (
      cat.includes("medical device") ||
      cat.includes("medicaldevices") ||
      cat.includes("device") ||
      cat.includes("premium healthcare") ||
      cat.includes("premiumhealthcare") ||
      cat.includes("premium")
    );
  };

  const hasSpecialItem = cartItems.some((item) => isSpecialCategory(item.category));

  // Product Subtotal
  const productSubtotal =
    subtotal !== undefined
      ? subtotal
      : cartItems.length > 0
      ? cartItems.reduce(
          (sum, item) =>
            sum + (Number(item.price ?? item.discountedPrice) || 0) * (Number(item.quantity) || 1),
          0
        )
      : totalPrice;

  const baseDelivery = productSubtotal >= 499 ? 0 : 10;
  const specialSurcharge = hasSpecialItem ? 50 : 0;
  const calculatedDelivery = baseDelivery + specialSurcharge;

  const deliveryCharge =
    delivery !== undefined
      ? delivery
      : calculatedDelivery;

  // Discount Amount
  const discountAmount = discount !== undefined ? discount : Math.round(productSubtotal * 0.1);

  // Final Total Amount
  const finalAmount = productSubtotal - discountAmount + deliveryCharge;

  // Checkout Button
  const handleCheckout = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      navigate("/checkout");
    } else {
      alert("Please login first.");
      navigate("/login");
    }
  };

  return (
    <div className={styles.summary}>
      <h2 className={styles.title}>
        Order Summary
      </h2>

      {/* Product List */}
      {cartItems.map((item) => {
        const itemPrice = Number(item.price ?? item.discountedPrice) || 0;
        const itemQty = Number(item.quantity) || 1;
        return (
          <div
            key={item.id}
            className={styles.productRow}
          >
            <span>
              📦 {item.name || item.title} × {itemQty}
            </span>

            <span>
              ₹{(itemPrice * itemQty).toLocaleString()}
            </span>
          </div>
        );
      })}

      {cartItems.length > 0 && <hr />}

      {/* Total Items */}
      <div className={styles.row}>
        <span>
          <FaShoppingCart /> Total Items
        </span>

        <span>{totalItems}</span>
      </div>

      {/* Product Price */}
      <div className={styles.row}>
        <span>
          <FaTag /> Product Price
        </span>

        <span>
          ₹{productSubtotal.toLocaleString()}
        </span>
      </div>

      {/* Discount (if applicable) */}
      {discountAmount > 0 && (
        <div className={styles.row}>
          <span>
            <FaPercent /> Discount (10%)
          </span>

          <span style={{ color: "#388e3c" }}>
            - ₹{discountAmount.toLocaleString()}
          </span>
        </div>
      )}

      {/* Delivery Charge */}
      <div className={styles.row}>
        <span>
          <FaTruck /> Delivery Charge
        </span>

        <span>
          {deliveryCharge === 0 ? (
            <span className={styles.freeDelivery}>FREE</span>
          ) : (
            `₹${deliveryCharge}`
          )}
        </span>
      </div>

      <hr />

      {/* Total Amount */}
      <div className={styles.total}>
        <span>
          <FaRupeeSign /> Total Amount
        </span>

        <span>
          ₹{finalAmount.toLocaleString()}
        </span>
      </div>

      {/* Savings Message */}
      {discountAmount > 0 && (
        <div className={styles.savings}>
          You will save ₹{discountAmount.toLocaleString()} on this order
        </div>
      )}

      <div className={styles.buttons}>
        {/* Continue Shopping */}
        <Link
          to="/shop"
          className={styles.continueBtn}
        >
          Continue Shopping
        </Link>

        {/* Proceed to Checkout */}
        <button
          type="button"
          className={styles.checkoutBtn}
          onClick={handleCheckout}
        >
          <FaCreditCard />
          &nbsp; Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSummary;