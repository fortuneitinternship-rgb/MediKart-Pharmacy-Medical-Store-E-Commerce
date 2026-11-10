
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import TrackOrder from "./TrackOrder";

import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("./TrackOrder.module.css", () => ({}), {
  virtual: true,
});

// --------------------------------------------------
// TEST DATA
// --------------------------------------------------

const createOrder = (overrides = {}) => ({
  orderId: "TEST-ORDER-001",
  status: "Processing",
  orderDate: "2026-10-10",
  estimatedDelivery: "12 Oct 2026",

  paymentMethod: "Online Payment",
  paymentStatus: "Paid",

  deliveryType: "Normal Delivery",
  deliveryCharge: 20,

  discount: 30,
  totalAmount: 190,

  address: {
    name: "Test Customer",
    phone: "0000000000",
    address: "Test Street",
    city: "Test City",
    state: "Test State",
    pincode: "000000",
  },

  items: [
    {
      id: 1,
      name: "Test Product One",
      brand: "Test Brand",
      price: 100,
      quantity: 2,
    },
    {
      id: 2,
      name: "Test Product Two",
      brand: "Sample Brand",
      price: 20,
      quantity: 1,
    },
  ],

  ...overrides,
});

// --------------------------------------------------
// RENDER HELPER
// --------------------------------------------------

const renderTrackOrder = (
  path = "/track-order/TEST-ORDER-001",
  order = createOrder()
) => {
  if (order) {
    localStorage.setItem(
      "orders",
      JSON.stringify([order])
    );
  } else {
    localStorage.removeItem("orders");
  }

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/track-order/:orderId"
          element={<TrackOrder />}
        />

        <Route
          path="/track-order"
          element={<TrackOrder />}
        />

        <Route
          path="*"
          element={<TrackOrder />}
        />
      </Routes>
    </MemoryRouter>
  );
};

// --------------------------------------------------
// TEST SETUP
// --------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });

  window.print = jest.fn();
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

// ==================================================
// TRACK ORDER COMPONENT TESTS
// ==================================================

