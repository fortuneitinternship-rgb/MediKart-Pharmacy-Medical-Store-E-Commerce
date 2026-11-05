
import axios from "axios";

import {
  getWishlist,
  syncLocalWishlist,
  addToWishlist,
  removeWishlistItem,
  moveWishlistItemToCart,
} from "./wishlistApi";

import { addProductToCart } from "./cartApi";

import {
  clearAuthSession,
  getStoredAccessToken,
} from "../services/api";

/* =====================================================
   MOCKS
===================================================== */

jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  })),
}));

jest.mock("./cartApi", () => ({
  addProductToCart: jest.fn(),
}));

jest.mock("../services/api", () => ({
  clearAuthSession: jest.fn(),
  getStoredAccessToken: jest.fn(),
}));

/* =====================================================
   AXIOS INSTANCE
===================================================== */

const mockWishlistApi = axios.create.mock.results[0].value;

/* =====================================================
   GENERIC TEST DATA
===================================================== */

const sampleItems = [
  {
    id: 101,
    name: "Sample Item One",
    price: 100,
  },
  {
    id: 102,
    name: "Sample Item Two",
    price: 200,
  },
];

const sampleServerItems = [
  {
    id: 501,
    product_id: 101,
    product: {
      id: 101,
      name: "Sample Item One",
      price: 100,
    },
  },
  {
    id: 502,
    product_id: 102,
    product: {
      id: 102,
      name: "Sample Item Two",
      price: 200,
    },
  },
];

/* =====================================================
   LOCAL STORAGE KEYS
===================================================== */

const LOCAL_WISHLIST_KEY = "wishlist";
const PENDING_WISHLIST_IMPORT_KEY = "pendingWishlistImport";

/* =====================================================
   HELPERS
===================================================== */

const saveLocalWishlist = (items) => {
  localStorage.setItem(
    LOCAL_WISHLIST_KEY,
    JSON.stringify(items)
  );
};

const readLocalWishlist = () => {
  return JSON.parse(
    localStorage.getItem(LOCAL_WISHLIST_KEY) || "[]"
  );
};

const setAuthenticated = () => {
  getStoredAccessToken.mockReturnValue("mock-access-token");
};

const setUnauthenticated = () => {
  getStoredAccessToken.mockReturnValue(null);
};

/* =====================================================
   SETUP
===================================================== */

beforeEach(async () => {
  jest.clearAllMocks();

  localStorage.clear();

  mockWishlistApi.get.mockReset();
  mockWishlistApi.post.mockReset();
  mockWishlistApi.delete.mockReset();

  getStoredAccessToken.mockReturnValue(null);

  addProductToCart.mockResolvedValue({
    message: "Added to cart",
  });

  // Reset module-level local fallback tracking.
  await getWishlist();
});

/* =====================================================
   1. API CONFIGURATION
===================================================== */

