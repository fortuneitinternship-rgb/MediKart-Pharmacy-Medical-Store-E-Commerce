
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import Checkout from "./Checkout";
import { createOrder } from "../../api/checkoutApi";

jest.mock("../../api/checkoutApi", () => ({
  createOrder: jest.fn(),
}));

const sampleCart = [
  {
    id: 1,
    product_id: 1,
    name: "Paracetamol",
    price: 100,
    quantity: 2,
    category: "Medicine",
  },
  {
    id: 2,
    product_id: 2,
    name: "Vitamin Tablets",
    price: 200,
    quantity: 1,
    category: "Medicine",
  },
];

const validAddress = {
  name: "Test Customer",
  phone: "9876543210",
  address: "10 Main Road",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500001",
};

function renderCheckout({
  cart = sampleCart,
  route = "/checkout",
} = {}) {
  localStorage.setItem("cart", JSON.stringify(cart));

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route
          path="/orders/:id"
          element={<div>Order details page</div>}
        />
        <Route path="/shop" element={<div>Shop page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function continueToAddress() {
  fireEvent.click(
    screen.getByRole("button", {
      name: /Proceed to Delivery Address/i,
    })
  );

  expect(
    await screen.findByText("Delivery Address")
  ).toBeInTheDocument();
}

async function fillAddress(address = validAddress) {
  fireEvent.change(screen.getByLabelText("Full Name"), {
    target: { value: address.name },
  });

  fireEvent.change(screen.getByLabelText("Mobile Number"), {
    target: { value: address.phone },
  });

  fireEvent.change(screen.getByLabelText("Complete Address"), {
    target: { value: address.address },
  });

  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: address.city },
  });

  fireEvent.change(screen.getByLabelText("State"), {
    target: { value: address.state },
  });

  fireEvent.change(screen.getByLabelText("Pincode"), {
    target: { value: address.pincode },
  });
}

async function continueToPayment() {
  fireEvent.click(
    screen.getByRole("button", {
      name: /Continue to Payment/i,
    })
  );

  expect(
    await screen.findByText("Payment Method")
  ).toBeInTheDocument();
}

