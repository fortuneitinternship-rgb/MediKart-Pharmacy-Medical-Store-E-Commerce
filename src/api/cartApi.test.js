import { getCartErrorMessage } from "./cartApi";

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