describe("Wishlist API configuration", () => {
  test("creates Axios instance", () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL:
        process.env.REACT_APP_API_URL ||
        "http://127.0.0.1:8000",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  test("registers response interceptor", () => {
    expect(
      mockWishlistApi.interceptors.response.use
    ).toHaveBeenCalledTimes(1);
  });

  test("returns successful response from interceptor", () => {
    const [successHandler] =
      mockWishlistApi.interceptors.response.use.mock.calls[0];

    const response = {
      data: {
        message: "Success",
      },
    };

    expect(successHandler(response)).toBe(response);
  });

  test("clears authentication session when interceptor receives 401", async () => {
    const [, errorHandler] =
      mockWishlistApi.interceptors.response.use.mock.calls[0];

    const error = {
      response: {
        status: 401,
      },
    };

    await expect(errorHandler(error)).rejects.toBe(error);

    expect(clearAuthSession).toHaveBeenCalledTimes(1);
  });

  test("does not clear authentication session for non-401 errors", async () => {
    const [, errorHandler] =
      mockWishlistApi.interceptors.response.use.mock.calls[0];

    const error = {
      response: {
        status: 500,
      },
    };

    await expect(errorHandler(error)).rejects.toBe(error);

    expect(clearAuthSession).not.toHaveBeenCalled();
  });
});

/* =====================================================
   2. GET WISHLIST
===================================================== */

describe("getWishlist", () => {
  test("returns empty array when local wishlist is empty and user is logged out", async () => {
    setUnauthenticated();

    const result = await getWishlist();

    expect(result).toEqual([]);
    expect(mockWishlistApi.get).not.toHaveBeenCalled();
  });

  test("returns local wishlist when user is logged out", async () => {
    setUnauthenticated();
    saveLocalWishlist(sampleItems);

    const result = await getWishlist();

    expect(result).toEqual(sampleItems);
    expect(mockWishlistApi.get).not.toHaveBeenCalled();
  });

  test("does not modify local wishlist when retrieving it", async () => {
    setUnauthenticated();
    saveLocalWishlist(sampleItems);

    await getWishlist();

    expect(readLocalWishlist()).toEqual(sampleItems);
  });

  test("fetches wishlist from server when user is authenticated", async () => {
    setAuthenticated();

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: sampleServerItems,
      },
    });

    const result = await getWishlist();

    expect(mockWishlistApi.get).toHaveBeenCalledWith(
      "/api/wishlist",
      {
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      }
    );

    expect(result).toHaveLength(2);
  });

  test("normalizes server wishlist items", async () => {
    setAuthenticated();

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: sampleServerItems,
      },
    });

    const result = await getWishlist();

    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 101,
        wishlist_id: 501,
        product_id: 101,
        name: "Sample Item One",
      })
    );
  });

  test("supports direct array response from server", async () => {
    setAuthenticated();

    mockWishlistApi.get.mockResolvedValue({
      data: sampleServerItems,
    });

    const result = await getWishlist();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(101);
  });

  test("supports wishlist property in server response", async () => {
    setAuthenticated();

    mockWishlistApi.get.mockResolvedValue({
      data: {
        wishlist: sampleServerItems,
      },
    });

    const result = await getWishlist();

    expect(result).toHaveLength(2);
  });

  test("merges local wishlist items not present on server", async () => {
    setAuthenticated();

    saveLocalWishlist([
      {
        id: 101,
        name: "Sample Item One",
      },
      {
        id: 103,
        name: "Sample Item Three",
      },
    ]);

    mockWishlistApi.post.mockRejectedValue(
      new Error("Import unavailable")
    );

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: [sampleServerItems[0]],
      },
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await getWishlist();

    expect(result).toHaveLength(2);

    expect(
      result.some((item) => item.product_id === 101)
    ).toBe(true);

    expect(
      result.some(
        (item) =>
          item.product_id === 103 &&
          item._localItem === true
      )
    ).toBe(true);

    consoleSpy.mockRestore();
  });

  test("does not duplicate local items already present on server", async () => {
    setAuthenticated();

    saveLocalWishlist([
      {
        id: 101,
        name: "Sample Item One",
      },
    ]);

    mockWishlistApi.post.mockRejectedValue(
      new Error("Import unavailable")
    );

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: [sampleServerItems[0]],
      },
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await getWishlist();

    expect(result).toHaveLength(1);

    consoleSpy.mockRestore();
  });

  test("throws error when server request fails", async () => {
    setAuthenticated();

    mockWishlistApi.get.mockRejectedValue(
      new Error("Server unavailable")
    );

    await expect(getWishlist()).rejects.toThrow(
      "Server unavailable"
    );
  });

  test("throws 401 error when local wishlist migration receives 401", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockRejectedValue({
      response: {
        status: 401,
      },
    });

    await expect(getWishlist()).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    expect(mockWishlistApi.get).not.toHaveBeenCalled();
  });
});

/* =====================================================
   3. SYNC LOCAL WISHLIST
===================================================== */