describe("MediKart Checkout component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    jest.spyOn(window, "alert").mockImplementation(() => {});

    createOrder.mockResolvedValue({
      order_id: 123,
      status: "confirmed",
      total_amount: 370,
      delivery_charge: 10,
      discount: 40,
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  // -----------------------------------------
  // 1. Initial checkout page
  // -----------------------------------------

  test("renders checkout header and first step", () => {
    renderCheckout();

    expect(
      screen.getByRole("heading", {
        name: "MediKart Checkout",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Your Order" })
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("cart-item-count")
    ).toHaveTextContent("2 Items");
  });

  // -----------------------------------------
  // 2. Empty cart
  // -----------------------------------------

  test("shows empty-cart message when cart is empty", () => {
    renderCheckout({ cart: [] });

    expect(
      screen.getByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Continue Shopping",
      })
    ).toBeInTheDocument();
  });

  // -----------------------------------------
  // 3. Product details and prices
  // -----------------------------------------

  test("displays products, quantities, and prices", () => {
    renderCheckout();

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("Vitamin Tablets")).toBeInTheDocument();

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("2");
    expect(screen.getByTestId("quantity-2")).toHaveTextContent("1");

    expect(screen.getByTestId("product-total")).toHaveTextContent("400");
    expect(screen.getByTestId("estimated-total")).toHaveTextContent("370");
  });

  // -----------------------------------------
  // 4. Increase quantity
  // -----------------------------------------

  test("increases product quantity", () => {
    renderCheckout();

    fireEvent.click(screen.getByTestId("increase-1"));

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("3");

    const savedCart = JSON.parse(localStorage.getItem("cart"));

    expect(savedCart.find((item) => item.id === 1).quantity).toBe(3);
  });

  // -----------------------------------------
  // 5. Decrease quantity
  // -----------------------------------------

  test("decreases product quantity", () => {
    renderCheckout();

    fireEvent.click(screen.getByTestId("decrease-1"));

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("1");
  });

  test("does not decrease quantity below one", () => {
    renderCheckout({
      cart: [{ ...sampleCart[0], quantity: 1 }],
    });

    expect(screen.getByTestId("decrease-1")).toBeDisabled();

    fireEvent.click(screen.getByTestId("decrease-1"));

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("1");
  });

  // -----------------------------------------
  // 6. Remove product
  // -----------------------------------------

  test("removes a product from the cart", () => {
    renderCheckout();

    fireEvent.click(screen.getByTestId("remove-1"));

    expect(
      screen.queryByTestId("checkout-product-1")
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("checkout-product-2")
    ).toBeInTheDocument();

    const savedCart = JSON.parse(localStorage.getItem("cart"));

    expect(savedCart).toHaveLength(1);
    expect(savedCart[0].id).toBe(2);
  });

  // -----------------------------------------
  // 7. Navigate to address step
  // -----------------------------------------

  test("moves from order step to address step", async () => {
    renderCheckout();

    await continueToAddress();

    expect(
      screen.getByLabelText("Full Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Mobile Number")
    ).toBeInTheDocument();
  });

  // -----------------------------------------
  // 8. Address validation
  // -----------------------------------------

  test("does not continue without a valid address", async () => {
    renderCheckout();

    await continueToAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Continue to Payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your name."
    );

    expect(createOrder).not.toHaveBeenCalled();
  });

  // -----------------------------------------
  // 9. Invalid phone number
  // -----------------------------------------

  test("rejects an invalid phone number", async () => {
    renderCheckout();

    await continueToAddress();

    await fillAddress({
      ...validAddress,
      phone: "12345",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Continue to Payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter a valid 10-digit phone number."
    );
  });

  // -----------------------------------------
  // 10. Save address and continue
  // -----------------------------------------

  test("saves address and opens payment step", async () => {
    renderCheckout();

    await continueToAddress();
    await fillAddress();

    await continueToPayment();

    expect(
      screen.getByLabelText("Cash on Delivery")
    ).toBeInTheDocument();

    const savedAddress = JSON.parse(
      localStorage.getItem("deliveryAddress")
    );

    expect(savedAddress.name).toBe("Test Customer");
    expect(savedAddress.pincode).toBe("500001");
  });

  // -----------------------------------------
  // 11. Change payment method
  // -----------------------------------------

  test("allows the customer to select card payment", async () => {
    renderCheckout();

    await continueToAddress();
    await fillAddress();
    await continueToPayment();

    fireEvent.click(
      screen.getByLabelText("Credit / Debit Card")
    );

    expect(
      screen.getByLabelText("Credit / Debit Card")
    ).toBeChecked();

    expect(
      screen.getByPlaceholderText("Card Number")
    ).toBeInTheDocument();
  });

  // -----------------------------------------
  // 12. Successful API order
  // -----------------------------------------

  test("places order through the API and shows confirmation", async () => {
    renderCheckout();

    await continueToAddress();
    await fillAddress();
    await continueToPayment();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Place Order",
      })
    );

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledTimes(1);
    });

    expect(createOrder).toHaveBeenCalledWith({
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 1 },
      ],
      shipping_address: validAddress,
      payment_method: "COD",
      delivery_type: "normal",
      delivery_distance: "short",
    });

    expect(
      await screen.findByRole("heading", {
        name: "Order Placed Successfully!",
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId("order-id")).toHaveTextContent("123");

    const savedOrders = JSON.parse(
      localStorage.getItem("orders")
    );

    expect(savedOrders[0].orderId).toBe("123");
    expect(localStorage.getItem("cart")).toBeNull();
  });

  // -----------------------------------------
  // 13. API failure
  // -----------------------------------------

  test("shows an error when the order API fails", async () => {
    createOrder.mockRejectedValue(
      new Error("Unable to create order")
    );

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderCheckout();

    await continueToAddress();
    await fillAddress();
    await continueToPayment();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Place Order",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to create order");

    expect(
      screen.getByRole("heading", {
        name: "Payment Method",
      })
    ).toBeInTheDocument();

    // Failed orders must not clear the cart.
    expect(localStorage.getItem("cart")).not.toBeNull();

    consoleError.mockRestore();
  });

  // -----------------------------------------
  // 14. API response missing order ID
  // -----------------------------------------

  test("shows an error if the API does not return an order ID", async () => {
    createOrder.mockResolvedValue({
      status: "confirmed",
    });

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderCheckout();

    await continueToAddress();
    await fillAddress();
    await continueToPayment();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Place Order",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "The server did not return an order ID."
    );

    expect(localStorage.getItem("cart")).not.toBeNull();

    consoleError.mockRestore();
  });

  // -----------------------------------------
  // 15. Prevent duplicate submission
  // -----------------------------------------

  test("disables the order button while the API request is pending", async () => {
    let resolveOrder;

    createOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveOrder = resolve;
      })
    );

    renderCheckout();

    await continueToAddress();
    await fillAddress();
    await continueToPayment();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Place Order",
      })
    );

    expect(
      await screen.findByRole("button", {
        name: "Placing Order...",
      })
    ).toBeDisabled();

    expect(createOrder).toHaveBeenCalledTimes(1);

    resolveOrder({
      order_id: 456,
      status: "confirmed",
      total_amount: 370,
    });

    expect(
      await screen.findByTestId("order-id")
    ).toHaveTextContent("456");
  });
});
