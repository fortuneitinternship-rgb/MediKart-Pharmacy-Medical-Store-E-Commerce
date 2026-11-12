import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Wishlist from "./Wishlist";

import {
  getWishlist,
  removeWishlistItem,
  moveWishlistItemToCart,
} from "../../api/wishlistApi";

/* =====================================================
   MOCK API
===================================================== */

jest.mock("../../api/wishlistApi", () => ({
  getWishlist: jest.fn(),
  removeWishlistItem: jest.fn(),
  moveWishlistItemToCart: jest.fn(),
}));

/* =====================================================
   MOCK CSS AND IMAGE
===================================================== */

jest.mock("./Wishlist.module.css", () => ({}));

jest.mock("../../assets/empty-wishlist.png", () => "empty-wishlist.png");

/* =====================================================
   MOCK EMPTY STATE
   Do not add a fake empty-state test ID.
===================================================== */

jest.mock(
  "../../components/EmptyState/EmptyState",
  () => {
    const React = require("react");

    return function MockEmptyState({
      title,
      description,
      buttonText,
      buttonLabel,
      buttonLink,
    }) {
      return React.createElement(
        "div",
        { className: "mock-empty-state" },
        React.createElement("h2", null, title),
        React.createElement("p", null, description),
        React.createElement(
          "a",
          { href: buttonLink || "/shop" },
          buttonText || buttonLabel || "Continue Shopping"
        )
      );
    };
  }
);

/* =====================================================
   MOCK WISHLIST ITEM

   Actual component props:
   item, onMoveToCart, onRemove, disabled
===================================================== */

jest.mock(
  "../../components/WishlistItem/WishlistItem",
  () => {
    const React = require("react");

    return function MockWishlistItem({
      item,
      onMoveToCart,
      onRemove,
      disabled,
    }) {
      return React.createElement(
        "div",
        {
          "data-testid": `wishlist-item-${item.id}`,
        },
        React.createElement(
          "h3",
          null,
          item.name || item.title || "Sample Item"
        ),
        React.createElement(
          "button",
          {
            type: "button",
            disabled: Boolean(disabled),
            onClick: () => onRemove(item.id),
          },
          "Remove"
        ),
        React.createElement(
          "button",
          {
            type: "button",
            disabled: Boolean(disabled),
            onClick: () => onMoveToCart(item.id),
          },
          "Move to Cart"
        )
      );
    };
  }
);

/* =====================================================
   GENERIC TEST DATA
===================================================== */

const sampleItems = [
  {
    id: 101,
    name: "Sample Item One",
    price: 100,
    quantity: 1,
    image: "sample-one.png",
  },
  {
    id: 102,
    name: "Sample Item Two",
    price: 200,
    quantity: 1,
    image: "sample-two.png",
  },
];

/* =====================================================
   RENDER HELPER

   MemoryRouter is required because Wishlist uses Link.
===================================================== */

const renderWishlist = () => {
  return render(
    <MemoryRouter initialEntries={["/wishlist"]}>
      <Wishlist />
    </MemoryRouter>
  );
};

/* =====================================================
   TEST SETUP
===================================================== */

beforeEach(() => {
  jest.clearAllMocks();

  getWishlist.mockResolvedValue({
    items: sampleItems,
  });

  removeWishlistItem.mockResolvedValue({
    message: "Item removed successfully",
  });

  moveWishlistItemToCart.mockResolvedValue({
    message: "Item moved successfully",
  });
});

/* =====================================================
   WISHLIST TESTS
===================================================== */