describe("syncLocalWishlist", () => {
  test("returns null when user is logged out", async () => {
    setUnauthenticated();

    saveLocalWishlist(sampleItems);

    const result = await syncLocalWishlist();

    expect(result).toBeNull();
    expect(mockWishlistApi.post).not.toHaveBeenCalled();
  });

  test("returns null when local wishlist is empty", async () => {
    setAuthenticated();

    const result = await syncLocalWishlist();

    expect(result).toBeNull();
    expect(mockWishlistApi.post).not.toHaveBeenCalled();
  });

  test("imports local wishlist items when user is authenticated", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Wishlist imported",
      },
    });

    const result = await syncLocalWishlist();

    expect(mockWishlistApi.post).toHaveBeenCalledWith(
      "/api/wishlist/import",
      expect.objectContaining({
        migration_id: expect.any(String),
        items: [
          { product_id: 101 },
          { product_id: 102 },
        ],
      }),
      {
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      }
    );

    expect(result).toEqual({
      message: "Wishlist imported",
    });
  });

  test("removes imported items from local storage after successful import", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Imported",
      },
    });

    await syncLocalWishlist();

    expect(readLocalWishlist()).toEqual([]);
  });

  test("removes pending import data after successful import", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Imported",
      },
    });

    await syncLocalWishlist();

    expect(
      localStorage.getItem(PENDING_WISHLIST_IMPORT_KEY)
    ).toBeNull();
  });

  test("saves pending import data before sending request", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockImplementation(() => {
      const pending = JSON.parse(
        localStorage.getItem(PENDING_WISHLIST_IMPORT_KEY)
      );

      expect(pending.items).toEqual([
        { product_id: 101 },
        { product_id: 102 },
      ]);

      return Promise.resolve({
        data: {
          message: "Imported",
        },
      });
    });

    await syncLocalWishlist();

    expect(mockWishlistApi.post).toHaveBeenCalledTimes(1);
  });

  test("keeps local wishlist when import request fails", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockRejectedValue(
      new Error("Import failed")
    );

    await expect(syncLocalWishlist()).rejects.toThrow(
      "Import failed"
    );

    expect(readLocalWishlist()).toEqual(sampleItems);
  });

  test("reuses existing pending migration data", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    const pending = {
      migration_id: "existing-migration",
      items: [
        { product_id: 101 },
        { product_id: 102 },
      ],
    };

    localStorage.setItem(
      PENDING_WISHLIST_IMPORT_KEY,
      JSON.stringify(pending)
    );

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Imported",
      },
    });

    await syncLocalWishlist();

    expect(mockWishlistApi.post).toHaveBeenCalledWith(
      "/api/wishlist/import",
      pending,
      expect.any(Object)
    );
  });

  test("throws error for invalid pending migration data", async () => {
    setAuthenticated();

    localStorage.setItem(
      PENDING_WISHLIST_IMPORT_KEY,
      JSON.stringify({
        migration_id: 123,
        items: "invalid",
      })
    );

    await expect(syncLocalWishlist()).rejects.toThrow(
      "Saved wishlist import data is invalid."
    );
  });

  test("dispatches wishlistUpdated after successful import", async () => {
    setAuthenticated();

    saveLocalWishlist(sampleItems);

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Imported",
      },
    });

    const eventHandler = jest.fn();

    window.addEventListener(
      "wishlistUpdated",
      eventHandler
    );

    await syncLocalWishlist();

    expect(eventHandler).toHaveBeenCalledTimes(1);

    window.removeEventListener(
      "wishlistUpdated",
      eventHandler
    );
  });
});

/* =====================================================
   4. ADD TO WISHLIST
===================================================== */

describe("addToWishlist", () => {
  test("adds item to local wishlist when user is logged out", async () => {
    setUnauthenticated();

    const result = await addToWishlist(sampleItems[0]);

    expect(result).toEqual([sampleItems[0]]);
    expect(readLocalWishlist()).toEqual([sampleItems[0]]);
  });

  test("does not add duplicate local wishlist items", async () => {
    setUnauthenticated();

    saveLocalWishlist([sampleItems[0]]);

    const result = await addToWishlist(sampleItems[0]);

    expect(result).toHaveLength(1);
  });

  test("accepts numeric item ID", async () => {
    setUnauthenticated();

    const result = await addToWishlist(103);

    expect(result).toEqual([
      {
        id: 103,
      },
    ]);
  });

  test("throws error when item has no ID", async () => {
    await expect(
      addToWishlist({
        name: "Sample Item",
      })
    ).rejects.toThrow(
      "This product has no database product ID."
    );
  });

  test("adds item to server wishlist when authenticated", async () => {
    setAuthenticated();

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Added",
      },
    });

    const result = await addToWishlist({
      id: 101,
      name: "Sample Item One",
    });

    expect(mockWishlistApi.post).toHaveBeenCalledWith(
      "/api/wishlist",
      {
        product_id: 101,
      },
      {
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      }
    );

    expect(result).toEqual({
      message: "Added",
    });
  });

  test("returns server error when adding item fails", async () => {
    setAuthenticated();

    mockWishlistApi.post.mockRejectedValue(
      new Error("Unable to add item")
    );

    await expect(
      addToWishlist({
        id: 101,
      })
    ).rejects.toThrow("Unable to add item");
  });
});

/* =====================================================
   5. REMOVE WISHLIST ITEM
===================================================== */

