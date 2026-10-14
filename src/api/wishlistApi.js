import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const wishlistApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Get the logged-in user's token
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

// Get wishlist items
export const getWishlist = async () => {
    const response = await wishlistApi.get(
        "/api/wishlist",
        getAuthConfig()
    );

    return response.data;
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
    const response = await wishlistApi.post(
        "/api/wishlist",
        { product_id: productId },
        getAuthConfig()
    );

    return response.data;
};

// Remove product from wishlist
export const removeWishlistItem = async (productId) => {
    const response = await wishlistApi.delete(
        `/api/wishlist/${productId}`,
        getAuthConfig()
    );

    return response.data;
};

// Move product to cart
export const moveWishlistItemToCart = async (productId) => {
    const response = await wishlistApi.post(
        `/api/cart/items`,
        {
            product_id: productId,
            quantity: 1,
        },
        getAuthConfig()
    );

    return response.data;
};

export default wishlistApi;
