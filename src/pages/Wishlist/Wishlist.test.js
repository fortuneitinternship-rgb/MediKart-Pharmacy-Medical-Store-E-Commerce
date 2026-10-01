import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Wishlist from "./Wishlist";

// Mock WishlistItem
jest.mock("../../components/WishlistItem/WishlistItem", () => {
  return function MockWishlistItem({ item, onMoveToCart, onRemove }) {
    return (
      <div data-testid={`wishlist-item-${item.id}`}>
        <span>{item.name}</span>

        <button onClick={() => onMoveToCart(item.id)}>
          Move to Cart
        </button>

        <button onClick={() => onRemove(item.id)}>
          Remove
        </button>
      </div>
    );
  };
});

// Mock EmptyState
jest.mock("../../components/EmptyState/EmptyState", () => {
  return function MockEmptyState({
    title,
    description,
    buttonText,
    buttonLink,
  }) {
    return (
      <div data-testid="empty-state">
        <h2>{title}</h2>
        <p>{description}</p>

        <a href={buttonLink}>{buttonText}</a>
      </div>
    );
  };
});

// Mock image
jest.mock("../../assets/empty-wishlist.png", () => "empty-wishlist.png");

describe("Wishlist Component", () => {
  beforeEach(() => {
    localStorage.clear();

    window.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty wishlist state when wishlist is empty", async () => {
    localStorage.setItem("wishlist", JSON.stringify([]));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Your Wishlist is Empty")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Save your favourite products here.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Continue Shopping")
    ).toBeInTheDocument();
  });

  test("renders empty wishlist when localStorage has no wishlist", async () => {
    localStorage.removeItem("wishlist");

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Your Wishlist is Empty")
      ).toBeInTheDocument();
    });
  });

  test("renders wishlist items", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
      {
        id: 2,
        name: "Sample Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("❤️ My Wishlist")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Sample Product")).toBeInTheDocument();
  });

  test("renders wishlist title", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("❤️ My Wishlist")
      ).toBeInTheDocument();
    });
  });

  test("removes wishlist item", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
      {
        id: 2,
        name: "Another Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Remove",
      })[0]
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Test Product")
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Another Product")).toBeInTheDocument();

    const savedWishlist = JSON.parse(
      localStorage.getItem("wishlist")
    );

    expect(savedWishlist).toHaveLength(1);
    expect(savedWishlist[0].id).toBe(2);
  });

  test("dispatches wishlistUpdated event when item is removed", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove",
      })
    );

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "wishlistUpdated",
      })
    );
  });

  test("moves wishlist item to cart", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("cart", JSON.stringify([]));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move to Cart",
      })
    );

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe(1);
    expect(cart[0].quantity).toBe(1);
  });

  test("removes item from wishlist after moving to cart", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("cart", JSON.stringify([]));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move to Cart",
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Test Product")
      ).not.toBeInTheDocument();
    });
  });

  test("increases quantity when product already exists in cart", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    const cart = [
      {
        id: 1,
        name: "Test Product",
        quantity: 2,
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("cart", JSON.stringify(cart));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move to Cart",
      })
    );

    const updatedCart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(updatedCart[0].quantity).toBe(3);
  });

  test("dispatches cartUpdated event when moving item to cart", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("cart", JSON.stringify([]));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Move to Cart",
      })
    );

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cartUpdated",
      })
    );
  });

  test("renders Continue Shopping link", async () => {
    const wishlist = [
      {
        id: 1,
        name: "Test Product",
      },
    ];

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Continue Shopping")
      ).toBeInTheDocument();
    });

    const link = screen.getByText("Continue Shopping");

    expect(link).toHaveAttribute("href", "/shop");
  });
});