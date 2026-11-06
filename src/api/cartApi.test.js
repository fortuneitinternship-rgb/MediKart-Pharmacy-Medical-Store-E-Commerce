import {
  getAccessToken,
  getCartErrorMessage,
  syncLocalCart,
} from "./cartApi";
import { clearAuthSession } from "../services/api";

describe("getAccessToken", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("normalizes bearer-prefixed legacy tokens", () => {
    localStorage.setItem("token", "Bearer legacy-token");

    expect(getAccessToken()).toBe("legacy-token");
  });

  test("prefers the current access token over legacy tokens", () => {
    localStorage.setItem("access_token", "new-token");
    localStorage.setItem("token", "old-token");

    expect(getAccessToken()).toBe("new-token");
  });

  test("clears all token keys when the session is invalidated", () => {
    localStorage.setItem("access_token", "current-token");
    localStorage.setItem("accessToken", "legacy-token");
    localStorage.setItem("token", "older-token");

    clearAuthSession();

    expect(getAccessToken()).toBe("");
  });
});

describe("getCartErrorMessage", () => {
  test("preserves the backend reason for an unauthorized request", () => {
    const error = {
      response: {
        status: 401,
        data: {
          detail: "User account not found. Please log in again.",
        },
      },
    };

    expect(getCartErrorMessage(error)).toBe(
      "User account not found. Please log in again."
    );
  });

  test("uses a clear message when an unauthorized response has no detail", () => {
    expect(
      getCartErrorMessage({ response: { status: 401, data: {} } })
    ).toBe("Your login session is no longer valid. Please log in again.");
  });
});

describe("syncLocalCart", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    localStorage.clear();
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      delete global.fetch;
    }
  });

  test("imports local cart items and removes them only after success", async () => {
    localStorage.setItem("access_token", "signed-in-token");
    localStorage.setItem(
      "cart",
      JSON.stringify([{ id: 8, product_id: 8, quantity: 2 }])
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message: "Cart imported successfully." }),
    });

    await syncLocalCart();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/cart/import",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"product_id":8'),
      })
    );
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([]);
    expect(localStorage.getItem("pendingCartImport")).toBeNull();
  });

  test("retries a failed import with the same idempotency key", async () => {
    localStorage.setItem("access_token", "signed-in-token");
    localStorage.setItem(
      "cart",
      JSON.stringify([{ id: 9, product_id: 9, quantity: 1 }])
    );
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ detail: "Temporarily unavailable." }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ message: "Cart imported successfully." }),
      });

    await expect(syncLocalCart()).rejects.toThrow("Temporarily unavailable.");
    const pending = JSON.parse(localStorage.getItem("pendingCartImport"));
    expect(JSON.parse(localStorage.getItem("cart"))).toHaveLength(1);

    await syncLocalCart();

    const retryPayload = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(retryPayload.migration_id).toBe(pending.migration_id);
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([]);
  });
});
