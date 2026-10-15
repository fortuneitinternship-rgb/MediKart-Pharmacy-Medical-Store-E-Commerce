
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Cart from "./Cart";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../../api/cartApi";

jest.mock("../../api/cartApi", () => ({
  getCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
}));

jest.mock("../../components/CartItem/CartItem", () => {
  return function MockCartItem({ item, onIncrease, onDecrease, onRemove }) {
    return (
      <div data-testid={`cart-item-${item.id}`}>
        <span>{item.name || item.title || `Product ${item.id}`}</span>
        <span data-testid={`quantity-${item.id}`}>{item.quantity}</span>

        <button onClick={() => onIncrease(item.id)}>
          Increase {item.id}
        </button>

        <button onClick={() => onDecrease(item.id)}>
          Decrease {item.id}
        </button>

        <button onClick={() => onRemove(item.id)}>
          Remove {item.id}
        </button>
      </div>
    );
  };
});

jest.mock("../../components/CartSummary/CartSummary", () => {
  return function MockCartSummary({
    totalItems,
    subtotal,
    discount,
    delivery,
    totalPrice,
  }) {
    return (
      <div data-testid="cart-summary">
        <span>Total items: {totalItems}</span>
        <span>Subtotal: {subtotal}</span>
        <span>Discount: {discount}</span>
        <span>Delivery: {delivery}</span>
        <span>Total: {totalPrice}</span>
      </div>
    );
  };
});

jest.mock("../../components/EmptyState/EmptyState", () => {
  return function MockEmptyState({ title, description, buttonText }) {
    return (
      <div data-testid="empty-state">
        <h2>{title}</h2>
        <p>{description}</p>
        <button>{buttonText}</button>
      </div>
    );
  };
});

const sampleCart = [
  {
    id: 1,
    cart_item_id: 101,
    product_id: 1,
    name: "Paracetamol",
    price: 100,
    quantity: 2,
    category: "Medicine",
  },
  {
    id: 2,
    cart_item_id: 102,
    product_id: 2,
    name: "Vitamin Tablets",
    price: 200,
    quantity: 1,
    category: "Medicine",
  },
];

describe("Cart component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Prevent cartUpdated events from triggering unexpected
    // additional API calls in these tests.
    getCart.mockResolvedValue(
      JSON.parse(JSON.stringify(sampleCart))
    );
    updateCartItem.mockResolvedValue({ message: "Updated" });
    removeCartItem.mockResolvedValue({ message: "Removed" });
  });

  test("shows loading state while cart is loading", () => {
    getCart.mockReturnValue(new Promise(() => {}));

    render(<Cart />);

    expect(screen.getByText("Loading cart...")).toBeInTheDocument();
  });

  test("loads and displays cart items", async () => {
    render(<Cart />);

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("Vitamin Tablets")).toBeInTheDocument();

    expect(getCart).toHaveBeenCalled();
    expect(screen.getByText("3 Items")).toBeInTheDocument();
  });

  test("calculates subtotal, discount, delivery, and total", async () => {
    render(<Cart />);

    await screen.findByText("Paracetamol");

    // 100 * 2 + 200 * 1 = 400
    // Discount = round(400 * 0.10) = 40
    // Delivery = 10 because subtotal is below 499
    // Total = 400 - 40 + 10 = 370
    expect(screen.getByText("Subtotal: 400")).toBeInTheDocument();
    expect(screen.getByText("Discount: 40")).toBeInTheDocument();
    expect(screen.getByText("Delivery: 10")).toBeInTheDocument();
    expect(screen.getByText("Total: 370")).toBeInTheDocument();
  });

  test("increases product quantity and calls update API", async () => {
    render(<Cart />);

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Increase 1" }));

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(101, 3);
    });
  });

  test("decreases product quantity and calls update API", async () => {
    render(<Cart />);

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Decrease 1" }));

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(101, 1);
    });
  });

  test("does not decrease quantity below one", async () => {
    getCart.mockResolvedValue([
      {
        id: 1,
        cart_item_id: 101,
        name: "Paracetamol",
        price: 100,
        quantity: 1,
      },
    ]);

    render(<Cart />);

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Decrease 1" }));

    expect(updateCartItem).not.toHaveBeenCalled();
  });

  test("removes product and calls remove API", async () => {
    render(<Cart />);

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Remove 1" }));

    await waitFor(() => {
      expect(removeCartItem).toHaveBeenCalledWith(101);
    });
  });

  test("shows empty-cart state when API returns no products", async () => {
    getCart.mockResolvedValue([]);

    render(<Cart />);

    expect(await screen.findByText("Your Cart is Empty")).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });

  test("falls back to local cart when API request fails", async () => {
    getCart.mockRejectedValue(new Error("Network error"));

    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          id: 9,
          name: "Local Product",
          price: 50,
          quantity: 1,
        },
      ])
    );

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Cart />);

    expect(await screen.findByText("Local Product")).toBeInTheDocument();

    consoleError.mockRestore();
  });

  test("saves cart changes to localStorage", async () => {
    render(<Cart />);

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Increase 1" }));

    await waitFor(() => {
      const savedCart = JSON.parse(localStorage.getItem("cart"));
      expect(savedCart.find((item) => item.id === 1).quantity).toBe(3);
    });
  });

  test("shows a synchronization error when quantity API fails", async () => {
    updateCartItem.mockRejectedValue(new Error("API unavailable"));

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Cart />);

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Increase 1" }));

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Quantity was updated locally, but server sync failed.");

    consoleError.mockRestore();
  });
});
