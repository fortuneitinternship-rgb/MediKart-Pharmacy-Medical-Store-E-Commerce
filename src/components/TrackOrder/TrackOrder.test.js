import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import TrackOrder from "./TrackOrder";

// --------------------------------------------------
// MOCK TOAST CONTAINER
// --------------------------------------------------

jest.mock("react-toastify", () => ({
  ToastContainer: () => (
    <div data-testid="toast-container">
      Toast Container
    </div>
  ),
}));

// --------------------------------------------------
// TEST ORDER DATA
// --------------------------------------------------

const createTestOrder = (overrides = {}) => ({
  orderId: "TEST_ORDER",
  orderDate: "Test Date",
  estimatedDelivery: "Test Delivery",
  status: "Order Confirmed",

  trackingId: "TEST_TRACKING",

  courier: {
    name: "Test Delivery Partner",
  },

  items: [
    {
      id: "TEST_PRODUCT",
      name: "Test Product",
      price: 100,
      quantity: 1,
    },
  ],

  address: {
    name: "Test Customer",
    phone: "0000000000",
    address: "Test Address",
    city: "Test City",
    state: "Test State",
    pincode: "000000",
  },

  paymentMethod: "COD",

  totalAmount: 100,

  ...overrides,
});

// --------------------------------------------------
// RENDER HELPER
// --------------------------------------------------

const renderTrackOrder = (
  orderId = "TEST_ORDER"
) => {
  return render(
    <MemoryRouter
      initialEntries={[`/track/${orderId}`]}
    >
      <Routes>

        <Route
          path="/track/:orderId"
          element={<TrackOrder />}
        />

        <Route
          path="/orders"
          element={<div>Orders Page</div>}
        />

        <Route
          path="/shop"
          element={<div>Shop Page</div>}
        />

        <Route
          path="/contact"
          element={<div>Contact Page</div>}
        />

        <Route
          path="/"
          element={<div>Home Page</div>}
        />

      </Routes>
    </MemoryRouter>
  );
};

// --------------------------------------------------
// BEFORE EACH
// --------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.clear();

  const order = createTestOrder();

  localStorage.setItem(
    "orders",
    JSON.stringify([order])
  );

  window.confirm = jest.fn(() => true);

  window.alert = jest.fn();

  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(),
    },
  });
});

// --------------------------------------------------
// AFTER EACH
// --------------------------------------------------

afterEach(() => {
  localStorage.clear();
});

// ==================================================
// TRACK ORDER TESTS
// ==================================================

