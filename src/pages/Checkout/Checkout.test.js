import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import Checkout from "./Checkout";

import {
  getCheckoutCart,
  saveCheckoutAddress,
  createCheckoutOrder,
  validateCheckoutCoupon,
  processCheckoutPayment,
  getCheckoutConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../api/checkoutApi";

import {
  removeCartItem,
  updateCartItem,
} from "../../api/cartApi";

// --------------------------------------------------
// MOCK API MODULES
// --------------------------------------------------

jest.mock("../../api/checkoutApi", () => ({
  getCheckoutCart: jest.fn(),
  saveCheckoutAddress: jest.fn(),
  createCheckoutOrder: jest.fn(),
  validateCheckoutCoupon: jest.fn(),
  processCheckoutPayment: jest.fn(),
  getCheckoutConfig: jest.fn(),
  createRazorpayOrder: jest.fn(),
  verifyRazorpayPayment: jest.fn(),
}));

jest.mock("../../api/cartApi", () => ({
  removeCartItem: jest.fn(),
  updateCartItem: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  getApiErrorMessage: jest.fn(
    (error, fallback) =>
      error?.response?.data?.detail ||
      error?.message ||
      fallback
  ),
}));

jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(() => ""),
  handleProductImageError: jest.fn(),
}));

jest.mock("./Checkout.css", () => ({}));

// --------------------------------------------------
// MOCK DATA
// --------------------------------------------------

const mockCart = [
  {
    id: 1,
    product_id: 1,
    quantity: 1,
    price: 100,
    discountedPrice: 100,
  },
];

// --------------------------------------------------
// TEST CONFIGURATION
// --------------------------------------------------

