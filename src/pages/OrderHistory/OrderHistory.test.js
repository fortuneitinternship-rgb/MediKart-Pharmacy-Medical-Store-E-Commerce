
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";

import OrderHistory from "./OrderHistory";

import { getProducts } from "../../api/productApi";
import { getProductImage } from "../../utils/productImage";
import { syncOrdersFromServer } from "../../utils/orders";

jest.mock("../../api/productApi", () => ({
  getProducts: jest.fn(),
}));

jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(),
}));

jest.mock("../../utils/orders", () => ({
  syncOrdersFromServer: jest.fn(),
}));

jest.mock("react-icons/fa", () => ({
  FaBox: () => <span data-testid="box-icon" />,
  FaCalendarAlt: () => <span data-testid="calendar-icon" />,
  FaCheckCircle: () => <span data-testid="check-icon" />,
  FaTruck: () => <span data-testid="truck-icon" />,
  FaImage: () => <span data-testid="image-icon" />,
}));

const sampleOrders = [
  {
    id: "ORDER-001",
    status: "Delivered",
    orderDate: "2026-01-15",
    totalAmount: 200,
    paymentMethod: "COD",
    items: [
      {
        id: 1,
        name: "Item",
        price: 100,
        quantity: 2,
        image: "/test-image.png",
      },
    ],
  },
];

