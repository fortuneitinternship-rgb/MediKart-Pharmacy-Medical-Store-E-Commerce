
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const checkoutApi = axios.create({
  baseURL: `${API_BASE_URL}/api/checkout`,
  headers: {
    "Content-Type": "application/json",
  },
});

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

checkoutApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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

export default checkoutApi;
