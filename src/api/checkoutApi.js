
import axios from "axios";
import api, {
  clearAuthSession,
  getStoredAccessToken,
} from "../services/api";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const checkoutApi = axios.create({
  baseURL: `${API_BASE_URL}/api/checkout`,
  headers: {
    "Content-Type": "application/json",
  },
});

function getToken() {
  return getStoredAccessToken();
}

checkoutApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

checkoutApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(error);
  }
);

export async function getCheckoutCart() {
  const response = await checkoutApi.get("/cart");
  return response.data;
}

export async function saveCheckoutAddress(address) {
  const response = await checkoutApi.post("/address", address);
  return response.data;
}

export async function createCheckoutOrder(orderData) {
  const response = await checkoutApi.post("/orders", orderData);
  return response.data;
}

export async function getCheckoutConfig() {
  const response = await checkoutApi.get("/config");
  return response.data;
}

export async function validateCheckoutCoupon(code, orderAmount) {
  const response = await api.post("/api/coupons/validate", {
    code,
    order_amount: orderAmount,
  });
  return response.data;
}

export async function processCheckoutPayment(paymentData) {
  const response = await api.post("/api/payments/process", paymentData);
  return response.data;
}

export async function getPaymentConfig() {
  const response = await api.get("/api/payments/config");
  return response.data;
}

export async function createRazorpayOrder(orderId) {
  const response = await api.post("/api/payments/razorpay/order", {
    order_id: String(orderId),
  });
  return response.data;
}

export async function verifyRazorpayPayment(paymentData) {
  const response = await api.post("/api/payments/razorpay/verify", paymentData);
  return response.data;
}

export default checkoutApi;
