
import { clearAuthSession, getStoredAccessToken } from "../services/api";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const CART_URL = `${API_BASE_URL}/api/cart`;
const LOCAL_CART_KEY = "cart";
const PENDING_CART_IMPORT_KEY = "pendingCartImport";

function createMigrationId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `migration-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getPendingImport(items) {
  const stored = localStorage.getItem(PENDING_CART_IMPORT_KEY);
  if (stored) {
    const pending = JSON.parse(stored);
    if (
      typeof pending?.migration_id !== "string" ||
      !Array.isArray(pending.items)
    ) {
      throw new Error("Saved cart import data is invalid.");
    }
    return pending;
  }

  const snapshot = items.map((item) => ({
    product_id: Number(item.product_id),
    quantity: Number(item.quantity),
  }));
  if (!snapshot.length) {
    return null;
  }

  const pending = { migration_id: createMigrationId(), items: snapshot };
  localStorage.setItem(PENDING_CART_IMPORT_KEY, JSON.stringify(pending));
  return pending;
}

function removeImportedCartItems(importedItems) {
  const remainingItems = getLocalCart();

  importedItems.forEach(({ product_id, quantity }) => {
    let remainingQuantity = Number(quantity);
    for (
      let index = 0;
      index < remainingItems.length && remainingQuantity > 0;
      index += 1
    ) {
      const item = remainingItems[index];
      if (Number(item.product_id) !== Number(product_id)) {
        continue;
      }

      const itemQuantity = Number(item.quantity) || 1;
      const removedQuantity = Math.min(itemQuantity, remainingQuantity);
      remainingQuantity -= removedQuantity;
      if (removedQuantity === itemQuantity) {
        remainingItems.splice(index, 1);
        index -= 1;
      } else {
        remainingItems[index] = {
          ...item,
          quantity: itemQuantity - removedQuantity,
        };
      }
    }
  });

  saveLocalCart(remainingItems);
}

function updatePendingCartImport(productId, quantity) {
  const stored = localStorage.getItem(PENDING_CART_IMPORT_KEY);
  if (!stored) {
    return;
  }

  const pending = JSON.parse(stored);
  pending.items = pending.items.filter(
    (item) => Number(item.product_id) !== Number(productId)
  );
  if (quantity > 0) {
    pending.items.push({
      product_id: Number(productId),
      quantity: Number(quantity),
    });
  }

  if (pending.items.length) {
    localStorage.setItem(PENDING_CART_IMPORT_KEY, JSON.stringify(pending));
  } else {
    localStorage.removeItem(PENDING_CART_IMPORT_KEY);
  }
}

function getLocalCart() {
  const items = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
  return Array.isArray(items) ? items.map(normalizeCartItem) : [];
}

function saveLocalCart(items) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

// -------------------- AUTH TOKEN --------------------

export function getAccessToken() {
  return getStoredAccessToken();
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
    if (response.status === 401) {
      clearAuthSession();
    }

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
  if (!getAccessToken()) {
    return getLocalCart();
  }

  try {
    await syncLocalCart();
  } catch (error) {
    if (error.response?.status === 401) {
      throw error;
    }
    console.error("Unable to migrate local cart items:", error);
  }

  const response = await fetch(CART_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  const items = Array.isArray(data)
    ? data
    : data.items || data.cart_items || [];

  const serverItems = items.map(normalizeCartItem);
  const serverProductIds = new Set(
    serverItems.map((item) => Number(item.product_id))
  );
  const localItems = getLocalCart()
    .filter((item) => !serverProductIds.has(Number(item.product_id)))
    .map((item, index) => ({
      ...normalizeCartItem(item),
      id: `local-${item.product_id}-${index}`,
      _serverItem: false,
    }));

  return [...serverItems, ...localItems];
}

export async function syncLocalCart() {
  if (!getAccessToken()) {
    return null;
  }

  const pending = getPendingImport(getLocalCart());
  if (!pending) {
    return null;
  }

  const response = await fetch(`${CART_URL}/import`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(pending),
  });
  const result = await handleResponse(response);

  removeImportedCartItems(pending.items);
  localStorage.removeItem(PENDING_CART_IMPORT_KEY);
  window.dispatchEvent(new Event("cartUpdated"));
  return result;
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
    const cart = getLocalCart();
    const existing = cart.find(
      (item) => Number(item.product_id) === Number(product.id)
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.push(
        normalizeCartItem({
          ...product,
          id: product.id,
          product_id: product.id,
          quantity,
        })
      );
    }

    saveLocalCart(cart);
    window.dispatchEvent(new Event("cartUpdated"));
    return cart;
  }

  await syncLocalCart();
  const result = await addCartItem(product.id, quantity);
  window.dispatchEvent(new Event("cartUpdated"));
  return result;
}

// -------------------- UPDATE CART QUANTITY --------------------

export async function updateCartItem(cartItemId, quantity) {
  if (!cartItemId || Number(quantity) < 1) {
    throw new Error("Valid cart item ID and quantity are required.");
  }

  const localItemId = String(cartItemId).startsWith("local-")
    ? Number(String(cartItemId).split("-")[1])
    : null;
  if (!getAccessToken() || localItemId) {
    const cart = getLocalCart().map((item) =>
      Number(item.product_id) === (localItemId || Number(cartItemId))
        ? { ...item, quantity: Number(quantity) }
        : item
    );
    saveLocalCart(cart);
    if (localItemId) {
      updatePendingCartImport(localItemId, quantity);
    }
    window.dispatchEvent(new Event("cartUpdated"));
    return cart;
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

  const localItemId = String(cartItemId).startsWith("local-")
    ? Number(String(cartItemId).split("-")[1])
    : null;
  if (!getAccessToken() || localItemId) {
    const cart = getLocalCart().filter(
      (item) =>
        Number(item.product_id) !== (localItemId || Number(cartItemId))
    );
    saveLocalCart(cart);
    if (localItemId) {
      updatePendingCartImport(localItemId, 0);
    }
    window.dispatchEvent(new Event("cartUpdated"));
    return cart;
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
  if (!getAccessToken()) {
    saveLocalCart([]);
    localStorage.removeItem(PENDING_CART_IMPORT_KEY);
    window.dispatchEvent(new Event("cartUpdated"));
    return [];
  }

  const response = await fetch(CART_URL, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const result = await handleResponse(response);
  saveLocalCart([]);
  localStorage.removeItem(PENDING_CART_IMPORT_KEY);
  window.dispatchEvent(new Event("cartUpdated"));
  return result;
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