describe("Wishlist Component", () => {
  /* -------------------------------------------------
     1. Basic rendering
  ------------------------------------------------- */

  test("renders Wishlist component", async () => {
    renderWishlist();

    expect(
      await screen.findByText(/my wishlist/i)
    ).toBeInTheDocument();
  });

  test("displays loading message initially", () => {
    getWishlist.mockReturnValue(new Promise(() => { }));

    renderWishlist();

    expect(
      screen.getByText(/loading your wishlist/i)
    ).toBeInTheDocument();
  });

  test("calls getWishlist when component loads", async () => {
    renderWishlist();

    await waitFor(() => {
      expect(getWishlist).toHaveBeenCalledTimes(1);
    });
  });

  /* -------------------------------------------------
     2. Wishlist data
  ------------------------------------------------- */

  test("displays wishlist items after successful API response", async () => {
    renderWishlist();

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sample Item Two")
    ).toBeInTheDocument();
  });

  test("displays items when API returns an array", async () => {
    getWishlist.mockResolvedValue(sampleItems);

    renderWishlist();

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();
  });

  test("displays items when API returns wishlist property", async () => {
    getWishlist.mockResolvedValue({
      wishlist: sampleItems,
    });

    renderWishlist();

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();
  });

  test("displays items when API returns items property", async () => {
    getWishlist.mockResolvedValue({
      items: sampleItems,
    });

    renderWishlist();

    expect(
      await screen.findByText("Sample Item Two")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------
     3. Empty wishlist
  ------------------------------------------------- */

  test("displays empty wishlist message when API returns empty array", async () => {
    getWishlist.mockResolvedValue([]);

    renderWishlist();

    expect(
      await screen.findByText("Your Wishlist is Empty")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Save your favourite products here.")
    ).toBeInTheDocument();
  });

  test("displays Continue Shopping link for empty wishlist", async () => {
    getWishlist.mockResolvedValue([]);

    renderWishlist();

    const shoppingLink = await screen.findByRole("link", {
      name: /continue shopping/i,
    });

    expect(shoppingLink).toBeInTheDocument();
    expect(shoppingLink).toHaveAttribute("href", "/shop");
  });

  test("does not display wishlist heading when wishlist is empty", async () => {
    getWishlist.mockResolvedValue([]);

    renderWishlist();

    await screen.findByText("Your Wishlist is Empty");

    expect(
      screen.queryByText(/my wishlist/i)
    ).not.toBeInTheDocument();
  });

  /* -------------------------------------------------
     4. API error handling
  ------------------------------------------------- */

  test("displays error message when wishlist API fails", async () => {
    getWishlist.mockRejectedValue(
      new Error("Unable to load wishlist")
    );

    renderWishlist();

    expect(
      await screen.findByRole("alert")
    ).toBeInTheDocument();
  });

  test("displays Retry button when API fails", async () => {
    getWishlist.mockRejectedValue(
      new Error("Unable to load wishlist")
    );

    renderWishlist();

    expect(
      await screen.findByRole("button", {
        name: /retry/i,
      })
    ).toBeInTheDocument();
  });

  test("retries wishlist API when Retry button is clicked", async () => {
    getWishlist
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        items: sampleItems,
      });

    renderWishlist();

    const retryButton = await screen.findByRole("button", {
      name: /retry/i,
    });

    fireEvent.click(retryButton);

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();

    expect(getWishlist).toHaveBeenCalledTimes(2);
  });

  /* -------------------------------------------------
     5. Remove wishlist item
  ------------------------------------------------- */

  test("removes an item when Remove button is clicked", async () => {
    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /remove/i,
      })
    );

    await waitFor(() => {
      expect(removeWishlistItem).toHaveBeenCalledWith(101);
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Sample Item One")
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("Sample Item Two")
    ).toBeInTheDocument();
  });

  test("does not remove an item when remove API fails", async () => {
    removeWishlistItem.mockRejectedValueOnce(
      new Error("Unable to remove item")
    );

    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /remove/i,
      })
    );

    await waitFor(() => {
      expect(removeWishlistItem).toHaveBeenCalledWith(101);
    });

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------
     6. Move item to cart
  ------------------------------------------------- */

  test("calls moveWishlistItemToCart when Move to Cart is clicked", async () => {
    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /move to cart/i,
      })
    );

    await waitFor(() => {
      expect(moveWishlistItemToCart).toHaveBeenCalledWith(101);
    });
  });

  test("removes wishlist item after successful move to cart", async () => {
    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /move to cart/i,
      })
    );

    await waitFor(() => {
      expect(removeWishlistItem).toHaveBeenCalledWith(101);
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Sample Item One")
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("Sample Item Two")
    ).toBeInTheDocument();
  });

  test("does not remove wishlist item if move to cart API fails", async () => {
    moveWishlistItemToCart.mockRejectedValueOnce(
      new Error("Unable to move item")
    );

    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /move to cart/i,
      })
    );

    await waitFor(() => {
      expect(moveWishlistItemToCart).toHaveBeenCalledWith(101);
    });

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();

    expect(removeWishlistItem).not.toHaveBeenCalled();
  });

  test("does not remove wishlist item if removal fails after moving to cart", async () => {
    removeWishlistItem.mockRejectedValueOnce(
      new Error("Unable to remove item")
    );

    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /move to cart/i,
      })
    );

    await waitFor(() => {
      expect(moveWishlistItemToCart).toHaveBeenCalledWith(101);
      expect(removeWishlistItem).toHaveBeenCalledWith(101);
    });

    expect(
      await screen.findByText("Sample Item One")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------
     7. Continue shopping
  ------------------------------------------------- */

  test("displays Continue Shopping link in populated wishlist", async () => {
    renderWishlist();

    const shoppingLink = await screen.findByRole("link", {
      name: /continue shopping/i,
    });

    expect(shoppingLink).toHaveAttribute("href", "/shop");
  });

  /* -------------------------------------------------
     8. Wishlist events
  ------------------------------------------------- */

  test("dispatches wishlistUpdated event after removing item", async () => {
    const eventHandler = jest.fn();

    window.addEventListener("wishlistUpdated", eventHandler);

    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /remove/i,
      })
    );

    await waitFor(() => {
      expect(eventHandler).toHaveBeenCalled();
    });

    window.removeEventListener("wishlistUpdated", eventHandler);
  });

  test("dispatches cartUpdated event after moving item to cart", async () => {
    const eventHandler = jest.fn();

    window.addEventListener("cartUpdated", eventHandler);

    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /move to cart/i,
      })
    );

    await waitFor(() => {
      expect(eventHandler).toHaveBeenCalled();
    });

    window.removeEventListener("cartUpdated", eventHandler);
  });

  test("dispatches wishlistUpdated event after moving item to cart", async () => {
    const eventHandler = jest.fn();

    window.addEventListener("wishlistUpdated", eventHandler);

    renderWishlist();

    const item = await screen.findByTestId("wishlist-item-101");

    fireEvent.click(
      within(item).getByRole("button", {
        name: /move to cart/i,
      })
    );

    await waitFor(() => {
      expect(eventHandler).toHaveBeenCalled();
    });

    window.removeEventListener("wishlistUpdated", eventHandler);
  });
});
