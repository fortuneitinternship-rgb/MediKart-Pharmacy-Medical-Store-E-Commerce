
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Wishlist from "./Wishlist";

import {
  getWishlist,
  removeWishlistItem,
  moveWishlistItemToCart,
} from "../../api/wishlistApi";

jest.mock("../../api/wishlistApi", () => ({
  getWishlist: jest.fn(),
  removeWishlistItem: jest.fn(),
  moveWishlistItemToCart: jest.fn(),
}));

jest.mock("../../components/WishlistItem/WishlistItem", () => {
  return function MockWishlistItem({
    item,
    onMoveToCart,
    onRemove,
    disabled,
  }) {
    return (
      <div data-testid={`wishlist-item-${item.id}`}>
        <span>{item.name || item.title || `Product ${item.id}`}</span>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
        >
          Remove {item.id}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onMoveToCart(item.id)}
        >
          Move to Cart {item.id}
        </button>
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
        <button type="button">{buttonText}</button>
      </div>
    );
  };
});

const mockWishlist = [
  { id: 1, name: "Paracetamol" },
  { id: 2, name: "Vitamin C" },
];

const renderWishlist = () =>
  render(
    <MemoryRouter>
      <Wishlist />
    </MemoryRouter>
  );

describe("Wishlist Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getWishlist.mockResolvedValue(mockWishlist);
    removeWishlistItem.mockResolvedValue({});
    moveWishlistItemToCart.mockResolvedValue({});
  });

  test("shows loading message initially", () => {
    getWishlist.mockReturnValue(new Promise(() => { }));

    renderWishlist();

    expect(
      screen.getByText("Loading your wishlist...")
    ).toBeInTheDocument();
  });

  test("loads and displays wishlist products", async () => {
    renderWishlist();

    expect(
      await screen.findByText("❤️ My Wishlist")
    ).toBeInTheDocument();

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("Vitamin C")).toBeInTheDocument();

    expect(getWishlist).toHaveBeenCalledTimes(1);
  });

  test("supports an API response containing an items array", async () => {
    getWishlist.mockResolvedValue({ items: mockWishlist });

    renderWishlist();

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
  });

  test("supports an API response containing a wishlist array", async () => {
    getWishlist.mockResolvedValue({ wishlist: mockWishlist });

    renderWishlist();

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();
  });

  test("shows empty state when wishlist has no products", async () => {
    getWishlist.mockResolvedValue([]);

    renderWishlist();

    expect(await screen.findByTestId("empty-state")).toBeInTheDocument();
    expect(
      screen.getByText("Your Wishlist is Empty")
    ).toBeInTheDocument();
  });

  test("removes a product after the API succeeds", async () => {
    renderWishlist();

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove 1" }));

    await waitFor(() => {
      expect(removeWishlistItem).toHaveBeenCalledWith(1);
      expect(
        screen.queryByTestId("wishlist-item-1")
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
  });

  test("shows an error if removing a product fails", async () => {
    removeWishlistItem.mockRejectedValue({
      response: {
        data: { detail: "Failed to remove product" },
      },
    });

    renderWishlist();

    await screen.findByText("Paracetamol");

    fireEvent.click(screen.getByRole("button", { name: "Remove 1" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to remove product"
    );

    expect(
      screen.getByTestId("wishlist-item-1")
    ).toBeInTheDocument();
  });

  test("moves a product to cart and removes it from wishlist", async () => {
    renderWishlist();

    await screen.findByText("Paracetamol");

    fireEvent.click(
      screen.getByRole("button", { name: "Move to Cart 1" })
    );

    await waitFor(() => {
      expect(moveWishlistItemToCart).toHaveBeenCalledWith(1);
      expect(removeWishlistItem).toHaveBeenCalledWith(1);
      expect(
        screen.queryByTestId("wishlist-item-1")
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
  });

  test("keeps product in wishlist if moving to cart fails", async () => {
    moveWishlistItemToCart.mockRejectedValue({
      response: {
        data: { detail: "Unable to add product to cart" },
      },
    });

    renderWishlist();

    await screen.findByText("Paracetamol");

    fireEvent.click(
      screen.getByRole("button", { name: "Move to Cart 1" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to add product to cart"
    );

    expect(
      screen.getByTestId("wishlist-item-1")
    ).toBeInTheDocument();

    expect(removeWishlistItem).not.toHaveBeenCalled();
  });

  test("shows an error if removing from wishlist fails after moving to cart", async () => {
    removeWishlistItem.mockRejectedValue({
      response: {
        data: { detail: "Could not remove wishlist item" },
      },
    });

    renderWishlist();

    await screen.findByText("Paracetamol");

    fireEvent.click(
      screen.getByRole("button", { name: "Move to Cart 1" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not remove wishlist item"
    );

    expect(moveWishlistItemToCart).toHaveBeenCalledWith(1);

    // The component only removes the item locally after both API calls succeed.
    expect(
      screen.getByTestId("wishlist-item-1")
    ).toBeInTheDocument();
  });

  test("retries loading wishlist after an error", async () => {
    getWishlist
      .mockRejectedValueOnce({
        response: {
          data: { detail: "Network error" },
        },
      })
      .mockResolvedValueOnce(mockWishlist);

    renderWishlist();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Network error"
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();

    expect(getWishlist).toHaveBeenCalledTimes(2);
  });

  test("shows a fallback message when the API fails without a detail", async () => {
    getWishlist.mockRejectedValue(new Error("Network error"));

    renderWishlist();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load wishlist. Please log in and try again."
    );
  });
});
