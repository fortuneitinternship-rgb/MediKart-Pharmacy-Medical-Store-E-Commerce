import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TrackOrder from "./TrackOrder";

const mockOrders = [
  {
    id: "TEST-103",
    order_id: "TEST-103",
    status: "In Transit",
    total_amount: 500,
    items: [
      {
        id: 1,
        name: "Paracetamol",
        quantity: 2,
        price: 250,
      },
    ],
    address: {
      name: "Test Customer",
      address: "Test Street",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
    },
  },
  {
    id: "TEST-104",
    order_id: "TEST-104",
    status: "Delivered",
    total_amount: 300,
    items: [],
  },
  {
    id: "TEST-105",
    order_id: "TEST-105",
    status: "In Transit",
    total_amount: 400,
    items: [],
  },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <TrackOrder />
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();

  localStorage.setItem(
    "orders",
    JSON.stringify(mockOrders)
  );

  localStorage.setItem(
    "cart",
    JSON.stringify([])
  );

  localStorage.setItem(
    "wishlist",
    JSON.stringify([])
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("TrackOrder Component", () => {
  test("renders the tracking page heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /track your order/i,
      })
    ).toBeInTheDocument();
  });

  test("renders the order tracking search input", () => {
    renderComponent();

    expect(
      screen.getByPlaceholderText(
        /enter order id/i
      )
    ).toBeInTheDocument();
  });

  test("renders the Track Order button", () => {
    renderComponent();

    expect(
      screen.getByRole("button", {
        name: /track order/i,
      })
    ).toBeInTheDocument();
  });

  test("loads an order by its ID", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /test-103/i,
      })
    ).toBeInTheDocument();
  });

  test("displays the In Transit status without duplicate-query errors", () => {
    renderComponent();

    expect(
      screen.getAllByText(/in transit/i).length
    ).toBeGreaterThan(0);
  });

  test("loads a saved delivered order", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(
      /enter order id/i
    );

    fireEvent.change(input, {
      target: { value: "TEST-104" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /track order/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /test-104/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/delivered/i).length
    ).toBeGreaterThan(0);
  });

  test("allows entering an order ID", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(
      /enter order id/i
    );

    fireEvent.change(input, {
      target: { value: "TEST-105" },
    });

    expect(input).toHaveValue("TEST-105");
  });

  test("renders the quick tracking option", () => {
    renderComponent();

    expect(
      screen.getByRole("button", {
        name: /MK7721605963/i,
      })
    ).toBeInTheDocument();
  });

  test("renders order tracking information", () => {
    renderComponent();

    expect(
      screen.getByText(/order tracking/i)
    ).toBeInTheDocument();
  });

  test("renders tracking stages when available", () => {
    renderComponent();

    const stages = [
      "Order Placed",
      "Packed",
      "In Transit",
      "Out for Delivery",
      "Delivered",
    ];

    stages.forEach((stage) => {
      expect(
        screen.getAllByText(
          new RegExp(stage, "i")
        ).length
      ).toBeGreaterThan(0);
    });
  });

  test("renders the back button", () => {
    renderComponent();

    expect(
      screen.getByRole("button", {
        name: /back/i,
      })
    ).toBeInTheDocument();
  });

  test("does not crash when localStorage has no saved orders", () => {
    localStorage.removeItem("orders");

    expect(() => renderComponent()).not.toThrow();

    expect(
      screen.getByRole("heading", {
        name: /track your order/i,
      })
    ).toBeInTheDocument();
  });

  test("does not crash when saved orders contain invalid JSON", () => {
    localStorage.setItem("orders", "{invalid-json");

    expect(() => renderComponent()).not.toThrow();

    expect(
      screen.getByRole("heading", {
        name: /track your order/i,
      })
    ).toBeInTheDocument();
  });
});
