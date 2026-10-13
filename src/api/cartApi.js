// src/api/cartApi.js

import axios from "axios";

const API_URL =
    process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const CART_URL = `${API_URL}/api/cart`;

/* Get authentication token */
export const getCartToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

/* Axios request configuration */
const getConfig = () => {
    const token = getCartToken();

    return {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
};

/* Normalize cart item data */
export const normalizeCartItem = (item) => {
    const product = item.product || {};

    const price = Number(
        item.price ??
        item.unit_price ??
        product.price ??
        0
    );

    const discountedPrice = Number(
        item.discountedPrice ??
        item.discount_price ??
        product.discount_price ??
        price
    );

    return {
        ...item,
        id: item.id,
        product_id:
            item.product_id ??
            item.productId ??
            product.id ??
            null,
        name: item.name || product.name || "Product",
        quantity: Math.max(1, Number(item.quantity) || 1),
        price,
        discountedPrice,
        image:
            item.image ||
            item.image_url ||
            product.image ||
            product.image_url ||
            "",
        category:
            item.category ||
            product.category ||
            "",
    };
};

/* GET: Fetch cart */
export const getCart = async () => {
    const response = await axios.get(CART_URL, getConfig());

    const data = response.data;

    const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.cart_items)
                ? data.cart_items
                : [];

    return {
        ...(!Array.isArray(data) && data && typeof data === "object"
            ? data
            : {}),
        items: items.map(normalizeCartItem),
    };
};

/* PUT: Update item quantity */
export const updateCartItem = async (id, quantity) => {
    if (id === undefined || id === null) {
        throw new Error("Cart item ID is missing.");
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        throw new Error("Quantity must be at least 1.");
    }

    return axios.put(
        `${CART_URL}/${encodeURIComponent(id)}`,
        { quantity: Number(quantity) },
        getConfig()
    );
};

/* DELETE: Remove cart item */
export const removeCartItem = async (id) => {
    if (id === undefined || id === null) {
        throw new Error("Cart item ID is missing.");
    }

    return axios.delete(
        `${CART_URL}/${encodeURIComponent(id)}`,
        getConfig()
    );
};

/* Read FastAPI or Axios error messages */
export const getCartErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
        return detail
            .map((item) => item.msg || "Invalid request")
            .join(", ");
    }

    if (typeof detail === "string") {
        return detail;
    }

    if (typeof error?.response?.data?.message === "string") {
        return error.response.data.message;
    }

    if (error?.response?.status === 401) {
        return "Your session has expired. Please log in again.";
    }

    if (error?.message && !error.response) {
        return "Unable to connect to the server. Check that FastAPI is running.";
    }

    return error?.message || "Something went wrong with your cart.";
};
