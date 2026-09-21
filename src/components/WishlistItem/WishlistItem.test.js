import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import WishlistItem from "./WishlistItem";

describe("WishlistItem Component", () => {
  const item = {
    id: 101,
    name: "Dolo 650",
    price: 120,
    rating: 4.8,
    image: "/images/dolo650.jpg",
  };

  test("renders product name", () => {
    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText("Dolo 650")).toBeTruthy();
  });

  test("renders product price", () => {
    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText("₹120")).toBeTruthy();
  });

  test("renders product rating", () => {
    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText("4.8")).toBeTruthy();
  });

  test("renders product image with correct alt text", () => {
    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    const image = screen.getByAltText("Dolo 650");

    expect(image).toBeTruthy();
    expect(image.getAttribute("src")).toBe("/images/dolo650.jpg");
  });

  test("renders Move to Cart button", () => {
    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /move to cart/i,
      })
    ).toBeTruthy();
  });

  test("renders Remove button", () => {
    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /remove/i,
      })
    ).toBeTruthy();
  });

  test("calls onMoveToCart with product id", () => {
    const onMoveToCart = jest.fn();

    render(
      <WishlistItem
        item={item}
        onMoveToCart={onMoveToCart}
        onRemove={() => {}}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /move to cart/i,
      })
    );

    expect(onMoveToCart).toHaveBeenCalledTimes(1);
    expect(onMoveToCart).toHaveBeenCalledWith(101);
  });

  test("calls onRemove with product id", () => {
    const onRemove = jest.fn();

    render(
      <WishlistItem
        item={item}
        onMoveToCart={() => {}}
        onRemove={onRemove}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove/i,
      })
    );

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(101);
  });

  test("handles price conversion correctly", () => {
    const product = {
      id: 102,
      name: "Blood Pressure Monitor",
      price: 1499,
      rating: 4.9,
      image: "/images/bp-monitor.jpg",
    };

    render(
      <WishlistItem
        item={product}
        onMoveToCart={() => {}}
        onRemove={() => {}}
      />
    );

    expect(
      screen.getByText("₹1,499")
    ).toBeTruthy();
  });
});