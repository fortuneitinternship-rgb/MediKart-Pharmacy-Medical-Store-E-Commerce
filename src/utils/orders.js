import { getOrders } from "../api/ordersApi";
import { getStoredAccessToken } from "../services/api";
import { getProductImage } from "./productImage";

const PAYMENT_LABELS = {
  COD: "Cash on Delivery",
  UPI: "UPI",
  CARD: "Credit / Debit Card",
  NETBANKING: "Net Banking",
};

const DELIVERY_LABELS = {
  normal: "Standard Delivery",
  express: "Express Delivery",
  today: "Same-day Delivery",
};

// The API sends UTC timestamps without a "Z"; add it so browsers show local time.
function toIsoDate(value) {
  if (!value) return "";
  const text = String(value);
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text}Z`;
}

/** Convert one order from GET /api/orders into the shape the order pages use. */
export function normalizeApiOrder(order = {}) {
  const orderId = String(order.order_id ?? order.id ?? "");
  const date = toIsoDate(order.created_at);

  const address = {
    name: order.customer_name || "",
    phone: order.phone || "",
    address: order.address || "",
    street: order.address || "",
    city: order.city || "",
    state: order.state || "",
    pincode: order.pincode || "",
  };

  const items = (order.items || []).map((item) => ({
    id: item.product_id,
    product_id: item.product_id,
    name: item.product_name,
    title: item.product_name,
    image: getProductImage(item.image || "", item.product_name, ""),
    price: Number(item.price) || 0,
    discountedPrice: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    total: Number(item.total) || 0,
  }));

  return {
    id: orderId,
    orderId,
    order_id: orderId,
    dbId: order.id,
    status: order.status || "Order Confirmed",
    date,
    orderDate: date,
    createdAt: date,
    items,
    subtotal: Number(order.product_amount) || 0,
    discount: Number(order.discount) || 0,
    deliveryCharge: Number(order.delivery_charge) || 0,
    tax: Number(order.tax_amount) || 0,
    total: Number(order.total_amount) || 0,
    totalAmount: Number(order.total_amount) || 0,
    paymentMethodCode: order.payment_method,
    paymentMethod: PAYMENT_LABELS[order.payment_method] || order.payment_method || "",
    paymentStatus: order.payment_status || "Pending",
    deliveryType: DELIVERY_LABELS[order.delivery_type] || order.delivery_type || "",
    customerName: order.customer_name || "",
    customer: order.customer_name || "",
    address,
    deliveryAddress: address,
    cancelReason: order.cancellation_reason || "",
    cancelledAt: toIsoDate(order.cancelled_at),
  };
}

/**
 * Load the logged-in user's orders from the backend and store them in the
 * "orders" cache the order pages read. Never throws.
 * Returns the orders, or null when not logged in / the request failed.
 */
export async function syncOrdersFromServer() {
  try {
    if (!getStoredAccessToken()) return null;
    const list = await getOrders();
    const orders = Array.isArray(list) ? list.map(normalizeApiOrder) : [];
    localStorage.setItem("orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("ordersUpdated"));
    return orders;
  } catch (error) {
    console.error("Unable to load orders from the server:", error);
    return null;
  }
}
