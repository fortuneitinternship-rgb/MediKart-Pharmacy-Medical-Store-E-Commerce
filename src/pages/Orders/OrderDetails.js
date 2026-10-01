import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaShoppingBag,
} from "react-icons/fa";

import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrders =
      JSON.parse(localStorage.getItem("orders")) || [];

    const selectedOrder = savedOrders.find(
      (item) => String(item.id) === String(id)
    );

    setOrder(selectedOrder);
  }, [id]);

  if (!order) {
    return (
      <div className="order-not-found">

        <FaBoxOpen />

        <h2>Order Not Found</h2>

        <p>
          We couldn't find this order.
        </p>

        <button onClick={() => navigate("/orders")}>
          Go to My Orders
        </button>

      </div>
    );
  }

  const items = order.items || [];

  const subtotal =
    order.subtotal ??
    items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );

  const deliveryCharge =
    order.deliveryCharge ?? 0;

  const total =
    order.totalAmount ??
    order.total ??
    subtotal + deliveryCharge;

  return (
    <div className="order-details-page">

      <div className="order-details-container">

        {/* Back */}
        <button
          className="back-orders-btn"
          onClick={() => navigate("/orders")}
        >
          <FaArrowLeft />
          Back to Orders
        </button>

        {/* Header */}
        <div className="order-details-header">

          <div>
            <p>Order Details</p>

            <h1>
              Order #{order.id}
            </h1>

            <span>
              Placed on {order.date || "Recently"}
            </span>
          </div>

          <div className="order-confirmed">
            <FaCheckCircle />

            <span>
              {order.status || "Processing"}
            </span>
          </div>

        </div>

        {/* Order Items */}
        <div className="details-card">

          <div className="details-card-title">
            <FaShoppingBag />

            <h2>Ordered Products</h2>
          </div>

          <div className="details-products">

            {items.map((item, index) => (

              <div
                className="details-product"
                key={item.id || index}
              >

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div className="details-product-info">

                  <h3>{item.name}</h3>

                  {item.category && (
                    <p>
                      Category: {item.category}
                    </p>
                  )}

                  <p>
                    Quantity: {item.quantity || 1}
                  </p>

                </div>

                <div className="details-product-price">

                  <span>
                    ₹{Number(item.price || 0).toFixed(2)}
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    ).toFixed(2)}
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Delivery + Payment */}
        <div className="details-two-columns">

          <div className="details-card">

            <div className="details-card-title">
              <FaMapMarkerAlt />

              <h2>Delivery Address</h2>
            </div>

            <div className="address-details">

              <h3>
                {order.address?.name ||
                  order.customerName ||
                  "Customer"}
              </h3>

              <p>
                {order.address?.address ||
                  order.address ||
                  "Delivery address"}
              </p>

              {order.address?.city && (
                <p>
                  {order.address.city},{" "}
                  {order.address.state} -{" "}
                  {order.address.pincode}
                </p>
              )}

              {order.address?.phone && (
                <p>
                  Phone: {order.address.phone}
                </p>
              )}

            </div>

          </div>

          <div className="details-card">

            <div className="details-card-title">
              <FaCreditCard />

              <h2>Payment Information</h2>
            </div>

            <div className="payment-details">

              <p>
                <span>Payment Method</span>

                <strong>
                  {order.paymentMethod ||
                    "Cash on Delivery"}
                </strong>
              </p>

              <p>
                <span>Delivery Type</span>

                <strong>
                  {order.deliveryType ||
                    "Standard Delivery"}
                </strong>
              </p>

              <p>
                <span>Payment Status</span>

                <strong>
                  {order.paymentStatus ||
                    "Pending"}
                </strong>
              </p>

            </div>

          </div>

        </div>

        {/* Price Summary */}
        <div className="details-card price-summary">

          <div className="details-card-title">
            <FaCreditCard />

            <h2>Price Details</h2>
          </div>

          <div className="price-row">
            <span>Product Total</span>

            <strong>
              ₹{Number(subtotal).toFixed(2)}
            </strong>
          </div>

          <div className="price-row">
            <span>Delivery Charge</span>

            <strong>
              {deliveryCharge === 0
                ? "FREE"
                : `₹${Number(
                    deliveryCharge
                  ).toFixed(2)}`}
            </strong>
          </div>

          <div className="price-divider" />

          <div className="price-row final-price">
            <span>Total Amount</span>

            <strong>
              ₹{Number(total).toFixed(2)}
            </strong>
          </div>

        </div>

        {/* Buy Again */}
        <div className="buy-again-section">

          <button
            className="buy-now-btn"
            onClick={() => {
              localStorage.setItem(
                "checkoutItems",
                JSON.stringify(items)
              );

              navigate(`/orders/${order.id}`);
            }}
          >
            <FaShoppingBag />
            Buy Now
          </button>

          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/shop")}
          >
            Continue Shopping
          </button>

        </div>

      </div>

    </div>
  );
};

export default OrderDetails;