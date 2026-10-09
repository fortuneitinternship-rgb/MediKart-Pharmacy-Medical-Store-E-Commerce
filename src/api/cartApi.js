import axios from "axios";

/* ============================================================
   FASTAPI CART API CONFIGURATION
============================================================ */

const API_URL = (
    process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const CART_URL = `${API_URL}/api/cart`;

/* ============================================================
   AUTH TOKEN
============================================================ */

const getToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

/* ============================================================
   AXIOS INSTANCE
============================================================ */

const cartApi = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

cartApi.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/* ============================================================
   GET CART
   GET /api/cart
============================================================ */

export const getCart = () => {
    return cartApi.get(CART_URL);
};

/* ============================================================
   ADD PRODUCT TO CART
   POST /api/cart
============================================================ */

export const addToCart = (productId, quantity = 1) => {
    return cartApi.post(CART_URL, {
        product_id: productId,
        quantity,
    });
};

/* ============================================================
   UPDATE CART QUANTITY
   PUT /api/cart/{cartItemId}
============================================================ */

export const updateCartItem = (cartItemId, quantity) => {
    return cartApi.put(`${CART_URL}/${cartItemId}`, {
        quantity,
    });
};

/* ============================================================
   REMOVE CART ITEM
   DELETE /api/cart/{cartItemId}
============================================================ */

export const removeCartItem = (cartItemId) => {
    return cartApi.delete(`${CART_URL}/${cartItemId}`);
};

/* ============================================================
   ERROR MESSAGE
============================================================ */

export const getCartErrorMessage = (
    error,
    fallback = "Cart request failed."
) => {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg).join(", ");
    }

    if (typeof detail === "string") {
        return detail;
    }

    return (
        error.response?.data?.message ||
        error.message ||
        fallback
    );
};

export default cartApi;