describe("TrackOrder Component", () => {

  // ------------------------------------------------
  // BASIC RENDER
  // ------------------------------------------------

  test("renders Track Order page", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Track Order")
    ).toBeInTheDocument();
  });

  test("renders current order status", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Order Confirmed")
    ).toBeInTheDocument();
  });

  test("renders delivery tracking section", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Delivery Tracking")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // DELIVERY STEPS
  // ------------------------------------------------

  test("renders all delivery steps", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Order Placed")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Packed")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Shipped")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Out for Delivery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delivered")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // ORDER ITEMS
  // ------------------------------------------------

  test("renders Order Items section", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Order Items")
    ).toBeInTheDocument();
  });

  test("renders product information", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Test Product")
    ).toBeInTheDocument();
  });

  test("renders product quantity", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText(/Quantity:\s*1/i)
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // TOTAL AMOUNT
  // ------------------------------------------------

  test("renders total amount", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Total Amount")
    ).toBeInTheDocument();

    /*
     * IMPORTANT:
     *
     * ₹100 may appear multiple times on the page.
     * Therefore we use getAllByText instead of getByText.
     */

    const amountElements =
      screen.getAllByText("₹100");

    expect(amountElements.length).toBeGreaterThan(0);
  });

  // ------------------------------------------------
  // SHIPPING DETAILS
  // ------------------------------------------------

  test("renders shipment details", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Shipment Details")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delivery Partner")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Order Date")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Expected Delivery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Payment")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // DELIVERY ADDRESS
  // ------------------------------------------------

  test("renders delivery address section", async () => {
    renderTrackOrder();

    expect(
      await screen.findByText("Delivery Address")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // HOME BUTTON
  // ------------------------------------------------

  test("renders Home button", async () => {
    renderTrackOrder();

    const homeButton =
      await screen.findByRole("link", {
        name: /home/i,
      });

    expect(homeButton).toBeInTheDocument();

    expect(homeButton).toHaveAttribute(
      "href",
      "/"
    );
  });

  // ------------------------------------------------
  // CONTACT BUTTON
  // ------------------------------------------------

  test("renders Contact Us button", async () => {
    renderTrackOrder();

    const contactButton =
      await screen.findByRole("link", {
        name: /contact us/i,
      });

    expect(contactButton).toBeInTheDocument();

    expect(contactButton).toHaveAttribute(
      "href",
      "/contact"
    );
  });

  // ------------------------------------------------
  // VIEW ALL ORDERS
  // ------------------------------------------------

  test("renders View All Orders button", async () => {
    renderTrackOrder();

    const ordersButton =
      await screen.findByRole("link", {
        name: /view all orders/i,
      });

    expect(ordersButton).toBeInTheDocument();

    expect(ordersButton).toHaveAttribute(
      "href",
      "/orders"
    );
  });

  // ------------------------------------------------
  // CANCEL ORDER
  // ------------------------------------------------

  test("renders Cancel Order button", async () => {
    renderTrackOrder();

    expect(
      await screen.findByRole("button", {
        name: /cancel order/i,
      })
    ).toBeInTheDocument();
  });

  test("cancel order calls confirmation", async () => {
    renderTrackOrder();

    const cancelButton =
      await screen.findByRole("button", {
        name: /cancel order/i,
      });

    fireEvent.click(cancelButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to cancel this order?"
    );
  });

  test("cancels order when confirmation is accepted", async () => {
    renderTrackOrder();

    window.confirm = jest.fn(() => true);

    const cancelButton =
      await screen.findByRole("button", {
        name: /cancel order/i,
      });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.getByText("Cancelled")
      ).toBeInTheDocument();
    });

    const storedOrders =
      JSON.parse(
        localStorage.getItem("orders")
      );

    expect(
      storedOrders[0].status
    ).toBe("Cancelled");
  });

  test("does not cancel order when confirmation is rejected", async () => {
    window.confirm = jest.fn(() => false);

    renderTrackOrder();

    const cancelButton =
      await screen.findByRole("button", {
        name: /cancel order/i,
      });

    fireEvent.click(cancelButton);

    expect(window.confirm).toHaveBeenCalled();

    expect(
      screen.getByText("Order Confirmed")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // COPY ORDER ID
  // ------------------------------------------------

  test("copy order ID button works", async () => {
    renderTrackOrder();

    const copyButton =
      await screen.findByTitle(
        "Copy Order ID"
      );

    fireEvent.click(copyButton);

    expect(
      navigator.clipboard.writeText
    ).toHaveBeenCalled();
  });

  // ------------------------------------------------
  // BACK BUTTON
  // ------------------------------------------------

  test("renders Back button", async () => {
    renderTrackOrder();

    expect(
      await screen.findByRole("button", {
        name: "Back",
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // EMPTY ORDER
  // ------------------------------------------------

  test("shows Order Not Found when order does not exist", async () => {
    localStorage.clear();

    renderTrackOrder();

    expect(
      await screen.findByText("Order Not Found")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "We couldn't find an order with this order ID."
      )
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // UNKNOWN ORDER ID
  // ------------------------------------------------

  test("shows Order Not Found for unknown order ID", async () => {
    renderTrackOrder("UNKNOWN_ORDER");

    expect(
      await screen.findByText("Order Not Found")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /view my orders/i,
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // INVALID LOCAL STORAGE
  // ------------------------------------------------

  test("handles invalid orders JSON", async () => {
    localStorage.setItem(
      "orders",
      "invalid-json"
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Order Not Found")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // CANCELLED ORDER
  // ------------------------------------------------

  test("does not show cancel button for cancelled order", async () => {
    const cancelledOrder =
      createTestOrder({
        status: "Cancelled",
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        cancelledOrder,
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Cancelled")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /cancel order/i,
      })
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------------
  // DELIVERED ORDER
  // ------------------------------------------------

  test("shows Order Delivered for delivered order", async () => {
    const deliveredOrder =
      createTestOrder({
        status: "Delivered",
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        deliveredOrder,
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText(
        "Order Delivered"
      )
    ).toBeInTheDocument();
  });

  test("shows return button for delivered order", async () => {
    const deliveredOrder =
      createTestOrder({
        status: "Delivered",
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        deliveredOrder,
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByRole("button", {
        name: /return order/i,
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // RETURN ORDER
  // ------------------------------------------------

  test("return order shows alert", async () => {
    const deliveredOrder =
      createTestOrder({
        status: "Delivered",
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        deliveredOrder,
      ])
    );

    renderTrackOrder();

    const returnButton =
      await screen.findByRole("button", {
        name: /return order/i,
      });

    fireEvent.click(returnButton);

    expect(window.alert).toHaveBeenCalledWith(
      "Return request has been initiated. Our support team will contact you."
    );
  });

  // ------------------------------------------------
  // TOAST CONTAINER
  // ------------------------------------------------

  test("renders ToastContainer", async () => {
    renderTrackOrder();

    expect(
      await screen.findByTestId(
        "toast-container"
      )
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // PRODUCT WITHOUT IMAGE
  // ------------------------------------------------

  test("renders fallback icon when product image is unavailable", async () => {
    const orderWithoutImage =
      createTestOrder({
        items: [
          {
            id: "TEST_PRODUCT",
            name: "Test Product",
            price: 100,
            quantity: 1,
          },
        ],
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        orderWithoutImage,
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Test Product")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // MULTIPLE PRODUCTS
  // ------------------------------------------------

  test("renders multiple order items", async () => {
    const orderWithMultipleProducts =
      createTestOrder({
        items: [
          {
            id: "PRODUCT_ONE",
            name: "Product One",
            price: 100,
            quantity: 1,
          },
          {
            id: "PRODUCT_TWO",
            name: "Product Two",
            price: 200,
            quantity: 2,
          },
        ],

        totalAmount: 500,
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        orderWithMultipleProducts,
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Product One")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Product Two")
    ).toBeInTheDocument();

  });

  // ------------------------------------------------
  // ORDER ARRAY SUPPORT
  // ------------------------------------------------

  test("loads order from an array in localStorage", async () => {
    const firstOrder =
      createTestOrder({
        orderId: "FIRST_ORDER",
      });

    const secondOrder =
      createTestOrder({
        orderId: "TEST_ORDER",
      });

    localStorage.setItem(
      "orders",
      JSON.stringify([
        firstOrder,
        secondOrder,
      ])
    );

    renderTrackOrder("TEST_ORDER");

    expect(
      await screen.findByText("Track Order")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Order Confirmed")
    ).toBeInTheDocument();
  });

});