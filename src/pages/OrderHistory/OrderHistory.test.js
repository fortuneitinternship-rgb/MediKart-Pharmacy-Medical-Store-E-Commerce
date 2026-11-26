
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";
import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import OrderHistory from "./OrderHistory";

import { getProducts } from "../../api/productApi";
import { getProductImage } from "../../utils/productImage";
import { syncOrdersFromServer } from "../../utils/orders";

/* ============================================================
   MOCK API AND UTILITIES
============================================================ */

vi.mock("../../api/productApi", () => ({
  getProducts: vi.fn(),
}));

vi.mock("../../utils/orders", () => ({
  syncOrdersFromServer: vi.fn(),
}));

vi.mock("../../utils/productImage", () => ({
  getProductImage: vi.fn(
    (image) => image || "/fallback-product.png"
  ),
}));

/* ============================================================
   TEST DATA
============================================================ */

const mockProducts = [
  {
    id: 101,
    name: "Paracetamol",
    brand: "MediCare",
    category: "Medicines",
    price: 99,
    image: "/images/paracetamol.png",
  },
  {
    id: 102,
    name: "Vitamin C",
    brand: "HealthPlus",
    category: "Vitamins",
    price: 249,
    image: "/images/vitamin-c.png",
  },
];

const mockOrders = [
  {
    id: 5001,
    order_id: "MED5001",
    status: "Delivered",
    created_at: "2026-11-15T12:00:00",
    payment_method: "Cash on Delivery",
    total_amount: 447,
    items: [
      {
        product_id: 101,
        name: "Paracetamol",
        quantity: 2,
        price: 99,
      },
      {
        product_id: 102,
        name: "Vitamin C",
        quantity: 1,
        price: 249,
      },
    ],
  },
];

/* ============================================================
   SETUP
============================================================ */