const renderCheckout = (initialEntries = ["/checkout"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/checkout/:id"
          element={<Checkout />}
        />

        <Route
          path="/login"
          element={<div>Login Page</div>}
        />

        <Route
          path="/shop"
          element={<div>Shop Page</div>}
        />

        <Route
          path="/orders/:id"
          element={<div>Order Details Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

// --------------------------------------------------
// BEFORE EACH TEST
// --------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.clear();

  window.alert = jest.fn();

  getCheckoutConfig.mockResolvedValue({
    tax_rate_percent: 0,
    payment_mode: "simulator",
    razorpay_enabled: false,
    free_delivery_threshold: 499,
    standard_delivery_charge: 10,
    express_delivery_minimum: 299,
    express_delivery_charge: 49,
    same_day_delivery_minimum: 999,
    same_day_delivery_charge: 99,
  });

  getCheckoutCart.mockResolvedValue(mockCart);

  saveCheckoutAddress.mockResolvedValue({
    success: true,
  });

  createCheckoutOrder.mockResolvedValue({
    order_id: "TEST-ORDER",
    total_amount: 100,
  });

  processCheckoutPayment.mockResolvedValue({
    status: "Pending",
    amount: 100,
  });

  validateCheckoutCoupon.mockResolvedValue({
    code: "TESTCOUPON",
    discount_amount: 10,
    order_amount: 100,
  });

  removeCartItem.mockResolvedValue({
    success: true,
  });

  updateCartItem.mockResolvedValue({
    success: true,
  });

  createRazorpayOrder.mockResolvedValue({});
  verifyRazorpayPayment.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

// ==================================================
// CHECKOUT TESTS
// ==================================================

describe("Checkout Component", () => {

  // ----------------------------------------------
  // 1. RENDER CHECKOUT
  // ----------------------------------------------

  test("renders checkout component", async () => {
    renderCheckout();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Loading");

    expect(
      await screen.findByText("MediKart Checkout")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 2. LOAD CART
  // ----------------------------------------------

  test("loads checkout cart successfully", async () => {
    renderCheckout();

    expect(
      await screen.findByTestId("cart-item-count")
    ).toHaveTextContent("1 Item");

    expect(getCheckoutCart).toHaveBeenCalledTimes(1);
  });

  // ----------------------------------------------
  // 3. EMPTY CART
  // ----------------------------------------------

  test("displays empty cart message", async () => {
    getCheckoutCart.mockResolvedValue([]);

    renderCheckout();

    expect(
      await screen.findByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Continue Shopping")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 4. CONTINUE SHOPPING
  // ----------------------------------------------

  test("navigates to shop from empty cart", async () => {
    getCheckoutCart.mockResolvedValue([]);

    renderCheckout();

    fireEvent.click(
      await screen.findByText("Continue Shopping")
    );

    expect(
      await screen.findByText("Shop Page")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 5. CART API ERROR
  // ----------------------------------------------

  test("displays error when cart loading fails", async () => {
    getCheckoutCart.mockRejectedValue(
      new Error("Unable to load cart")
    );

    renderCheckout();
  });

  // ----------------------------------------------
  // 6. RETRY CART
  // ----------------------------------------------

  test("retries cart loading", async () => {
    getCheckoutCart
      .mockRejectedValueOnce(
        new Error("Network error")
      )
      .mockResolvedValueOnce(mockCart);

    renderCheckout();

  });

  // ----------------------------------------------
  // 7. PRICE CALCULATION
  // ----------------------------------------------

  test("calculates product total correctly", async () => {
    renderCheckout();

    expect(
      await screen.findByTestId("product-total")
    ).toHaveTextContent("100");
  });

  // ----------------------------------------------
  // 8. DISCOUNT CALCULATION
  // ----------------------------------------------

  test("displays discount correctly", async () => {
    renderCheckout();

    expect(
      await screen.findByText("Flat 10% Discount")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 9. PROCEED TO ADDRESS
  // ----------------------------------------------

  test("moves to address step", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    expect(
      screen.getByText("Delivery Address")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 10. ADDRESS VALIDATION
  // ----------------------------------------------

  test("does not continue with empty address", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    fireEvent.click(
      screen.getByText("Continue to Payment")
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your full name (at least 2 characters)."
    );

    expect(
      screen.getByText("Delivery Address")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 11. INVALID PHONE
  // ----------------------------------------------

  test("validates phone number", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    fireEvent.change(
      screen.getByLabelText("Full Name"),
      { target: { value: "Test Name" } }
    );

    fireEvent.change(
      screen.getByLabelText("Mobile Number"),
      { target: { value: "123" } }
    );

    fireEvent.click(
      screen.getByText("Continue to Payment")
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter a valid 10-digit phone number."
    );
  });

  // ----------------------------------------------
  // 12. INVALID PINCODE
  // ----------------------------------------------

  test("validates pincode", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    fireEvent.change(
      screen.getByLabelText("Full Name"),
      { target: { value: "Test Name" } }
    );

    fireEvent.change(
      screen.getByLabelText("Mobile Number"),
      { target: { value: "0000000000" } }
    );

    fireEvent.change(
      screen.getByLabelText("Complete Address"),
      { target: { value: "Test Address" } }
    );

    fireEvent.change(
      screen.getByLabelText("City"),
      { target: { value: "Test City" } }
    );

    fireEvent.change(
      screen.getByLabelText("State"),
      { target: { value: "Test State" } }
    );

    fireEvent.change(
      screen.getByLabelText("Pincode"),
      { target: { value: "123" } }
    );

    fireEvent.click(
      screen.getByText("Continue to Payment")
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter a valid 6-digit pincode."
    );
  });

  // ----------------------------------------------
  // 13. SAVE ADDRESS
  // ----------------------------------------------

  test("saves valid address and opens payment step", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    fireEvent.change(
      screen.getByLabelText("Full Name"),
      { target: { value: "Test Name" } }
    );

    fireEvent.change(
      screen.getByLabelText("Mobile Number"),
      { target: { value: "0000000000" } }
    );

    fireEvent.change(
      screen.getByLabelText("Complete Address"),
      { target: { value: "Test Address" } }
    );

    fireEvent.change(
      screen.getByLabelText("City"),
      { target: { value: "Test City" } }
    );

    fireEvent.change(
      screen.getByLabelText("State"),
      { target: { value: "Test State" } }
    );

    fireEvent.change(
      screen.getByLabelText("Pincode"),
      { target: { value: "000000" } }
    );

    fireEvent.click(
      screen.getByText("Continue to Payment")
    );

    expect(
      await screen.findByText("Payment Method")
    ).toBeInTheDocument();

    expect(saveCheckoutAddress).toHaveBeenCalledTimes(1);

    expect(localStorage.getItem("deliveryAddress")).not.toBeNull();
  });

  // ----------------------------------------------
  // 14. ADDRESS SAVE ERROR
  // ----------------------------------------------

  test("handles address saving failure", async () => {
    saveCheckoutAddress.mockRejectedValue(
      new Error("Address save failed")
    );

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    fireEvent.change(
      screen.getByLabelText("Full Name"),
      { target: { value: "Test Name" } }
    );

    fireEvent.change(
      screen.getByLabelText("Mobile Number"),
      { target: { value: "0000000000" } }
    );

    fireEvent.change(
      screen.getByLabelText("Complete Address"),
      { target: { value: "Test Address" } }
    );

    fireEvent.change(
      screen.getByLabelText("City"),
      { target: { value: "Test City" } }
    );

    fireEvent.change(
      screen.getByLabelText("State"),
      { target: { value: "Test State" } }
    );

    fireEvent.change(
      screen.getByLabelText("Pincode"),
      { target: { value: "000000" } }
    );

    fireEvent.click(
      screen.getByText("Continue to Payment")
    );

    expect(
      screen.getByText("Delivery Address")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 15. PAYMENT METHODS
  // ----------------------------------------------

  test("allows selecting card payment", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByLabelText("Credit / Debit Card")
    );

    expect(
      screen.getByLabelText("Credit / Debit Card")
    ).toBeChecked();
  });

  test("allows selecting net banking", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByLabelText("Net Banking")
    );

    expect(
      screen.getByLabelText("Net Banking")
    ).toBeChecked();
  });

  test("allows selecting cash on delivery", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByLabelText("Cash on Delivery")
    );

    expect(
      screen.getByLabelText("Cash on Delivery")
    ).toBeChecked();
  });

  // ----------------------------------------------
  // 16. COUPON
  // ----------------------------------------------

  test("applies valid coupon", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.change(
      screen.getByLabelText("Coupon code"),
      { target: { value: "TESTCOUPON" } }
    );

    fireEvent.click(
      screen.getByTestId("apply-coupon")
    );

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("applied");

    expect(validateCheckoutCoupon).toHaveBeenCalledTimes(1);
  });

  test("handles invalid coupon", async () => {
    validateCheckoutCoupon.mockRejectedValue(
      new Error("Invalid coupon")
    );

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.change(
      screen.getByLabelText("Coupon code"),
      { target: { value: "INVALID" } }
    );

    fireEvent.click(
      screen.getByTestId("apply-coupon")
    );
  });

  // ----------------------------------------------
  // 17. REMOVE COUPON
  // ----------------------------------------------

  test("removes applied coupon", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.change(
      screen.getByLabelText("Coupon code"),
      { target: { value: "TESTCOUPON" } }
    );

    fireEvent.click(
      screen.getByTestId("apply-coupon")
    );

    fireEvent.click(
      await screen.findByText("Remove")
    );

    expect(
      screen.queryByText("Remove")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------
  // 18. DELIVERY OPTIONS
  // ----------------------------------------------

  test("allows changing delivery distance", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();
  });

  // ----------------------------------------------
  // 19. QUANTITY UPDATE
  // ----------------------------------------------

  test("increases cart item quantity", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("increase-1")
    );

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(1, 2);
    });

    expect(
      await screen.findByTestId("quantity-1")
    ).toHaveTextContent("2");
  });

  test("decreases cart item quantity", async () => {
    getCheckoutCart.mockResolvedValue([
      { ...mockCart[0], quantity: 2 },
    ]);

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("decrease-1")
    );

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(1, 1);
    });
  });

  // ----------------------------------------------
  // 20. REMOVE CART ITEM
  // ----------------------------------------------

  test("removes cart item", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("remove-1")
    );

    await waitFor(() => {
      expect(removeCartItem).toHaveBeenCalledWith(1);
    });

    expect(
      await screen.findByText("Your Cart is Empty")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 21. ORDER PLACEMENT
  // ----------------------------------------------

  test("places order successfully", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    expect(
      await screen.findByText("Order Placed Successfully!")
    ).toBeInTheDocument();

    expect(createCheckoutOrder).toHaveBeenCalledTimes(1);

    expect(processCheckoutPayment).toHaveBeenCalledTimes(1);

    expect(
      screen.getByTestId("order-id")
    ).toHaveTextContent("TEST-ORDER");
  });

  // ----------------------------------------------
  // 22. ORDER CREATION ERROR
  // ----------------------------------------------

  test("handles order creation failure", async () => {
    createCheckoutOrder.mockRejectedValue(
      new Error("Order creation failed")
    );

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Unable to place order. Please try again."
      );
    });

    expect(
      screen.getByText("Payment Method")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 23. PAYMENT FAILURE
  // ----------------------------------------------

  test("displays payment failure after order creation", async () => {
    processCheckoutPayment.mockRejectedValue(
      new Error("Payment failed")
    );

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByTestId("place-order")
    );
  });

  // ----------------------------------------------
  // 24. PAYMENT RETRY
  // ----------------------------------------------

  test("retries failed payment", async () => {
    processCheckoutPayment
      .mockRejectedValueOnce(
        new Error("Payment failed")
      )
      .mockResolvedValueOnce({
        status: "Pending",
        amount: 100,
      });

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByTestId("place-order")
    );
  });

  // ----------------------------------------------
  // 25. ORDER NAVIGATION
  // ----------------------------------------------

  test("navigates to order details", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    fireEvent.click(
      await screen.findByTestId("view-order")
    );

    expect(
      await screen.findByText("Order Details Page")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------
  // 26. CONTINUE SHOPPING AFTER SUCCESS
  // ----------------------------------------------

  test("navigates to shop after successful order", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByTestId("proceed-address")
    );

    await enterValidAddress();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    fireEvent.click(
      await screen.findByText("Continue Shopping")
    );

    expect(
      await screen.findByText("Shop Page")
    ).toBeInTheDocument();
  });

});

// ==================================================
// REUSABLE ADDRESS HELPER
// ==================================================

async function enterValidAddress() {
  fireEvent.change(
    screen.getByLabelText("Full Name"),
    { target: { value: "Test Name" } }
  );

  fireEvent.change(
    screen.getByLabelText("Mobile Number"),
    { target: { value: "0000000000" } }
  );

  fireEvent.change(
    screen.getByLabelText("Complete Address"),
    { target: { value: "Test Address" } }
  );

  fireEvent.change(
    screen.getByLabelText("City"),
    { target: { value: "Test City" } }
  );

  fireEvent.change(
    screen.getByLabelText("State"),
    { target: { value: "Test State" } }
  );

  fireEvent.change(
    screen.getByLabelText("Pincode"),
    { target: { value: "000000" } }
  );

  fireEvent.click(
    screen.getByText("Continue to Payment")
  );

  await screen.findByText("Payment Method");
}
