import axios from "axios";
import { addProductToCart } from "./cartApi";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const wishlistApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const LOCAL_WISHLIST_KEY = "wishlist";

const getLocalWishlist = () => {
    const items = JSON.parse(localStorage.getItem(LOCAL_WISHLIST_KEY) || "[]");
    return Array.isArray(items) ? items : [];
};

const saveLocalWishlist = (items) => {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
};

const normalizeWishlistItem = (item) => {
    const product = item.product || item;
    return {
        ...product,
        id: Number(product.id ?? item.product_id ?? item.id),
        wishlist_id: item.id,
        product_id: Number(item.product_id ?? product.id ?? item.id),
    };
};

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
    if (!getAuthConfig().headers.Authorization) {
        return getLocalWishlist();
    }

    const response = await wishlistApi.get(
        "/api/wishlist",
        getAuthConfig()
    );

    const items = Array.isArray(response.data)
        ? response.data
        : response.data.items || response.data.wishlist || [];
    return items.map(normalizeWishlistItem);
};

// Add product to wishlist
export const addToWishlist = async (product) => {
    const item = typeof product === "object" ? product : { id: product };
    if (item.id == null) {
        throw new Error("This product has no database product ID.");
    }

    if (!getAuthConfig().headers.Authorization) {
        const wishlist = getLocalWishlist();
        if (!wishlist.some((saved) => Number(saved.id) === Number(item.id))) {
            wishlist.push(item);
            saveLocalWishlist(wishlist);
        }
        return wishlist;
    }

    const response = await wishlistApi.post(
        "/api/wishlist",
        { product_id: item.id },
        getAuthConfig()
    );

    return response.data;
};

// Remove product from wishlist
export const removeWishlistItem = async (productId) => {
    if (!getAuthConfig().headers.Authorization) {
        const wishlist = getLocalWishlist().filter(
            (item) => Number(item.id ?? item.product_id) !== Number(productId)
        );
        saveLocalWishlist(wishlist);
        return wishlist;
    }

    const response = await wishlistApi.delete(
        `/api/wishlist/${productId}`,
        getAuthConfig()
    );

    return response.data;
};

// Move product to cart
export const moveWishlistItemToCart = async (productId) => {
    if (!getAuthConfig().headers.Authorization) {
        const product = getLocalWishlist().find(
            (item) => Number(item.id ?? item.product_id) === Number(productId)
        );
        if (!product) {
            throw new Error("This product is no longer in your wishlist.");
        }
        return addProductToCart(product);
    }

    const response = await wishlistApi.post(
        `/api/cart`,
        {
            product_id: productId,
            quantity: 1,
        },
        getAuthConfig()
    );

    return response.data;
};

export default wishlistApi;
