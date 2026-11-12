import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import OrderHistory from "./OrderHistory";

describe("OrderHistory", () => {
  beforeEach(() => {
    localStorage.clear();

    jest.spyOn(console, "error").mockImplementation(() => { });
    jest.spyOn(window, "confirm");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders Order History heading", () => {
    render(<OrderHistory />);

    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(
      screen.getByText("View all your previous MEDIKART orders.")
    ).toBeInTheDocument();
  });

  test("shows empty state when there are no orders", () => {
    render(<OrderHistory />);

    expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
    expect(
      screen.getByText("You haven't placed any orders yet.")
    ).toBeInTheDocument();
    expect(screen.getByText("Start Shopping")).toBeInTheDocument();
  });

  test("loads orders from localStorage", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          status: "Delivered",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText("Order #ORDER")).toBeInTheDocument();
    });

    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  test("shows Clear History button when orders exist", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Clear History")
    ).toBeInTheDocument();
  });

  test("clears order history after confirmation", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          items: [],
        },
      ])
    );

    window.confirm.mockReturnValue(true);

    render(<OrderHistory />);

    const clearButton = await screen.findByText("Clear History");

    fireEvent.click(clearButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to clear your order history?"
    );

    expect(localStorage.getItem("orders")).toBeNull();

    expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
  });

  test("does not clear order history when confirmation is cancelled", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          items: [],
        },
      ])
    );

    window.confirm.mockReturnValue(false);

    render(<OrderHistory />);

    const clearButton = await screen.findByText("Clear History");

    fireEvent.click(clearButton);

    expect(localStorage.getItem("orders")).not.toBeNull();
  });

  test("handles invalid localStorage data", async () => {
    localStorage.setItem("orders", "invalid-data");

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalled();
  });

  test("handles non-array order data", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify({
        orderId: "ORDER",
      })
    );

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
    });
  });

  test("shows Processing status by default", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Processing")
    ).toBeInTheDocument();
  });

  test("shows Shipped status", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          status: "Shipped",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Shipped")
    ).toBeInTheDocument();
  });

  test("shows Delivered status", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          status: "Delivered",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Delivered")
    ).toBeInTheDocument();
  });

  test("shows Out for Delivery status", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          status: "Out for Delivery",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Out for Delivery")
    ).toBeInTheDocument();
  });

  test("shows Cancelled status", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          status: "Cancelled",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Cancelled")
    ).toBeInTheDocument();
  });

  test("uses fallback order ID", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Order #MED10000")
    ).toBeInTheDocument();
  });

  test("uses order id when orderId is unavailable", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          id: "ORDER",
          items: [],
        },
      ])
    );

    render(<OrderHistory />);

    expect(
      await screen.findByText("Order #ORDER")
    ).toBeInTheDocument();
  });

  test("handles ordersUpdated event", async () => {
    render(<OrderHistory />);

    expect(screen.getByText("No Orders Yet")).toBeInTheDocument();

    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "ORDER",
          status: "Delivered",
          items: [],
        },
      ])
    );

    window.dispatchEvent(new Event("ordersUpdated"));

    await waitFor(() => {
      expect(
        screen.getByText("Order #ORDER")
      ).toBeInTheDocument();
    });
  });

  test("navigates to shop when Start Shopping is clicked", () => {
    const originalLocation = window.location;

    delete window.location;

    window.location = {
      href: "",
    };

    render(<OrderHistory />);

    fireEvent.click(screen.getByText("Start Shopping"));

    expect(window.location.href).toBe("/shop");

    window.location = originalLocation;
  });

  test("removes event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(
      window,
      "removeEventListener"
    );

    const { unmount } = render(<OrderHistory />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "ordersUpdated",
      expect.any(Function)
    );
  });
});