describe("OrderHistory Component", () => {
  beforeEach(() => {
    localStorage.clear();

    vi.clearAllMocks();

    getProducts.mockResolvedValue(mockProducts);

    syncOrdersFromServer.mockResolvedValue(undefined);

    localStorage.setItem(
      "orders",
      JSON.stringify(mockOrders)
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  /* ========================================================
     1. RENDER COMPONENT
  ======================================================== */

  test("renders Order History heading", () => {
    render(<OrderHistory />);

    expect(
      screen.getByRole("heading", {
        name: /order history/i,
      })
    ).toBeInTheDocument();
  });

  /* ========================================================
     2. DISPLAY CUSTOMER ORDER INFORMATION
  ======================================================== */

  test("displays customer order information", async () => {
    render(<OrderHistory />);

    expect(
      await screen.findByText("Order #MED5001")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cash on Delivery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delivered")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total Amount")
    ).toBeInTheDocument();
  });

  /* ========================================================
     3. DISPLAY PRODUCT INFORMATION
  ======================================================== */

  test("displays product names, brands, prices and quantities", async () => {
    render(<OrderHistory />);

    expect(
      await screen.findByRole("heading", {
        name: "Paracetamol",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Vitamin C",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("MediCare")
    ).toBeInTheDocument();

    expect(
      screen.getByText("HealthPlus")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹99")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹249")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("2").length
    ).toBeGreaterThan(0);
  });

  /* ========================================================
     4. DISPLAY ORIGINAL PRODUCT IMAGES
  ======================================================== */

  test("displays correct product images from catalog", async () => {
    render(<OrderHistory />);

    const paracetamolImage =
      await screen.findByRole("img", {
        name: "Paracetamol",
      });

    const vitaminImage =
      screen.getByRole("img", {
        name: "Vitamin C",
      });

    expect(paracetamolImage).toHaveAttribute(
      "src",
      "/images/paracetamol.png"
    );

    expect(vitaminImage).toHaveAttribute(
      "src",
      "/images/vitamin-c.png"
    );
  });

  /* ========================================================
     5. LOAD PRODUCT CATALOG
  ======================================================== */

  test("calls getProducts to load product information", async () => {
    render(<OrderHistory />);

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalledTimes(1);
    });
  });

  /* ========================================================
     6. SYNC ORDERS FROM SERVER
  ======================================================== */

  test("synchronizes orders from server", async () => {
    render(<OrderHistory />);

    await waitFor(() => {
      expect(
        syncOrdersFromServer
      ).toHaveBeenCalledTimes(1);
    });
  });

  /* ========================================================
     7. EMPTY ORDER HISTORY
  ======================================================== */

  test("displays empty message when no orders exist", () => {
    localStorage.setItem("orders", "[]");

    render(<OrderHistory />);

    expect(
      screen.getByText("No Orders Yet")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "You haven't placed any orders yet."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Start Shopping",
      })
    ).toBeInTheDocument();
  });

  /* ========================================================
     8. CLEAR ORDER HISTORY
  ======================================================== */

  test("clears order history after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<OrderHistory />);

    const clearButton = await screen.findByRole(
      "button",
      {
        name: "Clear History",
      }
    );

    fireEvent.click(clearButton);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.getByText("No Orders Yet")
      ).toBeInTheDocument();
    });

    expect(
      localStorage.getItem("orders")
    ).toBeNull();
  });

  /* ========================================================
     9. CANCEL CLEAR HISTORY
  ======================================================== */

  test("does not clear orders when confirmation is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<OrderHistory />);

    const clearButton = await screen.findByRole(
      "button",
      {
        name: "Clear History",
      }
    );

    fireEvent.click(clearButton);

    expect(
      JSON.parse(localStorage.getItem("orders"))
    ).toHaveLength(1);

    expect(
      screen.getByText("Order #MED5001")
    ).toBeInTheDocument();
  });

  /* ========================================================
     10. INVALID LOCAL STORAGE DATA
  ======================================================== */

  test("handles invalid localStorage order data", () => {
    localStorage.setItem("orders", "invalid-json");

    render(<OrderHistory />);

    expect(
      screen.getByText("No Orders Yet")
    ).toBeInTheDocument();
  });

  /* ========================================================
     11. PRODUCT IMAGE FALLBACK
  ======================================================== */

  test("shows placeholder when product image is unavailable", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          id: 6001,
          order_id: "MED6001",
          items: [
            {
              product_id: 999,
              name: "Unknown Product",
              price: 100,
              quantity: 1,
            },
          ],
        },
      ])
    );

    getProducts.mockResolvedValue([]);

    getProductImage.mockReturnValue("");

    render(<OrderHistory />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Unknown Product",
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("img", {
        name: "Unknown Product",
      })
    ).not.toBeInTheDocument();
  });

  /* ========================================================
     12. IMAGE ERROR HANDLING
  ======================================================== */

  test("handles broken product image", async () => {
    render(<OrderHistory />);

    const productImage = await screen.findByRole(
      "img",
      {
        name: "Paracetamol",
      }
    );

    fireEvent.error(productImage);

    expect(
      screen.queryByRole("img", {
        name: "Paracetamol",
      })
    ).not.toBeInTheDocument();
  });

  /* ========================================================
     13. ORDER TOTAL
  ======================================================== */

  test("displays correct order total", async () => {
    render(<OrderHistory />);

    await screen.findByText("Order #MED5001");

    expect(
      screen.getByText("₹447")
    ).toBeInTheDocument();
  });

  /* ========================================================
     14. ORDER STATUS
  ======================================================== */

  test("displays correct order status", async () => {
    render(<OrderHistory />);

    expect(
      await screen.findByText("Delivered")
    ).toBeInTheDocument();
  });

  /* ========================================================
     15. ORDERS UPDATED EVENT
  ======================================================== */

  test("updates order history when ordersUpdated event fires", async () => {
    render(<OrderHistory />);

    await screen.findByText("Order #MED5001");

    const updatedOrders = [
      {
        id: 7001,
        order_id: "MED7001",
        status: "Processing",
        total_amount: 99,
        items: [
          {
            product_id: 101,
            name: "Paracetamol",
            price: 99,
            quantity: 1,
          },
        ],
      },
    ];

    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    await waitFor(() => {
      expect(
        screen.getByText("Order #MED7001")
      ).toBeInTheDocument();
    });
  });
});