const setup = async (orders = sampleOrders) => {
  localStorage.setItem("orders", JSON.stringify(orders));

  getProducts.mockResolvedValue([]);
  syncOrdersFromServer.mockResolvedValue(undefined);
  getProductImage.mockImplementation(
    (image) => image || "/placeholder.png"
  );

  render(<OrderHistory />);

  await waitFor(() => {
    expect(getProducts).toHaveBeenCalled();
  });
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  window.confirm = jest.fn();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("OrderHistory Component", () => {
  test("renders the order history heading", async () => {
    await setup();

    expect(
      screen.getByRole("heading", { name: /order history/i })
    ).toBeInTheDocument();
  });

  test("renders the page description", async () => {
    await setup();

    expect(
      screen.getByText(/view all your previous/i)
    ).toBeInTheDocument();
  });

  test("loads orders from localStorage", async () => {
    await setup();

    expect(
      await screen.findByText("Order #ORDER-001")
    ).toBeInTheDocument();
  });

  test("shows the empty state when there are no orders", async () => {
    await setup([]);

    expect(
      screen.getByRole("heading", { name: /no orders yet/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/you haven't placed any orders yet/i)
    ).toBeInTheDocument();
  });

  test("does not show the clear history button when empty", async () => {
    await setup([]);

    expect(
      screen.queryByRole("button", { name: /clear history/i })
    ).not.toBeInTheDocument();
  });

  test("shows the start shopping button when empty", async () => {
    await setup([]);

    expect(
      screen.getByRole("button", { name: /start shopping/i })
    ).toBeInTheDocument();
  });

  test("shows the clear history button when orders exist", async () => {
    await setup();

    expect(
      screen.getByRole("button", { name: /clear history/i })
    ).toBeInTheDocument();
  });

  test("displays the order status", async () => {
    await setup();

    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  test("displays the order date", async () => {
    await setup();

    expect(screen.getByText(/15 January 2026/i)).toBeInTheDocument();
  });

  test("displays the item name", async () => {
    await setup();

    expect(screen.getByRole("heading", { name: "Item" }))
      .toBeInTheDocument();
  });

  test("displays item quantity", async () => {
    await setup();

    expect(screen.getByText(/quantity:/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("displays the item price", async () => {
    await setup();

    expect(screen.getByText("₹100")).toBeInTheDocument();
  });

  test("displays the order total", async () => {
    await setup();

    expect(screen.getByText("₹200")).toBeInTheDocument();
  });

  test("displays the payment method", async () => {
    await setup();

    expect(screen.getByText("COD")).toBeInTheDocument();
  });

  test("loads product catalog data", async () => {
    getProducts.mockResolvedValue([
      {
        id: 1,
        name: "Item",
        image: "/catalog-image.png",
        price: 100,
        brand: "Generic",
        category: "General",
      },
    ]);

    localStorage.setItem("orders", JSON.stringify([
      {
        id: "ORDER-002",
        items: [{ product_id: 1, quantity: 1 }],
      },
    ]));

    syncOrdersFromServer.mockResolvedValue(undefined);
    getProductImage.mockImplementation(
      (image) => image || "/placeholder.png"
    );

    render(<OrderHistory />);

    expect(
      await screen.findByRole("heading", { name: "Item" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalled();
    });

    expect(getProductImage).toHaveBeenCalled();
  });

  test("handles products returned inside the data property", async () => {
    getProducts.mockResolvedValue({
      data: [{ id: 1, name: "Item", image: "/item.png" }],
    });

    await setup();

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalled();
    });
  });

  test("handles product catalog loading failure", async () => {
    const error = new Error("Catalog error");
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    getProducts.mockRejectedValue(error);

    await setup();

    consoleSpy.mockRestore();
  });

  test("handles order synchronization", async () => {
    await setup();

    await waitFor(() => {
      expect(syncOrdersFromServer).toHaveBeenCalled();
    });
  });

  test("handles order synchronization failure", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    syncOrdersFromServer.mockRejectedValue(
      new Error("Synchronization error")
    );

    await setup();

    consoleSpy.mockRestore();
  });

  test("updates the order list when ordersUpdated is dispatched", async () => {
    await setup();

    const updatedOrders = [
      {
        id: "ORDER-003",
        status: "Processing",
        totalAmount: 300,
        items: [],
      },
    ];

    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

    fireEvent(window, new Event("ordersUpdated"));

    expect(
      await screen.findByText("Order #ORDER-003")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Order #ORDER-001")
    ).not.toBeInTheDocument();
  });

  test("clears order history when confirmation is accepted", async () => {
    await setup();

    window.confirm.mockReturnValue(true);

    fireEvent.click(
      screen.getByRole("button", { name: /clear history/i })
    );

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(localStorage.getItem("orders")).toBeNull();
    });

    expect(
      screen.getByRole("heading", { name: /no orders yet/i })
    ).toBeInTheDocument();
  });

  test("does not clear order history when confirmation is cancelled", async () => {
    await setup();

    window.confirm.mockReturnValue(false);

    fireEvent.click(
      screen.getByRole("button", { name: /clear history/i })
    );

    expect(localStorage.getItem("orders")).not.toBeNull();

    expect(
      screen.getByText("Order #ORDER-001")
    ).toBeInTheDocument();
  });

  test("handles invalid JSON in localStorage", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    localStorage.setItem("orders", "{invalid-json");

    getProducts.mockResolvedValue([]);
    syncOrdersFromServer.mockResolvedValue(undefined);

    render(<OrderHistory />);

    expect(
      await screen.findByRole("heading", { name: /no orders yet/i })
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("handles an invalid order date", async () => {
    await setup([
      {
        id: "ORDER-004",
        date: "invalid-date",
        items: [],
      },
    ]);

    expect(screen.getByText("invalid-date")).toBeInTheDocument();
  });

  test("handles a missing order date", async () => {
    await setup([
      {
        id: "ORDER-005",
        items: [],
      },
    ]);

    expect(
      screen.getByText("Date not available")
    ).toBeInTheDocument();
  });

  test("handles an order without an explicit total", async () => {
    await setup([
      {
        id: "ORDER-006",
        items: [
          { name: "Item", price: 50, quantity: 2 },
        ],
      },
    ]);

    expect(screen.getByText("₹100")).toBeInTheDocument();
  });

  test("handles orders stored using the products property", async () => {
    await setup([
      {
        id: "ORDER-007",
        products: [
          {
            name: "Item",
            price: 75,
            quantity: 1,
          },
        ],
      },
    ]);

    expect(
      screen.getByRole("heading", { name: "Item" })
    ).toBeInTheDocument();
  });

  test("handles an order stored with a single product", async () => {
    await setup([
      {
        id: "ORDER-008",
        product: {
          name: "Item",
          price: 80,
          quantity: 1,
        },
      },
    ]);

    expect(
      screen.getByRole("heading", { name: "Item" })
    ).toBeInTheDocument();
  });

  test("shows the image placeholder when image is unavailable", async () => {
    getProductImage.mockReturnValue("");

    await setup();

  });

  test("shows the image when an image URL is available", async () => {
    await setup();

    const image = screen.getByRole("img", { name: "Item" });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.png");
  });

  test("shows the placeholder when an image fails to load", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    await setup();

    const image = screen.getByRole("img", { name: "Item" });

    fireEvent.error(image);

    expect(screen.getByTestId("image-icon")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test("uses the default status when status is missing", async () => {
    await setup([
      {
        id: "ORDER-009",
        items: [],
      },
    ]);

    expect(screen.getByText("Order Confirmed")).toBeInTheDocument();
  });

  test("renders a shipped status", async () => {
    await setup([
      {
        id: "ORDER-010",
        status: "Shipped",
        items: [],
      },
    ]);

    expect(screen.getByText("Shipped")).toBeInTheDocument();
  });

  test("renders a cancelled status", async () => {
    await setup([
      {
        id: "ORDER-011",
        status: "Cancelled",
        items: [],
      },
    ]);

    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  test("renders multiple orders", async () => {
    await setup([
      { id: "ORDER-012", items: [] },
      { id: "ORDER-013", items: [] },
    ]);

    expect(screen.getByText("Order #ORDER-012")).toBeInTheDocument();
    expect(screen.getByText("Order #ORDER-013")).toBeInTheDocument();
  });

  test("uses a fallback order ID when no ID exists", async () => {
    await setup([
      {
        items: [],
      },
    ]);

    expect(screen.getByText("Order #MED10000")).toBeInTheDocument();
  });
});
