
import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import WishlistItem from "./WishlistItem";

import {
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";

// Mock product image utilities
jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(),
  handleProductImageError: jest.fn(),
}));

// Mock CSS module
jest.mock("./WishlistItem.module.css", () => ({
  card: "card",
  imageContainer: "imageContainer",
  image: "image",
  details: "details",
  name: "name",
  meta: "meta",
  rating: "rating",
  price: "price",
  actions: "actions",
  cartBtn: "cartBtn",
  removeBtn: "removeBtn",
  heart: "heart",
}));

// Generic test data
const mockItem = {
  id: 1,
  name: "Test Item",
  image: "test-image.jpg",
  category: "Test Category",
  rating: 4.5,
  price: 100,
};

const mockOnMoveToCart = jest.fn();
const mockOnRemove = jest.fn();

// Reusable render function
const renderWishlistItem = (item = mockItem) => {
  return render(
    <WishlistItem
      item={item}
      onMoveToCart={mockOnMoveToCart}
      onRemove={mockOnRemove}
    />
  );
};

describe("WishlistItem Component", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    getProductImage.mockReturnValue(
      "test-image.jpg"
    );
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Render component
  test("renders WishlistItem component", () => {
    renderWishlistItem();

    expect(
      document.querySelector(".card")
    ).toBeInTheDocument();
  });

  // 2. Display item name
  test("displays item name", () => {
    renderWishlistItem();

    expect(
      screen.getByRole("heading", {
        name: "Test Item",
      })
    ).toBeInTheDocument();
  });

  // 3. Display item image
  test("renders item image", () => {
    renderWishlistItem();

    const image = screen.getByRole("img", {
      name: "Test Item",
    });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "test-image.jpg"
    );
  });

  // 4. Calls getProductImage
  test("calls getProductImage with correct arguments", () => {
    renderWishlistItem();

    expect(getProductImage).toHaveBeenCalledWith(
      mockItem.image,
      mockItem.name,
      mockItem.category
    );
  });

  // 5. Display rating
  test("displays item rating", () => {
    renderWishlistItem();

    expect(
      screen.getByText("4.5")
    ).toBeInTheDocument();
  });

  // 6. Display rating accessibility label
  test("renders rating accessibility label", () => {
    renderWishlistItem();

    expect(
      screen.getByLabelText("Rating 4.5")
    ).toBeInTheDocument();
  });

  // 7. Display formatted price
  test("displays formatted item price", () => {
    renderWishlistItem();

    expect(
      screen.getByText("₹100")
    ).toBeInTheDocument();
  });

  // 8. Display Move to Cart button
  test("renders Move to Cart button", () => {
    renderWishlistItem();

    expect(
      screen.getByRole("button", {
        name: /move to cart/i,
      })
    ).toBeInTheDocument();
  });

  // 9. Display Remove button
  test("renders Remove button", () => {
    renderWishlistItem();

    expect(
      screen.getByRole("button", {
        name: /remove/i,
      })
    ).toBeInTheDocument();
  });

  // 10. Move item to cart
  test("calls onMoveToCart when Move to Cart is clicked", () => {
    renderWishlistItem();

    fireEvent.click(
      screen.getByRole("button", {
        name: /move to cart/i,
      })
    );

    expect(mockOnMoveToCart).toHaveBeenCalledTimes(1);

    expect(mockOnMoveToCart).toHaveBeenCalledWith(
      mockItem.id
    );
  });

  // 11. Remove item from wishlist
  test("calls onRemove when Remove is clicked", () => {
    renderWishlistItem();

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove/i,
      })
    );

    expect(mockOnRemove).toHaveBeenCalledTimes(1);

    expect(mockOnRemove).toHaveBeenCalledWith(
      mockItem.id
    );
  });

  // 12. Check image error handler
  test("calls handleProductImageError when image fails to load", () => {
    renderWishlistItem();

    const image = screen.getByRole("img", {
      name: "Test Item",
    });

    fireEvent.error(image);

    expect(
      handleProductImageError
    ).toHaveBeenCalledTimes(1);

    expect(
      handleProductImageError
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
      }),
      mockItem.name,
      mockItem.category
    );
  });

  // 13. Check image alt text
  test("sets image alt text correctly", () => {
    renderWishlistItem();

    expect(
      screen.getByAltText("Test Item")
    ).toBeInTheDocument();
  });

  // 14. Check item title attribute
  test("sets title attribute on item name", () => {
    renderWishlistItem();

    expect(
      screen.getByTitle("Test Item")
    ).toBeInTheDocument();
  });

  // 15. Check heart icon
  test("renders wishlist heart icon", () => {
    const { container } = renderWishlistItem();

    const heart = container.querySelector(
      ".heart"
    );

    expect(heart).toBeInTheDocument();
  });

  // 16. Check empty image
  test("handles missing image value", () => {
    const item = {
      ...mockItem,
      image: "",
    };

    renderWishlistItem(item);

    expect(getProductImage).toHaveBeenCalledWith(
      "",
      item.name,
      item.category
    );
  });

  // 17. Check missing category
  test("handles missing category", () => {
    const item = {
      ...mockItem,
      category: undefined,
    };

    renderWishlistItem(item);

    expect(getProductImage).toHaveBeenCalledWith(
      item.image,
      item.name,
      undefined
    );
  });

  // 18. Check numeric price formatting
  test("formats large price correctly", () => {
    const item = {
      ...mockItem,
      price: 1000,
    };

    renderWishlistItem(item);

    expect(
      screen.getByText("₹1,000")
    ).toBeInTheDocument();
  });

  // 19. Check zero price
  test("displays zero price correctly", () => {
    const item = {
      ...mockItem,
      price: 0,
    };

    renderWishlistItem(item);

    expect(
      screen.getByText("₹0")
    ).toBeInTheDocument();
  });

  // 20. Ensure callbacks are not called on initial render
  test("does not call action callbacks during initial render", () => {
    renderWishlistItem();

    expect(mockOnMoveToCart).not.toHaveBeenCalled();

    expect(mockOnRemove).not.toHaveBeenCalled();
  });

});