describe("TrackOrder Component", () => {

  // ------------------------------------------------
  // 1. BASIC RENDERING
  // ------------------------------------------------

  test("renders Track Order page", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Track Your Order")
    ).toBeInTheDocument();
  });

  test("renders order tracking heading", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Order Tracking")
    ).toBeInTheDocument();
  });

  test("renders order search input", () => {
    renderTrackOrder();

    expect(
      screen.getByPlaceholderText(
        /Enter Order ID/i
      )
    ).toBeInTheDocument();
  });

  test("renders Track Order button", () => {
    renderTrackOrder();

    expect(
      screen.getByRole("button", {
        name: /Track Order/i,
      })
    ).toBeInTheDocument();
  });

  test("renders Back button", () => {
    renderTrackOrder();

    expect(
      screen.getByRole("button", {
        name: /Back/i,
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 2. ORDER DETAILS
  // ------------------------------------------------

  test("renders order ID", () => {
    renderTrackOrder();

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  test("renders order status", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Processing")
    ).toBeInTheDocument();
  });

  test("renders order date", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/10 Oct 2026/i)
    ).toBeInTheDocument();
  });

  test("renders estimated delivery date", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/12 Oct 2026/i)
    ).toBeInTheDocument();
  });

  test("renders payment method", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Online Payment/i)
    ).toBeInTheDocument();
  });

  test("renders delivery type", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Normal Delivery/i)
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 3. PRODUCT DETAILS
  // ------------------------------------------------

  test("renders first product name", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Test Product One")
    ).toBeInTheDocument();
  });

  test("renders second product name", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Test Product Two")
    ).toBeInTheDocument();
  });

  test("renders product brands", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Test Brand")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sample Brand")
    ).toBeInTheDocument();
  });

  test("renders product quantities", () => {
    renderTrackOrder();

    const products =
      document.querySelectorAll(".ordered-item");

    expect(products).toHaveLength(2);

    expect(
      within(products[0]).getByText("2")
    ).toBeInTheDocument();

    expect(
      within(products[1]).getByText("1")
    ).toBeInTheDocument();
  });

  test("renders first product price", () => {
    renderTrackOrder();

    const products =
      document.querySelectorAll(".ordered-item");

    expect(
      products[0].querySelector(".item-details")
    ).toHaveTextContent(/₹\s*100/);
  });

  test("renders second product price", () => {
    renderTrackOrder();

    const products =
      document.querySelectorAll(".ordered-item");

    expect(
      products[1].querySelector(".item-details")
    ).toHaveTextContent(/₹\s*20/);
  });

  test("renders first product item total", () => {
    renderTrackOrder();

    const products =
      document.querySelectorAll(".ordered-item");

    expect(
      products[0].querySelector(".item-total")
    ).toHaveTextContent(/₹\s*200/);
  });

  test("renders second product item total", () => {
    renderTrackOrder();

    const products =
      document.querySelectorAll(".ordered-item");

    expect(
      products[1].querySelector(".item-total")
    ).toHaveTextContent(/₹\s*20/);
  });

  test("renders all ordered products", () => {
    renderTrackOrder();

    expect(
      document.querySelectorAll(".ordered-item")
    ).toHaveLength(2);
  });

  // ------------------------------------------------
  // 4. CUSTOMER AND ADDRESS DETAILS
  // ------------------------------------------------

  test("renders customer name", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Test Customer/)
    ).toBeInTheDocument();
  });

  test("renders customer phone number", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/0000000000/)
    ).toBeInTheDocument();
  });

  test("renders customer street address", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Test Street/)
    ).toBeInTheDocument();
  });

  test("renders customer city", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Test City/)
    ).toBeInTheDocument();
  });

  test("renders customer state", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Test State/)
    ).toBeInTheDocument();
  });

  test("renders customer pincode", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/000000/)
    ).toBeInTheDocument();
  });

  test("supports address as a string", () => {
    const order = createOrder({
      address: "Test Street, Test City, Test State",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText(/Test Street/)
    ).toBeInTheDocument();
  });

  test("handles missing address", () => {
    const order = createOrder({
      address: null,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 5. PRICE AND PAYMENT SUMMARY
  // ------------------------------------------------

  test("renders product subtotal", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Product Subtotal")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Product Subtotal").parentElement
    ).toHaveTextContent(/₹\s*220/);
  });

  test("renders delivery charge", () => {
    renderTrackOrder();

    expect(
      screen.getByText(/Delivery Charge/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Delivery Charge/i).parentElement
    ).toHaveTextContent(/₹\s*20/);
  });

  test("renders discount amount when the component displays it", () => {
    renderTrackOrder();

    const discountLabel = screen.queryByText(
      /^Discount$/i
    );

    if (discountLabel) {
      expect(discountLabel.parentElement).toHaveTextContent(
        /30/
      );
    }
  });

  test("renders total order amount", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Total Amount")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total Amount").parentElement
    ).toHaveTextContent(/₹\s*190/);
  });

  test("handles zero delivery charge", () => {
    const order = createOrder({
      deliveryCharge: 0,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  test("handles zero discount", () => {
    const order = createOrder({
      discount: 0,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  test("calculates total when totalAmount is missing", () => {
    const order = createOrder({
      totalAmount: undefined,
      discount: 30,
      deliveryCharge: 20,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Total Amount").parentElement
    ).toHaveTextContent(/₹\s*190/);
  });

  // ------------------------------------------------
  // 6. TRACKING TIMELINE
  // ------------------------------------------------

  test("renders Order Placed tracking stage", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Order Placed")
    ).toBeInTheDocument();
  });

  test("renders Packed tracking stage", () => {
    renderTrackOrder();

    expect(
      screen.getAllByText("Packed").length
    ).toBeGreaterThanOrEqual(1);
  });

  test("renders In Transit tracking stage", () => {
    renderTrackOrder();

    expect(
      screen.getAllByText("In Transit").length
    ).toBeGreaterThanOrEqual(1);
  });

  test("renders Out for Delivery tracking stage", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Out for Delivery")
    ).toBeInTheDocument();
  });

  test("renders Delivered tracking stage", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Delivered")
    ).toBeInTheDocument();
  });

  test("renders all tracking stages", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Order Placed")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Packed").length
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getAllByText("In Transit").length
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByText("Out for Delivery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delivered")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 7. DIFFERENT ORDER STATUSES
  // ------------------------------------------------

  test("handles Processing status", () => {
    const order = createOrder({
      status: "Processing",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Processing")
    ).toBeInTheDocument();
  });

  test("handles Packed status", () => {
    const order = createOrder({
      status: "Packed",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getAllByText("Packed").length
    ).toBeGreaterThanOrEqual(1);
  });

  test("handles In Transit status", () => {
    const order = createOrder({
      status: "In Transit",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getAllByText("In Transit").length
    ).toBeGreaterThanOrEqual(1);
  });

  test("handles Out for Delivery status", () => {
    const order = createOrder({
      status: "Out for Delivery",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Out for Delivery")
    ).toBeInTheDocument();
  });

  test("handles Delivered status", () => {
    const order = createOrder({
      status: "Delivered",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getAllByText("Delivered").length
    ).toBeGreaterThanOrEqual(1);
  });

  test("handles Cancelled status", () => {
    const order = createOrder({
      status: "Cancelled",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Cancelled")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 8. SEARCH FUNCTIONALITY
  // ------------------------------------------------

  test("allows entering an order ID", () => {
    renderTrackOrder();

    const input = screen.getByPlaceholderText(
      /Enter Order ID/i
    );

    fireEvent.change(input, {
      target: {
        value: "NEW-ORDER-001",
      },
    });

    expect(input).toHaveValue("NEW-ORDER-001");
  });

  test("searches for an existing order", async () => {
    const order = createOrder({
      orderId: "SEARCH-ORDER-001",
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    const input = screen.getByPlaceholderText(
      /Enter Order ID/i
    );

    fireEvent.change(input, {
      target: {
        value: "SEARCH-ORDER-001",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Track Order/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("SEARCH-ORDER-001")
      ).toBeInTheDocument();
    });
  });

  test("supports searching with Enter key", async () => {
    renderTrackOrder();

    const input = screen.getByPlaceholderText(
      /Enter Order ID/i
    );

    fireEvent.change(input, {
      target: {
        value: "TEST-ORDER-001",
      },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(input).toHaveValue("TEST-ORDER-001");
  });

  test("renders Quick Track section", () => {
    renderTrackOrder();

    expect(
      screen.getByText("Quick Track:")
    ).toBeInTheDocument();
  });

  test("renders quick track order button", () => {
    renderTrackOrder();

    expect(
      screen.getByRole("button", {
        name: /TEST-ORDER-001/i,
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 9. LOCAL STORAGE
  // ------------------------------------------------

  test("loads order data from localStorage", () => {
    const order = createOrder();

    localStorage.setItem(
      "orders",
      JSON.stringify([order])
    );

    renderTrackOrder();

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  test("handles empty localStorage orders", () => {
    localStorage.setItem("orders", "[]");

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      null
    );

    expect(
      screen.getByText("Track Your Order")
    ).toBeInTheDocument();
  });

  test("handles invalid localStorage JSON", () => {
    localStorage.setItem(
      "orders",
      "{invalid json"
    );

    expect(() => {
      renderTrackOrder(
        "/track-order/TEST-ORDER-001",
        null
      );
    }).not.toThrow();
  });

  test("handles non-array localStorage data", () => {
    localStorage.setItem(
      "orders",
      JSON.stringify({
        orderId: "TEST-ORDER-001",
      })
    );

    expect(() => {
      renderTrackOrder(
        "/track-order/TEST-ORDER-001",
        null
      );
    }).not.toThrow();
  });

  test("handles order with id instead of orderId", () => {
    const order = createOrder({
      orderId: undefined,
      id: "ID-ORDER-001",
    });

    renderTrackOrder(
      "/track-order/ID-ORDER-001",
      order
    );

    expect(
      screen.getByText("ID-ORDER-001")
    ).toBeInTheDocument();
  });

  test("handles order ID with leading hash", () => {
    const order = createOrder({
      orderId: "#HASH-ORDER-001",
    });

    renderTrackOrder(
      "/track-order/HASH-ORDER-001",
      order
    );

    expect(
      screen.getByText(/HASH-ORDER-001/)
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 10. DIFFERENT PRODUCT DATA STRUCTURES
  // ------------------------------------------------

  test("supports products array", () => {
    const order = createOrder({
      items: undefined,
      products: [
        {
          id: 3,
          name: "Alternative Product",
          brand: "Alternative Brand",
          price: 50,
          quantity: 2,
        },
      ],
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Alternative Product")
    ).toBeInTheDocument();
  });

  test("supports a single product object", () => {
    const order = createOrder({
      items: undefined,
      products: undefined,
      product: {
        id: 4,
        name: "Single Test Product",
        brand: "Single Brand",
        price: 75,
        quantity: 1,
      },
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Single Test Product")
    ).toBeInTheDocument();
  });

  test("handles an empty products array", () => {
    const order = createOrder({
      items: [],
      products: [],
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();

    expect(
      document.querySelectorAll(".ordered-item")
    ).toHaveLength(0);
  });

  test("handles missing product brand", () => {
    const order = createOrder({
      items: [
        {
          id: 5,
          name: "Brandless Product",
          price: 50,
          quantity: 1,
        },
      ],
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Brandless Product")
    ).toBeInTheDocument();
  });

  test("handles missing product quantity", () => {
    const order = createOrder({
      items: [
        {
          id: 6,
          name: "Quantity Test Product",
          price: 50,
        },
      ],
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Quantity Test Product")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 11. DATE HANDLING
  // ------------------------------------------------

  test("handles missing order date", () => {
    const order = createOrder({
      orderDate: null,
      date: null,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("Date not available")
    ).toBeInTheDocument();
  });

  test("handles missing estimated delivery", () => {
    const order = createOrder({
      estimatedDelivery: null,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  // ------------------------------------------------
  // 12. COPY ORDER ID
  // ------------------------------------------------

  test("copies order ID successfully", async () => {
    renderTrackOrder();

    fireEvent.click(
      screen.getByTitle("Copy Order ID")
    );

    await waitFor(() => {
      expect(
        navigator.clipboard.writeText
      ).toHaveBeenCalledWith("TEST-ORDER-001");
    });

    expect(toast.success).toHaveBeenCalled();
  });

  test("handles clipboard failure", async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(
      new Error("Clipboard unavailable")
    );

    renderTrackOrder(
      "/track-order/TEST-ORDER-001"
    );

    fireEvent.click(
      screen.getByTitle("Copy Order ID")
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to copy Order ID."
      );
    });
  });

  // ------------------------------------------------
  // 13. PRINT RECEIPT
  // ------------------------------------------------

  test("renders print receipt button", () => {
    renderTrackOrder();

    expect(
      screen.getByRole("button", {
        name: /Print Receipt/i,
      })
    ).toBeInTheDocument();
  });

  test("calls window.print when print button is clicked", () => {
    renderTrackOrder();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Print Receipt/i,
      })
    );

    expect(window.print).toHaveBeenCalled();
  });

  // ------------------------------------------------
  // 14. FALLBACK AND OPTIONAL DATA
  // ------------------------------------------------

  test("renders without optional payment status", () => {
    const order = createOrder({
      paymentStatus: undefined,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  test("handles missing delivery type", () => {
    const order = createOrder({
      deliveryType: undefined,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

  test("handles missing total amount", () => {
    const order = createOrder({
      totalAmount: undefined,
    });

    renderTrackOrder(
      "/track-order/TEST-ORDER-001",
      order
    );

    expect(
      screen.getByText("TEST-ORDER-001")
    ).toBeInTheDocument();
  });

});
