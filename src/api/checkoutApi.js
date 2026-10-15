// src/api/CheckoutApi.js

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

function getAuthHeaders() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before placing your order.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/api/orders/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  return handleResponse(response);
}

export async function getMyOrders() {
  const response = await fetch(`${API_BASE_URL}/api/orders/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function getOrderById(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}
