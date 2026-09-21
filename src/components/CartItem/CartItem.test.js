import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CartItem from "./CartItem";

describe("CartItem Component", () => {
  const mockItem = {
    id: 1,
    image: "https://example.com/product.jpg",
    name: "Paracetamol 500mg",
    category: "Medicine",
    rating: 4.5,
    price: 100,
    quantity: 2,
  };

  const onIncrease = jest.fn();
  const onDecrease = jest.fn();
  const onRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders product details", () => {
    render(
      <CartItem
        item={mockItem}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText("Paracetamol 500mg")).toBeInTheDocument();
    expect(screen.getByText("Medicine")).toBeInTheDocument();
    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("renders product image", () => {
    render(
      <CartItem
        item={mockItem}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

    const image = screen.getByAltText("Paracetamol 500mg");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "https://example.com/product.jpg"
    );
  });

  test("calls onIncrease when plus button is clicked", () => {
    render(
      <CartItem
        item={mockItem}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    expect(onIncrease).toHaveBeenCalledWith(1);
  });

  test("calls onDecrease when minus button is clicked", () => {
    render(
      <CartItem
        item={mockItem}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(onDecrease).toHaveBeenCalledWith(1);
  });

  test("calls onRemove when Remove button is clicked", () => {
    render(
      <CartItem
        item={mockItem}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByText(/Remove/i));

    expect(onRemove).toHaveBeenCalledWith(1);
  });

  test("disables minus button when quantity is 1", () => {
    render(
      <CartItem
        item={{ ...mockItem, quantity: 1 }}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

    const minusButton = screen.getAllByRole("button")[0];

    expect(minusButton).toBeDisabled();
  });

  test("shows correct total price", () => {
    render(
      <CartItem
        item={{ ...mockItem, price: 150, quantity: 3 }}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );

  });
});