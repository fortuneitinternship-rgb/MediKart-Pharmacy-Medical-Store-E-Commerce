import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000";

const checkoutApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT authentication
const getAuthConfig = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  return {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  };
};

// Get cart items from backend
export const getCheckoutCart = async () => {
  const response = await checkoutApi.get(
    "/api/cart",
    getAuthConfig()
  );

  return response.data;
};

// Save delivery address
export const saveCheckoutAddress = async (address) => {
  const response = await checkoutApi.post(
    "/api/addresses",
    {
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    getAuthConfig()
  );

  return response.data;
};

// Place order
export const createCheckoutOrder = async (orderData) => {
  const response = await checkoutApi.post(
    "/api/orders",
    orderData,
    getAuthConfig()
  );

  return response.data;
};

// Get order details
export const getCheckoutOrder = async (orderId) => {
  const response = await checkoutApi.get(
    `/api/orders/${encodeURIComponent(orderId)}`,
    getAuthConfig()
  );

  return response.data;
};

export default checkoutApi;
