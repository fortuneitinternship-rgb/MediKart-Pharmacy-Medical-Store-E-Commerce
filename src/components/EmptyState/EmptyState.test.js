import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmptyState from "./EmptyState";

describe("EmptyState Component", () => {
  const defaultProps = {
    image: "/images/empty-cart.png",
    title: "Your Cart is Empty",
    description: "Looks like you haven't added any products yet.",
    buttonText: "Continue Shopping",
    buttonLink: "/shop",
  };

  test("renders image", () => {
    render(
      <MemoryRouter>
        <EmptyState {...defaultProps} />
      </MemoryRouter>
    );

    const image = screen.getByAltText("Your Cart is Empty");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/empty-cart.png");
  });

  test("renders title", () => {
    render(
      <MemoryRouter>
        <EmptyState {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Your Cart is Empty")).toBeInTheDocument();
  });

  test("renders description", () => {
    render(
      <MemoryRouter>
        <EmptyState {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Looks like you haven't added any products yet.")).toBeInTheDocument();
  });

  test("renders button with correct text", () => {
    render(
      <MemoryRouter>
        <EmptyState {...defaultProps} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", {
        name: /Continue Shopping/i,
      })
    ).toBeInTheDocument();
  });

  test("button links to correct route", () => {
    render(
      <MemoryRouter>
        <EmptyState {...defaultProps} />
      </MemoryRouter>
    );

    const button = screen.getByRole("link", {
      name: /Continue Shopping/i,
    });

    expect(button).toHaveAttribute("href", "/shop");
  });

  test("uses default button link when buttonLink is not provided", () => {
    render(
      <MemoryRouter>
        <EmptyState
          image="/images/empty.png"
          title="Wishlist Empty"
          description="No products available."
          buttonText="Browse Products"
        />
      </MemoryRouter>
    );

    const button = screen.getByRole("link", {
      name: /Browse Products/i,
    });

    expect(button).toHaveAttribute("href", "/products");
  });

  test("renders custom props correctly", () => {
    render(
      <MemoryRouter>
        <EmptyState
          image="/wishlist.png"
          title="Wishlist Empty"
          description="Add items to your wishlist."
          buttonText="Go Shopping"
          buttonLink="/products"
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Wishlist Empty")).toBeInTheDocument();

    expect(screen.getByText("Add items to your wishlist.")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Go Shopping/i, })).toHaveAttribute("href", "/products");
  });
});