
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// Change these paths to match your FastAPI backend.
const CART_ENDPOINT = "/api/cart";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

// Get the current cart from the backend.
export async function getCart() {
  return request(CART_ENDPOINT);
}

// Add a product to the backend cart.
export async function addToCart(productId, quantity = 1) {
  return request(CART_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });
}

// Update the quantity of a cart item.
// itemId must be the cart item's ID, if that is what your API expects.
export async function updateCartItem(itemId, quantity) {
  return request(`${CART_ENDPOINT}/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

// Remove a cart item from the backend.
export async function removeCartItem(itemId) {
  return request(`${CART_ENDPOINT}/${itemId}`, {
    method: "DELETE",
  });
}

// Clear the entire backend cart, if your API supports this endpoint.
export async function clearCart() {
  return request(CART_ENDPOINT, {
    method: "DELETE",
  });
}
