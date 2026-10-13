import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import axios from "axios";
import Cart from "./Cart";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../components/CartItem/CartItem", () => ({
  __esModule: true,
  default: ({ item, onIncrease, onDecrease, onRemove }) => (
    <div data-testid={`cart-item-${item.id}`}>
      <span>{item.name}</span>
      <span data-testid={`quantity-${item.id}`}>
        {item.quantity}
      </span>

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
    price: 100,
    discountedPrice: 90,
    category: "Medicine",
  },
];

describe("Cart Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    localStorage.setItem("access_token", "dummy-test-token");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows loading while the API request is pending", () => {
    axios.get.mockReturnValue(new Promise(() => {}));

    render(<Cart />);

    expect(screen.getByText("Loading cart...")).toBeInTheDocument();
  });

  test("displays products returned by the API", async () => {
    axios.get.mockResolvedValue({
      data: { items: mockCart },
    });

    render(<Cart />);

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("2 Items")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: ₹180")).toBeInTheDocument();
    expect(screen.getByText("Discount: ₹18")).toBeInTheDocument();
    expect(screen.getByText("Delivery: ₹10")).toBeInTheDocument();
    expect(screen.getByText("Total: ₹172")).toBeInTheDocument();
  });

  test("shows the empty state when the cart is empty", async () => {
    axios.get.mockResolvedValue({
      data: { items: [] },
    });

    render(<Cart />);

    expect(
      await screen.findByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Looks like you haven't added any products yet.")
    ).toBeInTheDocument();
  });

  test("shows cached products when the API fails", async () => {
    localStorage.setItem("cart", JSON.stringify(mockCart));
    axios.get.mockRejectedValue(new Error("Network error"));

    render(<Cart />);

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
  });

  test("does not request the API when the user is logged out", async () => {
    localStorage.clear();

    render(<Cart />);

    expect(
      await screen.findByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(axios.get).not.toHaveBeenCalled();
  });

  test("increases the quantity of a product", async () => {
    localStorage.setItem("cart", JSON.stringify(mockCart));

    render(<Cart />);

    const increaseButton = await screen.findByRole("button", {
      name: "Increase Paracetamol",
    });

    fireEvent.click(increaseButton);

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("3");
    expect(localStorage.getItem("cart")).toContain('"quantity":3');
  });

  test("does not decrease quantity below one", async () => {
    const oneItem = [{ ...mockCart[0], quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(oneItem));

    render(<Cart />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Decrease Paracetamol",
      })
    );

    expect(screen.getByTestId("quantity-1")).toHaveTextContent("1");
  });

  test("removes a product when logged out", async () => {
    localStorage.setItem("cart", JSON.stringify(mockCart));
    localStorage.removeItem("access_token");

    render(<Cart />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Paracetamol",
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Your Cart is Empty")).toBeInTheDocument();
    });

    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([]);
    expect(axios.delete).not.toHaveBeenCalled();
  });

  test("sends the updated quantity to the API when logged in", async () => {
    localStorage.setItem("cart", JSON.stringify(mockCart));

    axios.get
      .mockResolvedValueOnce({ data: { items: mockCart } })
      .mockResolvedValue({ data: { items: [{ ...mockCart[0], quantity: 3 }] } });

    axios.put.mockResolvedValue({ data: { quantity: 3 } });

    render(<Cart />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Increase Paracetamol",
      })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/cart\/1$/),
        { quantity: 3 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer dummy-test-token",
          }),
        })
      );
    });
  });

  test("removes a product through the API when logged in", async () => {
    localStorage.setItem("cart", JSON.stringify(mockCart));

    axios.get
      .mockResolvedValueOnce({ data: { items: mockCart } })
      .mockResolvedValue({ data: { items: [] } });

    axios.delete.mockResolvedValue({ data: { message: "Removed" } });

    render(<Cart />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Paracetamol",
      })
    );

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/cart\/1$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer dummy-test-token",
          }),
        })
      );
    });
  });
});
