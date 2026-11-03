import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Cart from "./Cart";
import {
  getAccessToken,
  getCart,
  getCartErrorMessage,
  normalizeCartItem,
  removeCartItem,
  updateCartItem,
} from "../../api/cartApi";

jest.mock("../../api/cartApi", () => ({
  getAccessToken: jest.fn(),
  getCart: jest.fn(),
  normalizeCartItem: jest.fn((item) => item),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  getCartErrorMessage: jest.fn((error) => error.message),
}));

jest.mock("../../api/loginApi", () => ({
  logoutUser: jest.fn(),
}));

jest.mock("../../components/CartItem/CartItem", () => ({
  __esModule: true,
  default: ({ item, onIncrease, onDecrease, onRemove }) => (
    <div data-testid={`cart-item-${item.id}`}>
      <span>{item.name}</span>
      <span data-testid={`quantity-${item.id}`}>{item.quantity}</span>
      <button onClick={() => onIncrease(item.id)}>
        Increase {item.name}
      </button>
      <button onClick={() => onDecrease(item.id)}>
        Decrease {item.name}
      </button>
      <button onClick={() => onRemove(item.id)}>
        Remove {item.name}
      </button>
    </div>
  ),
}));

jest.mock("../../components/CartSummary/CartSummary", () => ({
  __esModule: true,
  default: ({ totalItems, subtotal, discount, delivery, totalPrice }) => (
    <div data-testid="cart-summary">
      <p>Items: {totalItems}</p>
      <p>Subtotal: ₹{subtotal}</p>
      <p>Discount: ₹{discount}</p>
      <p>Delivery: ₹{delivery}</p>
      <p>Total: ₹{totalPrice}</p>
    </div>
  ),
}));

jest.mock("../../components/EmptyState/EmptyState", () => ({
  __esModule: true,
  default: ({ title, description }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

const mockCart = [
  {
    id: 1,
    product_id: 101,
    name: "Paracetamol",
    quantity: 2,
    price: 90,
    category: "Medicine",
    _serverItem: true,
  },
];

const renderCart = () =>
  render(
    <MemoryRouter initialEntries={["/cart"]}>
      <Cart />
    </MemoryRouter>
  );

describe("Cart Component", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("access_token", "dummy-test-token");
    jest.clearAllMocks();
    getAccessToken.mockReturnValue(localStorage.getItem("access_token") || "");
    normalizeCartItem.mockImplementation((item) => item);
    getCartErrorMessage.mockImplementation((error) => error.message);
  });

  test("shows loading while the database cart request is pending", () => {
    getCart.mockReturnValue(new Promise(() => {}));

    renderCart();

    expect(screen.getByText("Loading your cart...")).toBeInTheDocument();
  });

  test("displays products returned by the database cart API", async () => {
    getCart.mockResolvedValue(mockCart);

    renderCart();

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("2 Items")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: ₹180")).toBeInTheDocument();
    expect(screen.getByText("Discount: ₹18")).toBeInTheDocument();
    expect(screen.getByText("Delivery: ₹10")).toBeInTheDocument();
    expect(screen.getByText("Total: ₹172")).toBeInTheDocument();
  });

  test("shows the empty state when the database cart is empty", async () => {
    getCart.mockResolvedValue([]);

    renderCart();

    expect(await screen.findByText("Your Cart is Empty")).toBeInTheDocument();
  });

  test("does not display a local-only cart as if it were database data", async () => {
    localStorage.setItem("cart", JSON.stringify(mockCart));
    getCart.mockResolvedValue([]);

    renderCart();

    expect(await screen.findByText("Your Cart is Empty")).toBeInTheDocument();
    expect(screen.queryByText("Paracetamol")).not.toBeInTheDocument();
  });

  test("shows a clear error when the database cart cannot be loaded", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    getCart.mockRejectedValue(new Error("Network error"));

    renderCart();

    expect(await screen.findByRole("alert")).toHaveTextContent("Network error");
    expect(screen.getByText("Your Cart is Empty")).toBeInTheDocument();
  });

  test("loads the guest cart when the user is logged out", async () => {
    localStorage.clear();
    localStorage.setItem("cart", JSON.stringify(mockCart));
    getAccessToken.mockReturnValue("");
    getCart.mockResolvedValue(mockCart);

    renderCart();

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
    expect(getCart).toHaveBeenCalled();
  });

  test("persists an increased quantity using the cart row ID", async () => {
    getCart
      .mockResolvedValueOnce(mockCart)
      .mockResolvedValue([{ ...mockCart[0], quantity: 3 }]);
    updateCartItem.mockResolvedValue({});

    renderCart();

    fireEvent.click(
      await screen.findByRole("button", { name: "Increase Paracetamol" })
    );

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(1, 3);
    });
  });

  test("does not decrease quantity below one", async () => {
    getCart.mockResolvedValue([{ ...mockCart[0], quantity: 1 }]);

    renderCart();

    fireEvent.click(
      await screen.findByRole("button", { name: "Decrease Paracetamol" })
    );

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("1");
    expect(updateCartItem).not.toHaveBeenCalled();
  });

  test("removes a product from the database cart", async () => {
    getCart
      .mockResolvedValueOnce(mockCart)
      .mockResolvedValue([]);
    removeCartItem.mockResolvedValue({});

    renderCart();

    fireEvent.click(
      await screen.findByRole("button", { name: "Remove Paracetamol" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes, Remove" }));

    await waitFor(() => {
      expect(removeCartItem).toHaveBeenCalledWith(1);
    });
    expect(await screen.findByText("Your Cart is Empty")).toBeInTheDocument();
  });

  test("uses the backend error message for failed cart actions", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    getCart.mockResolvedValue(mockCart);
    updateCartItem.mockRejectedValue(new Error("Product is out of stock"));
    getCartErrorMessage.mockReturnValue("Product is out of stock");

    renderCart();

    fireEvent.click(
      await screen.findByRole("button", { name: "Increase Paracetamol" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Product is out of stock"
    );
  });
});
