
import axios from "axios";

import {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  moveWishlistItemToCart,
  syncLocalWishlist,
} from "../wishlistApi";

import {
  clearAuthSession,
  getStoredAccessToken,
} from "../../src/api";

import { addProductToCart } from "../cartApi";

// ---------------------------------------------
// MOCK AXIOS
// ---------------------------------------------

jest.mock("axios", () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
    },
  };
});

// ---------------------------------------------
// MOCK AUTHENTICATION
// ---------------------------------------------

jest.mock("../../src/api", () => ({
  clearAuthSession: jest.fn(),
  getStoredAccessToken: jest.fn(),
}));

// ---------------------------------------------
// MOCK CART API
// ---------------------------------------------

jest.mock("../cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// ---------------------------------------------
// AXIOS INSTANCE
// ---------------------------------------------

const mockWishlistApi = axios.create.mock.results[0].value;

// ---------------------------------------------
// SYNTHETIC TEST DATA
// ---------------------------------------------

const mockProducts = [
  {
    id: 90001,
    name: "Synthetic Item Alpha",
    price: 100,
    category: "category-alpha",
  },
  {
    id: 90002,
    name: "Synthetic Item Beta",
    price: 200,
    category: "category-beta",
  },
];

const mockServerItems = [
  {
    id: 501,
    product_id: 90001,
    product: {
      id: 90001,
      name: "Synthetic Item Alpha",
      price: 100,
      category: "category-alpha",
    },
  },
];

// ---------------------------------------------
// TEST SETUP
// ---------------------------------------------

describe("wishlistApi", () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    localStorage.clear();

    getStoredAccessToken.mockReturnValue(null);

    mockWishlistApi.get.mockResolvedValue({
      data: [],
    });

    mockWishlistApi.post.mockResolvedValue({
      data: { success: true },
    });

    mockWishlistApi.delete.mockResolvedValue({
      data: { success: true },
    });

    addProductToCart.mockResolvedValue({
      success: true,
    });

    // Reset module-level fallback IDs.
    await getWishlist();
  });

  // -------------------------------------------
  // 1. GUEST WISHLIST
  // -------------------------------------------

  describe("Guest wishlist", () => {
    test("returns an empty wishlist when local storage is empty", async () => {
      const result = await getWishlist();

      expect(result).toEqual([]);
    });

    test("returns wishlist items from local storage", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(mockProducts)
      );

      const result = await getWishlist();

      expect(result).toEqual(mockProducts);
    });

    test("adds an item to the local wishlist", async () => {
      const result = await addToWishlist(mockProducts[0]);

      expect(result).toEqual([mockProducts[0]]);

      expect(JSON.parse(localStorage.getItem("wishlist"))).toEqual([
        mockProducts[0],
      ]);
    });

    test("does not add duplicate items", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      const result = await addToWishlist(mockProducts[0]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(90001);
    });

    test("accepts a numeric product ID", async () => {
      const result = await addToWishlist(90001);

      expect(result).toEqual([
        {
          id: 90001,
        },
      ]);
    });

    test("rejects a product without an ID", async () => {
      await expect(
        addToWishlist({
          name: "Synthetic Item",
        })
      ).rejects.toThrow(
        "This product has no database product ID."
      );
    });

    test("removes an item from the local wishlist", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(mockProducts)
      );

      const result = await removeWishlistItem(90001);

      expect(result).toEqual([mockProducts[1]]);

      expect(JSON.parse(localStorage.getItem("wishlist"))).toEqual([
        mockProducts[1],
      ]);
    });

    test("returns an empty array after removing the last item", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      const result = await removeWishlistItem(90001);

      expect(result).toEqual([]);
    });

    test("handles invalid non-array local wishlist data", async () => {
      localStorage.setItem("wishlist", JSON.stringify({ invalid: true }));

      const result = await getWishlist();

      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------
  // 2. AUTHENTICATION
  // -------------------------------------------

  describe("Authentication", () => {
    test("uses the stored access token for authenticated requests", async () => {
      getStoredAccessToken.mockReturnValue("synthetic-access-token");

      await getWishlist();

      expect(mockWishlistApi.get).toHaveBeenCalledWith(
        "/api/wishlist",
        {
          headers: {
            Authorization: "Bearer synthetic-access-token",
          },
        }
      );
    });

    test("does not call the server for a guest wishlist", async () => {
      getStoredAccessToken.mockReturnValue(null);

      await addToWishlist(mockProducts[0]);

      expect(mockWishlistApi.post).not.toHaveBeenCalled();
      expect(mockWishlistApi.get).not.toHaveBeenCalled();
    });

    test("clears authentication when the response interceptor receives 401", async () => {
      const interceptor =
        mockWishlistApi.interceptors.response.use.mock.calls[0][1];

      const error = {
        response: {
          status: 401,
        },
      };

      await expect(interceptor(error)).rejects.toEqual(error);

      expect(clearAuthSession).toHaveBeenCalledTimes(1);
    });

    test("does not clear authentication for a non-401 error", async () => {
      const interceptor =
        mockWishlistApi.interceptors.response.use.mock.calls[0][1];

      const error = {
        response: {
          status: 500,
        },
      };

      await expect(interceptor(error)).rejects.toEqual(error);

      expect(clearAuthSession).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // 3. AUTHENTICATED WISHLIST
  // -------------------------------------------

  describe("Authenticated wishlist", () => {
    beforeEach(() => {
      getStoredAccessToken.mockReturnValue("synthetic-token");
    });

    test("fetches wishlist from the server", async () => {
      mockWishlistApi.get.mockResolvedValue({
        data: mockServerItems,
      });

      const result = await getWishlist();

      expect(mockWishlistApi.get).toHaveBeenCalledWith(
        "/api/wishlist",
        expect.any(Object)
      );

      expect(result[0]).toMatchObject({
        id: 90001,
        product_id: 90001,
        wishlist_id: 501,
      });
    });

    test("supports an items response object", async () => {
      mockWishlistApi.get.mockResolvedValue({
        data: {
          items: mockServerItems,
        },
      });

      const result = await getWishlist();

      expect(result).toHaveLength(1);
      expect(result[0].product_id).toBe(90001);
    });

    test("supports a wishlist response object", async () => {
      mockWishlistApi.get.mockResolvedValue({
        data: {
          wishlist: mockServerItems,
        },
      });

      const result = await getWishlist();

      expect(result).toHaveLength(1);
    });

    test("adds a product through the authenticated API", async () => {
      await addToWishlist(mockProducts[0]);

      expect(mockWishlistApi.post).toHaveBeenCalledWith(
        "/api/wishlist",
        {
          product_id: 90001,
        },
        expect.objectContaining({
          headers: {
            Authorization: "Bearer synthetic-token",
          },
        })
      );
    });

    test("returns the server response after adding an item", async () => {
      mockWishlistApi.post.mockResolvedValue({
        data: {
          id: 501,
          product_id: 90001,
        },
      });

      const result = await addToWishlist(mockProducts[0]);

      expect(result).toEqual({
        id: 501,
        product_id: 90001,
      });
    });

    test("removes an authenticated wishlist item", async () => {
      const result = await removeWishlistItem(90001);

      expect(mockWishlistApi.delete).toHaveBeenCalledWith(
        "/api/wishlist/90001",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer synthetic-token",
          },
        })
      );

      expect(result).toEqual({
        success: true,
      });
    });
  });

  // -------------------------------------------
  // 4. LOCAL WISHLIST MIGRATION
  // -------------------------------------------

  describe("Wishlist migration", () => {
    beforeEach(() => {
      getStoredAccessToken.mockReturnValue("synthetic-token");
    });

    test("returns null when there are no local items", async () => {
      const result = await syncLocalWishlist();

      expect(result).toBeNull();
      expect(mockWishlistApi.post).not.toHaveBeenCalled();
    });

    test("imports local wishlist items into the server", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(mockProducts)
      );

      await syncLocalWishlist();

      expect(mockWishlistApi.post).toHaveBeenCalledWith(
        "/api/wishlist/import",
        expect.objectContaining({
          items: [
            { product_id: 90001 },
            { product_id: 90002 },
          ],
          migration_id: expect.any(String),
        }),
        expect.any(Object)
      );
    });

    test("saves pending migration data before importing", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      await syncLocalWishlist();

      expect(
        localStorage.getItem("pendingWishlistImport")
      ).toBeNull();
    });

    test("removes imported items from local storage", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(mockProducts)
      );

      await syncLocalWishlist();

      expect(JSON.parse(localStorage.getItem("wishlist"))).toEqual([]);
    });

    test("dispatches wishlistUpdated after successful migration", async () => {
      const dispatchSpy = jest.spyOn(window, "dispatchEvent");

      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      await syncLocalWishlist();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "wishlistUpdated",
        })
      );

      dispatchSpy.mockRestore();
    });

    test("reuses an existing pending migration ID", async () => {
      const pending = {
        migration_id: "synthetic-migration-id",
        items: [{ product_id: 90001 }],
      };

      localStorage.setItem(
        "pendingWishlistImport",
        JSON.stringify(pending)
      );

      await syncLocalWishlist();

      expect(mockWishlistApi.post).toHaveBeenCalledWith(
        "/api/wishlist/import",
        pending,
        expect.any(Object)
      );
    });

    test("rejects invalid saved migration data", async () => {
      localStorage.setItem(
        "pendingWishlistImport",
        JSON.stringify({
          migration_id: 123,
          items: [],
        })
      );

      await expect(
        syncLocalWishlist()
      ).rejects.toThrow(
        "Saved wishlist import data is invalid."
      );
    });

    test("does not import when the user is not authenticated", async () => {
      getStoredAccessToken.mockReturnValue(null);

      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      const result = await syncLocalWishlist();

      expect(result).toBeNull();
      expect(mockWishlistApi.post).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // 5. LOCAL FALLBACK ITEMS
  // -------------------------------------------

  describe("Local fallback wishlist items", () => {
    beforeEach(() => {
      getStoredAccessToken.mockReturnValue("synthetic-token");
    });

    test("keeps local items when migration fails with a non-401 error", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      mockWishlistApi.post.mockRejectedValue(
        new Error("Synthetic migration failure")
      );

      mockWishlistApi.get.mockResolvedValue({
        data: [],
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getWishlist();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 90001,
        product_id: 90001,
        _localItem: true,
      });

      consoleSpy.mockRestore();
    });

    test("removes a local fallback item without calling server delete", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      mockWishlistApi.post.mockRejectedValue(
        new Error("Synthetic migration failure")
      );

      mockWishlistApi.get.mockResolvedValue({
        data: [],
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getWishlist();

      const result = await removeWishlistItem(90001);

      expect(result).toEqual([]);
      expect(mockWishlistApi.delete).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("removes a fallback item from pending migration data", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      localStorage.setItem(
        "pendingWishlistImport",
        JSON.stringify({
          migration_id: "synthetic-migration-id",
          items: [
            { product_id: 90001 },
            { product_id: 90002 },
          ],
        })
      );

      mockWishlistApi.post.mockRejectedValue(
        new Error("Synthetic migration failure")
      );

      mockWishlistApi.get.mockResolvedValue({
        data: [],
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getWishlist();
      await removeWishlistItem(90001);

      const pending = JSON.parse(
        localStorage.getItem("pendingWishlistImport")
      );

      expect(pending.items).toEqual([
        { product_id: 90002 },
      ]);

      consoleSpy.mockRestore();
    });

    test("propagates 401 errors during migration", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      const error = {
        response: {
          status: 401,
        },
      };

      mockWishlistApi.post.mockRejectedValue(error);

      await expect(getWishlist()).rejects.toEqual(error);

      expect(mockWishlistApi.get).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // 6. MOVE WISHLIST ITEM TO CART
  // -------------------------------------------

  describe("Move wishlist item to cart", () => {
    test("moves a guest wishlist item to cart", async () => {
      localStorage.setItem(
        "wishlist",
        JSON.stringify([mockProducts[0]])
      );

      await moveWishlistItemToCart(90001);

      expect(addProductToCart).toHaveBeenCalledWith(
        mockProducts[0]
      );
    });

    test("rejects when guest wishlist item does not exist", async () => {
      await expect(
        moveWishlistItemToCart(99999)
      ).rejects.toThrow(
        "This product is no longer in your wishlist."
      );
    });

    test("adds an authenticated wishlist item to the server cart", async () => {
      getStoredAccessToken.mockReturnValue("synthetic-token");

      await moveWishlistItemToCart(90001);

      expect(mockWishlistApi.post).toHaveBeenCalledWith(
        "/api/cart",
        {
          product_id: 90001,
          quantity: 1,
        },
        expect.objectContaining({
          headers: {
            Authorization: "Bearer synthetic-token",
          },
        })
      );
    });

    test("returns the authenticated cart response", async () => {
      getStoredAccessToken.mockReturnValue("synthetic-token");

      mockWishlistApi.post.mockResolvedValue({
        data: {
          success: true,
          quantity: 1,
        },
      });

      const result = await moveWishlistItemToCart(90001);

      expect(result).toEqual({
        success: true,
        quantity: 1,
      });
    });
  });
});
