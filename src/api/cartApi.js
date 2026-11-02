
const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const CART_URL = `${API_BASE_URL}/api/cart`;

// -------------------- AUTH TOKEN --------------------

export function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getHeaders() {
  const token = getAccessToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// -------------------- API RESPONSE --------------------

async function handleResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail
          .map((item) => item.msg || String(item))
          .join(", ")
      : data.detail;
    const error = new Error(
      detail || data.message || `Request failed (${response.status})`
    );

    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return data;
}

// -------------------- NORMALIZE CART ITEM --------------------

export function normalizeCartItem(item) {
  const productId = item.product_id ?? item.productId ?? item.id;

  // Server cart row ID is different from the product ID.
  const cartItemId =
    item.cart_item_id ??
    item.cartItemId ??
    item.id;

  const price = Number(
    item.discounted_price ??
    item.discount_price ??
    item.discountedPrice ??
    item.price ??
    0
  );

  return {
    ...item,

    // Use cart row ID for update/delete.
    id: cartItemId,

    // Keep product ID separately for checkout.
    product_id: Number(productId),

    name: item.name || item.title || "Healthcare Product",
    title: item.title || item.name || "Healthcare Product",
    brand: item.brand || "",
    category: item.category || "",

    price,
    discountedPrice: price,

    image:
      item.image ||
      item.image_url ||
      "",

    quantity: Math.max(1, Number(item.quantity) || 1),

    // Identifies items returned by the server.
    _serverItem: Boolean(
      item.cart_item_id ||
      item.cartItemId ||
      (item.id != null && item.product_id != null)
    ),
  };
}

// -------------------- GET CART --------------------

export async function getCart() {
  const response = await fetch(CART_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  const items = Array.isArray(data)
    ? data
    : data.items || data.cart_items || [];

  return items.map(normalizeCartItem);
}

// -------------------- ADD TO CART --------------------

export async function addCartItem(productId, quantity = 1) {
  const normalizedProductId = Number(productId);
  const normalizedQuantity = Number(quantity);

  if (
    !Number.isInteger(normalizedProductId) ||
    normalizedProductId < 1 ||
    !Number.isInteger(normalizedQuantity) ||
    normalizedQuantity < 1
  ) {
    throw new Error("Valid product ID and quantity are required.");
  }

  const response = await fetch(CART_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      product_id: normalizedProductId,
      quantity: normalizedQuantity,
    }),
  });

  return handleResponse(response);
}

export async function addProductToCart(product, quantity = 1) {
  if (!product || product.id == null) {
    throw new Error("This product has no database product ID.");
  }

  if (!getAccessToken()) {
    throw new Error("Please log in before adding products to your cart.");
  }

  const result = await addCartItem(product.id, quantity);
  window.dispatchEvent(new Event("cartUpdated"));
  return result;
}

// -------------------- UPDATE CART QUANTITY --------------------

export async function updateCartItem(cartItemId, quantity) {
  if (!cartItemId || Number(quantity) < 1) {
    throw new Error("Valid cart item ID and quantity are required.");
  }

  const response = await fetch(
    `${CART_URL}/${encodeURIComponent(cartItemId)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        quantity: Number(quantity),
      }),
    }
  );

  return handleResponse(response);
}

// -------------------- REMOVE CART ITEM --------------------

export async function removeCartItem(cartItemId) {
  if (!cartItemId) {
    throw new Error("Cart item ID is required.");
  }

  const response = await fetch(
    `${CART_URL}/${encodeURIComponent(cartItemId)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

// -------------------- CLEAR CART --------------------

export async function clearCart() {
  const response = await fetch(CART_URL, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(response);
}

// -------------------- ERROR MESSAGE --------------------

export function getCartErrorMessage(error) {
  if (error?.response?.status === 401) {
    return (
      error?.response?.data?.detail ||
      "Your login session is no longer valid. Please log in again."
    );
  }

  if (error?.response?.status === 404) {
    return "Cart item or product was not found.";
  }

  if (error?.response?.status === 422) {
    const detail = error?.response?.data?.detail;
    return Array.isArray(detail)
      ? detail.map((item) => item.msg || String(item)).join(", ")
      : detail || "Please check the cart information.";
  }

  return (
    error?.response?.data?.detail ||
    error?.message ||
    "Unable to process your cart request. Please try again."
  );
}
