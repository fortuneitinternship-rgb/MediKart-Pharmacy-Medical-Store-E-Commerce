import React, { useEffect, useState } from "react";
import * as router from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheck,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaHeadset,
  FaTimes,
  FaUndo,
  FaCalendarAlt,
  FaShippingFast,
  FaBox,
  FaMotorcycle,
  FaClipboardCheck,
  FaHome,
} from "react-icons/fa";
import { ToastContainer } from "react-toastify";

import "./TrackOrder.css";

const { Link, useNavigate } = router;

const TrackOrder = () => {
  const useParamsHook = router.useParams || (() => ({}));
  const { orderId } = useParamsHook();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const loadOrder = () => {
      try {
        const raw =
          localStorage.getItem("orders") ||
          localStorage.getItem("order") ||
          "null";

        if (!raw) {
          setOrder(null);
          return;
        }

        const parsed = JSON.parse(raw);
        if (!parsed) {
          setOrder(null);
          return;
        }

        const storedOrders = Array.isArray(parsed) ? parsed : [parsed];

        if (storedOrders.length === 0) {
          setOrder(null);
          return;
        }

        let selectedOrder;

        if (orderId) {
          selectedOrder = storedOrders.find(
            (item) =>
              String(item.orderId) === String(orderId) ||
              String(item.id) === String(orderId)
          );
        } else {
          selectedOrder = storedOrders[storedOrders.length - 1];
        }

        setOrder(selectedOrder || null);
      } catch (error) {
        console.error("Error loading order:", error);
        setOrder(null);
      }
    };

    loadOrder();
  }, [orderId]);

  /* ==========================================
     LOADING / EMPTY
  ========================================== */

  if (!order && orderId) {
    return (
      <div className="track-order-empty">
        <div className="track-empty-icon">
          <FaBoxOpen />
        </div>

        <h2>Order Not Found</h2>

        <p>
          We couldn't find an order with this order ID.
        </p>

        <Link to="/orders" className="track-empty-btn">
          View My Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="track-order-empty">
        <div className="track-empty-icon">
          <FaBoxOpen />
        </div>

        <h2>No Order Found</h2>

        <p>
          You haven't placed any orders yet.
        </p>

        <Link to="/shop" className="track-empty-btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* ==========================================
     ORDER INFORMATION
  ========================================== */

  const id =
    order.orderId ||
    order.id ||
    "MK0000000000";

  const orderDate =
    order.orderDate ||
    order.date ||
    "24 August 2026";

  const expectedDate =
    order.expectedDelivery ||
    order.deliveryDate ||
    order.estimatedDelivery ||
    "28 August 2026";

  const status =
    order.status ||
    "Order Placed";

  const trackingId =
    order.courier?.trackingId ||
    order.trackingId ||
    order.trackingNumber ||
    `MKTRK${String(id).slice(-8)}`;

  const deliveryPartner =
    order.courier?.name ||
    order.deliveryPartner ||
    "MEDIKART Delivery";

  /* ==========================================
     PRODUCTS
  ========================================== */

  let products = [];

  if (Array.isArray(order.items)) {
    products = order.items;
  } else if (Array.isArray(order.products)) {
    products = order.products;
  } else if (order.product) {
    products = [order.product];
  }

  /* ==========================================
     ADDRESS
  ========================================== */

  const shippingAddress =
    order.customer ||
    order.shippingAddress ||
    order.address ||
    {};

  const addressName =
    shippingAddress.name ||
    order.customerName ||
    order.name ||
    "Customer";

  const addressPhone =
    shippingAddress.phone ||
    order.phone ||
    "Not available";

  const addressLine =
    typeof shippingAddress === "string"
      ? shippingAddress
      : [
        shippingAddress.address,
        shippingAddress.street,
        shippingAddress.area,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.pincode,
      ]
        .filter(Boolean)
        .join(", ") || "Delivery address not available";

  /* ==========================================
     STATUS
  ========================================== */

  const getStatusStep = () => {
    const currentStatus = String(status).toLowerCase();

    if (
      currentStatus.includes("cancel")
    ) {
      return -1;
    }

    if (
      currentStatus.includes("deliver")
    ) {
      return 4;
    }

    if (
      currentStatus.includes("out")
    ) {
      return 3;
    }

    if (
      currentStatus.includes("ship") ||
      currentStatus.includes("transit")
    ) {
      return 2;
    }

    if (
      currentStatus.includes("pack")
    ) {
      return 1;
    }

    return 0;
  };

  const currentStep = getStatusStep();

  const steps = [
    {
      title: "Order Placed",
      description: "Your order has been placed successfully.",
      icon: <FaClipboardCheck />,
      date: orderDate,
    },
    {
      title: "Packed",
      description: "Your order has been packed and is ready to ship.",
      icon: <FaBox />,
      date: "Completed",
    },
    {
      title: "Shipped",
      description: "Your order has left the MEDIKART warehouse.",
      icon: <FaShippingFast />,
      date: "In Transit",
    },
    {
      title: "Out for Delivery",
      description: "Your order is out for delivery.",
      icon: <FaMotorcycle />,
      date: "Coming Soon",
    },
    {
      title: "Delivered",
      description: "Your order has been delivered successfully.",
      icon: <FaCheck />,
      date: expectedDate,
    },
  ];

  /* ==========================================
     CANCEL ORDER
  ========================================== */

  const handleCancelOrder = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      const storedOrders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      const updatedOrders = storedOrders.map((item) => {
        if (
          String(item.orderId || item.id) ===
          String(id)
        ) {
          return {
            ...item,
            status: "Cancelled",
          };
        }

        return item;
      });

      localStorage.setItem(
        "orders",
        JSON.stringify(updatedOrders)
      );

      setOrder({
        ...order,
        status: "Cancelled",
      });
    } catch (error) {
      console.error("Cancel order error:", error);
    }
  };

  /* ==========================================
     RETURN
  ========================================== */

  const handleReturn = () => {
    alert(
      "Return request has been initiated. Our support team will contact you."
    );
  };

  /* ==========================================
     TOTAL
  ========================================== */

  const totalAmount =
    order.totalAmount ||
    order.total ||
    order.grandTotal ||
    products.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
        Number(item.quantity || 1),
      0
    );

  return (
    <div className="track-order-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="track-header">

        <div className="track-header-inner">

          <button
            className="track-back-btn"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>{status === "Delivered" ? "Order Delivered" : "Track Order"}</h1>

            <p>
              Order ID: <strong>{id}</strong>
              <button
                type="button"
                title="Copy Order ID"
                onClick={() => navigator.clipboard.writeText(id)}
                style={{ marginLeft: "8px", border: "none", background: "none", cursor: "pointer" }}
              >
                📋
              </button>
            </p>
            {status === "Delivered" && (
              <p>Your order has been delivered successfully</p>
            )}
          </div>

          <Link
            to="/"
            className="track-home-btn"
          >
            <FaHome />
            Home
          </Link>

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="track-container">

        {/* ====================================
            ORDER STATUS CARD
        ==================================== */}

        <section className="track-status-card">

          <div className="track-status-left">

            <div className="track-truck-icon">
              <FaTruck />
            </div>

            <div>
              <span>Current Status</span>

              <h2>{status}</h2>

              <p>
                <FaCalendarAlt />
                Expected delivery by{" "}
                <strong>{expectedDate}</strong>
              </p>
            </div>

          </div>

          <div className="track-id-box">
            <span>Tracking ID</span>
            <strong>{trackingId}</strong>
          </div>

        </section>


        {/* ====================================
            DELIVERY TIMELINE
        ==================================== */}

        <section className="track-card">

          <div className="track-card-heading">

            <div>
              <h2>Delivery Tracking</h2>

              <p>
                Track your order from MEDIKART warehouse
                to your doorstep.
              </p>
            </div>

          </div>


          <div className="track-timeline">

            {steps.map((step, index) => {

              const completed =
                index < currentStep;

              const active =
                index === currentStep;

              return (
                <div
                  key={step.title}
                  className={`track-step ${completed ? "completed" : ""
                    } ${active ? "active" : ""
                    }`}
                >

                  <div className="track-step-left">

                    <div className="track-step-circle">

                      {completed ? (
                        <FaCheck />
                      ) : (
                        step.icon
                      )}

                    </div>

                    {index !== steps.length - 1 && (
                      <div className="track-step-line" />
                    )}

                  </div>


                  <div className="track-step-content">

                    <div className="track-step-title">

                      <h3>{step.title}</h3>

                      <span>{step.date}</span>

                    </div>

                    <p>
                      {step.description}
                    </p>

                    {active && (
                      <span className="track-active">
                        Current Status
                      </span>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* ====================================
            PRODUCTS
        ==================================== */}

        <section className="track-card">

          <div className="track-card-heading">

            <div>
              <h2>Order Items</h2>

              <p>
                {products.length === 1 ? "1 Item" : `${products.length} Items`} included in this order
              </p>
            </div>

          </div>


          <div className="track-products">

            {products.length > 0 ? (
              products.map((product, index) => {

                const image =
                  product.image ||
                  product.img ||
                  product.imageUrl;

                const name =
                  product.name ||
                  product.title ||
                  "Healthcare Product";

                const quantity =
                  product.quantity || 1;

                const productPrice =
                  Number(product.price || 0);

                return (
                  <div
                    className="track-product-row"
                    key={product.id || index}
                  >

                    <div className="track-product-img">

                      {image ? (
                        <img
                          src={image}
                          alt={name}
                        />
                      ) : (
                        <FaBoxOpen />
                      )}

                    </div>

                    <div className="track-product-details">

                      <h3>{name}</h3>

                      {product.brand && (
                        <p>Brand: <strong>{product.brand}</strong></p>
                      )}

                      <p>
                        Quantity: {quantity}
                      </p>

                    </div>

                    <strong>
                      ₹
                      {productPrice.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>
                );
              })
            ) : (
              <div className="track-no-products">
                <FaBoxOpen />
                <p>Product information unavailable.</p>
              </div>
            )}

          </div>


          <div className="track-total">

            <span>Total Amount</span>

            <strong>
              ₹
              {Number(totalAmount).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </section>


        {/* ====================================
            SHIPPING DETAILS
        ==================================== */}

        <section className="track-card">

          <div className="track-card-heading">

            <div>
              <h2>Shipment Details</h2>
            </div>

          </div>


          <div className="track-shipment-grid">

            <div>
              <span>Order ID</span>
              <strong>{id}</strong>
            </div>

            <div>
              <span>Tracking ID</span>
              <strong>{trackingId}</strong>
            </div>

            <div>
              <span>Delivery Partner</span>
              <strong>{deliveryPartner}</strong>
            </div>

            <div>
              <span>Order Date</span>
              <strong>{orderDate}</strong>
            </div>

            <div>
              <span>Expected Delivery</span>
              <strong>{expectedDate}</strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>
                {order.paymentMethod || "Online Payment"}
              </strong>
            </div>

          </div>

        </section>


        {/* ====================================
            ADDRESS
        ==================================== */}

        <section className="track-card">

          <div className="track-card-heading">

            <div>
              <h2>Delivery Address</h2>
            </div>

          </div>


          <div className="track-address">

            <div className="track-address-icon">
              <FaMapMarkerAlt />
            </div>

            <div>

              <h3>{addressName}</h3>

              <p>
                {addressLine}
              </p>

              {addressPhone && (
                <span>
                  <FaPhone />
                  {addressPhone}
                </span>
              )}

            </div>

          </div>

        </section>


        {/* ====================================
            ACTIONS
        ==================================== */}

        <section className="track-actions">

          <Link
            to="/contact"
            className="track-help-btn"
          >
            <FaHeadset />
            Contact Us
          </Link>

          {currentStep < 2 &&
            status !== "Cancelled" && (
              <button
                className="track-cancel-btn"
                onClick={handleCancelOrder}
              >
                <FaTimes />
                Cancel Order
              </button>
            )}

          {currentStep === 4 && (
            <button
              className="track-return-btn"
              onClick={handleReturn}
            >
              <FaUndo />
              Return Order
            </button>
          )}

        </section>


        {/* ====================================
            ORDERS
        ==================================== */}

        <div className="track-view-orders">

          <Link to="/orders">
            <FaBoxOpen />
            View All Orders
          </Link>

        </div>

      </main>

      <ToastContainer />
    </div>
  );
};

export default TrackOrder;