describe("removeWishlistItem", () => {
  test("removes item from local wishlist when logged out", async () => {
    setUnauthenticated();

    saveLocalWishlist(sampleItems);

    const result = await removeWishlistItem(101);

    expect(result).toEqual([sampleItems[1]]);
    expect(readLocalWishlist()).toEqual([sampleItems[1]]);
  });

  test("returns empty array when removing the only local item", async () => {
    setUnauthenticated();

    saveLocalWishlist([sampleItems[0]]);

    const result = await removeWishlistItem(101);

    expect(result).toEqual([]);
  });

  test("removes server wishlist item when authenticated", async () => {
    setAuthenticated();

    mockWishlistApi.delete.mockResolvedValue({
      data: {
        message: "Removed",
      },
    });

    const result = await removeWishlistItem(501);

    expect(mockWishlistApi.delete).toHaveBeenCalledWith(
      "/api/wishlist/501",
      {
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      }
    );

    expect(result).toEqual({
      message: "Removed",
    });
  });

  test("returns error when server removal fails", async () => {
    setAuthenticated();

    mockWishlistApi.delete.mockRejectedValue(
      new Error("Unable to remove item")
    );

    await expect(
      removeWishlistItem(501)
    ).rejects.toThrow("Unable to remove item");
  });

  test("removes local fallback item when authenticated", async () => {
    setAuthenticated();

    saveLocalWishlist([
      {
        id: 103,
        name: "Sample Item Three",
      },
    ]);

    mockWishlistApi.post.mockRejectedValue(
      new Error("Import unavailable")
    );

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: [],
      },
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await getWishlist();

    const result = await removeWishlistItem(103);

    expect(result).toEqual([]);
    expect(readLocalWishlist()).toEqual([]);
    expect(mockWishlistApi.delete).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("updates pending import when removing a local fallback item", async () => {
    setAuthenticated();

    saveLocalWishlist([
      {
        id: 103,
        name: "Sample Item Three",
      },
      {
        id: 104,
        name: "Sample Item Four",
      },
    ]);

    mockWishlistApi.post.mockRejectedValue(
      new Error("Import unavailable")
    );

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: [],
      },
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await getWishlist();

    await removeWishlistItem(103);

    const pending = JSON.parse(
      localStorage.getItem(PENDING_WISHLIST_IMPORT_KEY)
    );

    expect(pending.items).toEqual([
      {
        product_id: 104,
      },
    ]);

    consoleSpy.mockRestore();
  });

  test("dispatches wishlistUpdated after removing local fallback item", async () => {
    setAuthenticated();

    saveLocalWishlist([
      {
        id: 103,
        name: "Sample Item Three",
      },
    ]);

    mockWishlistApi.post.mockRejectedValue(
      new Error("Import unavailable")
    );

    mockWishlistApi.get.mockResolvedValue({
      data: {
        items: [],
      },
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await getWishlist();

    const eventHandler = jest.fn();

    window.addEventListener(
      "wishlistUpdated",
      eventHandler
    );

    await removeWishlistItem(103);

    expect(eventHandler).toHaveBeenCalled();

    window.removeEventListener(
      "wishlistUpdated",
      eventHandler
    );

    consoleSpy.mockRestore();
  });
});

/* =====================================================
   6. MOVE WISHLIST ITEM TO CART
===================================================== */

describe("moveWishlistItemToCart", () => {
  test("adds local wishlist item to cart when logged out", async () => {
    setUnauthenticated();

    saveLocalWishlist(sampleItems);

    await moveWishlistItemToCart(101);

    expect(addProductToCart).toHaveBeenCalledWith(
      sampleItems[0]
    );
  });

  test("throws error when local wishlist item does not exist", async () => {
    setUnauthenticated();

    saveLocalWishlist([]);

    await expect(
      moveWishlistItemToCart(999)
    ).rejects.toThrow(
      "This product is no longer in your wishlist."
    );

    expect(addProductToCart).not.toHaveBeenCalled();
  });

  test("sends authenticated cart request", async () => {
    setAuthenticated();

    mockWishlistApi.post.mockResolvedValue({
      data: {
        message: "Added to cart",
      },
    });

    const result = await moveWishlistItemToCart(101);

    expect(mockWishlistApi.post).toHaveBeenCalledWith(
      "/api/cart",
      {
        product_id: 101,
        quantity: 1,
      },
      {
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      }
    );

    expect(result).toEqual({
      message: "Added to cart",
    });
  });

  test("returns error when cart API fails", async () => {
    setAuthenticated();

    mockWishlistApi.post.mockRejectedValue(
      new Error("Unable to add to cart")
    );

    await expect(
      moveWishlistItemToCart(101)
    ).rejects.toThrow("Unable to add to cart");
  });

  test("uses local cart API when logged out", async () => {
    setUnauthenticated();

    saveLocalWishlist([sampleItems[0]]);

    addProductToCart.mockResolvedValue({
      message: "Cart updated",
    });

    const result = await moveWishlistItemToCart(101);

    expect(result).toEqual({
      message: "Cart updated",
    });
  });
});
