import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaMapMarkerAlt, FaBox, FaTruck, FaShoppingBag, } from "react-icons/fa";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order || JSON.parse(localStorage.getItem("latestOrder"));

  if (!order) {
    return (
      <div className="orderNotFound">
        <h2>No Order Found</h2>
        <button onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="orderConfirmationContainer">
      <div className="confirmationCard">

        {/* Success */}
        <div className="successSection">
          <FaCheckCircle className="successIcon" />
          <h1>Order Placed Successfully!</h1>
          <p>
            Thank you for shopping with <strong>MEDIKART</strong>.
          </p>
        </div>

        {/* Order Details */}
        <div className="orderDetails">

          <div className="detailRow">
            <span>Order ID</span>
            <strong>{order.orderId}</strong>
          </div>

          <div className="detailRow">
            <span>Order Date</span>
            <strong>{order.orderDate}</strong>
          </div>

          <div className="detailRow">
            <span>Expected Delivery</span>
            <strong>{order.deliveryDate}</strong>
          </div>

          <div className="detailRow">
            <span>Payment Method</span>
            <strong>{order.paymentMethod}</strong>
          </div>

        </div>

        {/* Address */}
        <div className="addressCard">
          <h3>
            <FaMapMarkerAlt /> Delivery Address
          </h3>

          <p><strong>{order.address.name}</strong></p>
          <p>{order.address.address}</p>
          <p>
            {order.address.city}, {order.address.state}
          </p>
          <p>{order.address.pincode}</p>
          <p>{order.address.phone}</p>
        </div>

        {/* Ordered Products */}
        <div className="itemsCard">
          <h3>
            <FaShoppingBag /> Ordered Items
          </h3>

          {order.items.map((item) => (
            <div className="orderItem" key={item.id}>
              <img src={item.image} alt={item.name} />

              <div className="itemInfo">
                <h4>{item.name}</h4>
                <p>Qty : {item.quantity}</p>
              </div>

              <div className="itemPrice">
                ₹{item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Price Details */}
        <div className="priceCard">
          <h3>
            <FaBox /> Price Details
          </h3>

          <div className="priceRow">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="priceRow">
            <span>Discount</span>
            <span>- ₹{order.discount}</span>
          </div>

          <div className="priceRow">
            <span>Delivery Charges</span>
            <span className="free">FREE</span>
          </div>

          <div className="priceRow">
            <span>GST</span>
            <span>₹{order.gst}</span>
          </div>

          <hr />

          <div className="priceRow total">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="statusCard">
          <h3>
            <FaTruck /> Order Status
          </h3>

          <div className="timeline">
            <div className="active">
              ✔ Order Confirmed
            </div>

            <div>Packed</div>

            <div>Shipped</div>

            <div>Out for Delivery</div>

            <div>Delivered</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="buttonSection">

          <button
            className="trackBtn"
            onClick={() => navigate("/orders")}
          >
            Track Order
          </button>

          <button
            className="continueBtn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>

        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;