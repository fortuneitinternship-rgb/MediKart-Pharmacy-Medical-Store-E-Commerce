import axios from "axios";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const CART_URL = `${API_BASE_URL}/api/cart`;

export function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getAuthConfig() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please log in to manage your server cart.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

export function normalizeCartItem(item = {}) {
  const product = item.product || {};

  return {
    ...item,
    id: item.id ?? item.cart_item_id ?? item.cartItemId ?? null,
    product_id: item.product_id ?? item.productId ?? product.id ?? null,
    name: item.name ?? product.name ?? item.title ?? "Product",
    price: Number(
      item.price ?? item.unit_price ?? product.price ?? 0
    ),
    discountedPrice: Number(
      item.discountedPrice ??
        item.discounted_price ??
        item.discount_price ??
        product.discounted_price ??
        product.discount_price ??
        item.price ??
        item.unit_price ??
        product.price ??
        0
    ),
    quantity: Math.max(1, Number(item.quantity) || 1),
    image:
      item.image ??
      item.image_url ??
      product.image ??
      product.image_url ??
      "",
    category: item.category ?? product.category ?? "",
  };
}

export function getCartErrorMessage(error) {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;

  if (status === 401) {
    return "Please log in again. Your session is missing or expired.";
  }

  if (status === 403) {
    return "You are not authorized to change this cart.";
  }

  if (status === 404) {
    return "Cart item not found. Refresh the cart and try again.";
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return error?.message || "Something went wrong. Please try again.";
}

// GET /api/cart
export async function getCart() {
  const response = await axios.get(CART_URL, getAuthConfig());
  const data = response.data;

  const items = Array.isArray(data)
    ? data
    : data?.items ?? data?.cart_items ?? data?.cart ?? [];

  if (!Array.isArray(items)) {
    throw new Error("Unexpected response from the cart API.");
  }

  return items.map((item) => ({
    ...normalizeCartItem(item),
    _serverItem: true,
  }));
}

// POST /api/cart
export async function addToCart(productId, quantity = 1) {
  if (productId == null) {
    throw new Error("Product ID is required.");
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const response = await axios.post(
    CART_URL,
    {
      product_id: productId,
      quantity: parsedQuantity,
    },
    getAuthConfig()
  );

  return response.data;
}

// PUT /api/cart/{cart_item_id}
export async function updateCartItem(cartItemId, quantity) {
  if (cartItemId == null) {
    throw new Error("Cart item ID is missing.");
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const response = await axios.put(
    `${CART_URL}/${encodeURIComponent(cartItemId)}`,
    { quantity: parsedQuantity },
    getAuthConfig()
  );

  return response.data;
}

// DELETE /api/cart/{cart_item_id}
export async function removeCartItem(cartItemId) {
  if (cartItemId == null) {
    throw new Error("Cart item ID is missing.");
  }

  const response = await axios.delete(
    `${CART_URL}/${encodeURIComponent(cartItemId)}`,
    getAuthConfig()
  );

  return response.data;
}

const cartApi = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  normalizeCartItem,
  getCartErrorMessage,
  getAccessToken,
};

export default cartApi;
