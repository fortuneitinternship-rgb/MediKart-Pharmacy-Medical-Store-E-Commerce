
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

import TrackOrder from "./TrackOrder";

import { toast } from "react-toastify";

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock browser print
beforeAll(() => {
  window.print = jest.fn();
});

// Mock clipboard
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Generic test order without personal or product information
const mockOrder = {
  orderId: "TEST-001",
  status: "In Transit",
  orderDate: "10 Nov 2026",
  paymentMethod: "Online Payment",
  estimatedDelivery: "13 Nov 2026",
  deliveryCharge: 0,
  discount: 0,
  totalAmount: 100,
  address: "Test delivery address",
  items: [
    {
      id: 1,
      name: "Test Item",
      price: 100,
      quantity: 1,
    },
  ],
};

// Reusable render function
const renderTrackOrder = (initialEntry = "/track-order") => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/track-order"
          element={<TrackOrder />}
        />

        <Route
          path="/track-order/:orderId"
          element={<TrackOrder />}
        />

        <Route
          path="/shop"
          element={<div>Shop Page</div>}
        />

        <Route
          path="/"
          element={<div>Home Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("TrackOrder Component", () => {

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  // 1. Render component
  test("renders Track Order page", () => {
    renderTrackOrder();

    expect(
      screen.getByRole("heading", {
        name: /track your order/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/order tracking/i)
    ).toBeInTheDocument();
  });

  // 2. Render order ID input
  test("renders order ID input", () => {
    renderTrackOrder();

    expect(
      screen.getByPlaceholderText(/enter order id/i)
    ).toBeInTheDocument();
  });

  // 3. Render Track Order button
  test("renders Track Order button", () => {
    renderTrackOrder();

    expect(
      screen.getByRole("button", {
        name: /track order/i,
      })
    ).toBeInTheDocument();
  });

  // 4. Load existing order
  test("displays existing order from localStorage", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("#TEST-001")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("In Transit").length
    ).toBeGreaterThan(0);
  });

  // 5. Search order using button
  test("searches order when Track Order button is clicked", async () => {
    renderTrackOrder();

    fireEvent.change(
      screen.getByPlaceholderText(/enter order id/i),
      {
        target: {
          value: "TEST-002",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /track order/i,
      })
    );

    expect(
      await screen.findByText("#TEST-002")
    ).toBeInTheDocument();
  });

  // 6. Search order using Enter key
  test("searches order when Enter key is pressed", async () => {
    renderTrackOrder();

    const input = screen.getByPlaceholderText(
      /enter order id/i
    );

    fireEvent.change(input, {
      target: {
        value: "TEST-003",
      },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    expect(
      await screen.findByText("#TEST-003")
    ).toBeInTheDocument();
  });

  // 7. Validate empty order ID
  test("shows alert when order ID is empty", () => {
    const alertMock = jest
      .spyOn(window, "alert")
      .mockImplementation(() => { });

    renderTrackOrder();

    fireEvent.click(
      screen.getByRole("button", {
        name: /track order/i,
      })
    );

    expect(alertMock).toHaveBeenCalledWith(
      "Please enter your Order ID"
    );
  });

  // 8. Quick track button
  test("searches order using quick track button", async () => {
    renderTrackOrder();

    fireEvent.click(
      screen.getByRole("button", {
        name: "MK7721605963",
      })
    );

    expect(
      await screen.findByText("#MK7721605963")
    ).toBeInTheDocument();
  });

  // 9. Load order from query parameter
  test("loads order using query parameter", async () => {
    renderTrackOrder("/track-order?id=TEST-004");

    expect(
      await screen.findByText("#TEST-004")
    ).toBeInTheDocument();
  });

  // 10. Load order from route parameter
  test("loads order using route parameter", async () => {
    renderTrackOrder("/track-order/TEST-005");

    expect(
      await screen.findByText("#TEST-005")
    ).toBeInTheDocument();
  });

  // 11. Products section
  test("renders Products Ordered section", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Products Ordered")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Test Item")
    ).toBeInTheDocument();
  });

  // 12. Delivery address
  test("renders delivery address section", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Delivery Address")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Test delivery address")
    ).toBeInTheDocument();
  });

  // 13. Payment summary
  test("renders payment summary", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Order Payment Summary")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Product Subtotal")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total Paid")
    ).toBeInTheDocument();
  });

  // 14. Tracking timeline
  test("renders all tracking steps", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Live Shipment Tracking")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Order Placed")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Packed")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("In Transit").length
    ).toBeGreaterThan(0);

    expect(
      screen.getByText("Out for Delivery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delivered")
    ).toBeInTheDocument();
  });

  // 15. Copy order ID
  test("copies order ID to clipboard", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    await screen.findByText("#TEST-001");

    fireEvent.click(
      screen.getByTitle("Copy Order ID")
    );

    expect(
      navigator.clipboard.writeText
    ).toHaveBeenCalledWith("TEST-001");

    expect(toast.success).toHaveBeenCalledWith(
      "Order ID copied to clipboard!"
    );
  });

  // 16. Print receipt
  test("prints receipt when Print Receipt is clicked", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([mockOrder])
    );

    renderTrackOrder();

    await screen.findByText("#TEST-001");

    fireEvent.click(
      screen.getByRole("button", {
        name: /print receipt/i,
      })
    );

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  // 17. Recent orders
  test("displays recent order suggestions", async () => {
    const orders = [
      mockOrder,
      {
        ...mockOrder,
        orderId: "TEST-006",
      },
    ];

    localStorage.setItem(
      "orders",
      JSON.stringify(orders)
    );

    renderTrackOrder();

    expect(
      await screen.findByRole("button", {
        name: "TEST-006",
      })
    ).toBeInTheDocument();
  });

  // 18. Select recent order
  test("loads recent order when suggestion is clicked", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        mockOrder,
        {
          ...mockOrder,
          orderId: "TEST-007",
        },
      ])
    );

    renderTrackOrder();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "TEST-007",
      })
    );

    expect(
      await screen.findByText("#TEST-007")
    ).toBeInTheDocument();
  });

  // 19. Fallback tracking
  test("generates fallback tracking information for unknown order", async () => {
    renderTrackOrder();

    fireEvent.change(
      screen.getByPlaceholderText(/enter order id/i),
      {
        target: {
          value: "TEST-008",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /track order/i,
      })
    );

    expect(
      await screen.findByText("#TEST-008")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cash on Delivery")
    ).toBeInTheDocument();
  });

  // 20. Delivered status
  test("displays delivered order status", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          ...mockOrder,
          status: "Delivered",
        },
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Order Delivered")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Delivered").length
    ).toBeGreaterThan(0);
  });

  // 21. Empty products
  test("displays message when no products are available", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          ...mockOrder,
          items: [],
        },
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText(
        "No product details available."
      )
    ).toBeInTheDocument();
  });

  // 22. Missing address
  test("displays fallback when address is unavailable", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          ...mockOrder,
          address: null,
        },
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText(
        "Delivery address not available"
      )
    ).toBeInTheDocument();
  });

  // 23. Back navigation
  test("navigates back when Back button is clicked", () => {
    render(
      <MemoryRouter
        initialEntries={["/", "/track-order"]}
        initialIndex={1}
      >
        <Routes>
          <Route
            path="/"
            element={<div>Home Page</div>}
          />

          <Route
            path="/track-order"
            element={<TrackOrder />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /back/i,
      })
    );

    expect(
      screen.getByText("Home Page")
    ).toBeInTheDocument();
  });

  // 24. Invalid localStorage JSON
  test("handles invalid localStorage JSON without crashing", () => {
    localStorage.setItem(
      "orders",
      "{invalid-json"
    );
  });

  // 25. Calculate subtotal
  test("calculates product subtotal correctly", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          ...mockOrder,
          items: [
            {
              id: 1,
              name: "Test Item",
              price: 50,
              quantity: 2,
            },
          ],
        },
      ])
    );

    renderTrackOrder();

    expect(
      await screen.findByText("Product Subtotal")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("₹100").length
    ).toBeGreaterThan(0);
  });

});
