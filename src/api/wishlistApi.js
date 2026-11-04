import axios from "axios";
import { addProductToCart } from "./cartApi";
import {
    clearAuthSession,
    getStoredAccessToken,
} from "../services/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const wishlistApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const LOCAL_WISHLIST_KEY = "wishlist";
const PENDING_WISHLIST_IMPORT_KEY = "pendingWishlistImport";
let localWishlistFallbackIds = new Set();

const createMigrationId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `migration-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getPendingImport = (items) => {
    const stored = localStorage.getItem(PENDING_WISHLIST_IMPORT_KEY);
    if (stored) {
        const pending = JSON.parse(stored);
        if (
            typeof pending?.migration_id !== "string" ||
            !Array.isArray(pending.items)
        ) {
            throw new Error("Saved wishlist import data is invalid.");
        }
        return pending;
    }

    const snapshot = items.map((item) => ({
        product_id: Number(item.product_id ?? item.id),
    }));
    if (!snapshot.length) {
        return null;
    }

    const pending = { migration_id: createMigrationId(), items: snapshot };
    localStorage.setItem(PENDING_WISHLIST_IMPORT_KEY, JSON.stringify(pending));
    return pending;
};

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
    const token = getStoredAccessToken();

    return {
        headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
    };
};

wishlistApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthSession();
        }

        return Promise.reject(error);
    }
);

// Get wishlist items
export const getWishlist = async () => {
    if (!getAuthConfig().headers.Authorization) {
        localWishlistFallbackIds = new Set();
        return getLocalWishlist();
    }

    try {
        await syncLocalWishlist();
    } catch (error) {
        if (error.response?.status === 401) {
            throw error;
        }
        console.error("Unable to migrate local wishlist items:", error);
    }

    const response = await wishlistApi.get(
        "/api/wishlist",
        getAuthConfig()
    );

    const items = Array.isArray(response.data)
        ? response.data
        : response.data.items || response.data.wishlist || [];
    const serverItems = items.map(normalizeWishlistItem);
    const serverProductIds = new Set(
        serverItems.map((item) => Number(item.product_id))
    );
    const localItems = getLocalWishlist()
        .filter(
            (item) =>
                !serverProductIds.has(Number(item.product_id ?? item.id))
        )
        .map((item) => ({
            ...normalizeWishlistItem(item),
            _localItem: true,
        }));
    localWishlistFallbackIds = new Set(
        localItems.map((item) => Number(item.product_id))
    );
    return [...serverItems, ...localItems];
};

export const syncLocalWishlist = async () => {
    if (!getAuthConfig().headers.Authorization) {
        return null;
    }

    const pending = getPendingImport(getLocalWishlist());
    if (!pending) {
        return null;
    }

    const response = await wishlistApi.post(
        "/api/wishlist/import",
        pending,
        getAuthConfig()
    );
    const importedIds = new Set(
        pending.items.map((item) => Number(item.product_id))
    );
    saveLocalWishlist(
        getLocalWishlist().filter(
            (item) => !importedIds.has(Number(item.product_id ?? item.id))
        )
    );
    localStorage.removeItem(PENDING_WISHLIST_IMPORT_KEY);
    localWishlistFallbackIds = new Set();
    window.dispatchEvent(new Event("wishlistUpdated"));
    return response.data;
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

    await syncLocalWishlist();
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

    if (localWishlistFallbackIds.has(Number(productId))) {
        const wishlist = getLocalWishlist().filter(
            (item) => Number(item.id ?? item.product_id) !== Number(productId)
        );
        saveLocalWishlist(wishlist);
        const pending = localStorage.getItem(PENDING_WISHLIST_IMPORT_KEY);
        if (pending) {
            const pendingImport = JSON.parse(pending);
            pendingImport.items = pendingImport.items.filter(
                (item) => Number(item.product_id) !== Number(productId)
            );
            if (pendingImport.items.length) {
                localStorage.setItem(
                    PENDING_WISHLIST_IMPORT_KEY,
                    JSON.stringify(pendingImport)
                );
            } else {
                localStorage.removeItem(PENDING_WISHLIST_IMPORT_KEY);
            }
        }
        localWishlistFallbackIds.delete(Number(productId));
        window.dispatchEvent(new Event("wishlistUpdated"));
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
