
import React from "react";

import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import CartItem from "./CartItem";

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
jest.mock("./CartItem.module.css", () => ({
  card: "card",
  imageBox: "imageBox",
  image: "image",
  details: "details",
  name: "name",
  category: "category",
  rating: "rating",
  star: "star",
  price: "price",
  quantity: "quantity",
  qtyBtn: "qtyBtn",
  qty: "qty",
  right: "right",
  total: "total",
  removeBtn: "removeBtn",
}));

// Generic test data
const mockItem = {
  id: 1,
  name: "Test Item",
  image: "test-image.jpg",
  category: "Test Category",
  rating: 4.5,
  price: 100,
  quantity: 2,
};

// Mock callback functions
const mockOnIncrease = jest.fn();
const mockOnDecrease = jest.fn();
const mockOnRemove = jest.fn();

// Reusable render function
const renderCartItem = (item = mockItem) => {
  return render(
    <CartItem
      item={item}
      onIncrease={mockOnIncrease}
      onDecrease={mockOnDecrease}
      onRemove={mockOnRemove}
    />
  );
};

describe("CartItem Component", () => {

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
  test("renders CartItem component", () => {
    renderCartItem();

    expect(
      document.querySelector(".card")
    ).toBeInTheDocument();
  });

  // 2. Display item name
  test("displays item name", () => {
    renderCartItem();

    expect(
      screen.getByRole("heading", {
        name: "Test Item",
      })
    ).toBeInTheDocument();
  });

  // 3. Display item image
  test("renders item image", () => {
    renderCartItem();

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
    renderCartItem();

    expect(getProductImage).toHaveBeenCalledWith(
      mockItem.image,
      mockItem.name,
      mockItem.category
    );
  });

  // 5. Display category
  test("displays item category", () => {
    renderCartItem();

    expect(
      screen.getByText("Test Category")
    ).toBeInTheDocument();
  });

  // 6. Hide category when unavailable
  test("does not display category when missing", () => {
    const item = {
      ...mockItem,
      category: "",
    };

    renderCartItem(item);

    expect(
      screen.queryByText("Test Category")
    ).not.toBeInTheDocument();
  });

  // 7. Display rating
  test("displays item rating", () => {
    renderCartItem();

    expect(
      screen.getByText("4.5")
    ).toBeInTheDocument();
  });

  // 8. Display default rating
  test("displays default rating when rating is unavailable", () => {
    const item = {
      ...mockItem,
      rating: undefined,
    };

    renderCartItem(item);

    expect(
      screen.getByText("4.8")
    ).toBeInTheDocument();
  });

  // 9. Display formatted price
  test("displays item price correctly", () => {
    renderCartItem();

    expect(
      screen.getByText("₹100")
    ).toBeInTheDocument();
  });

  // 10. Display discounted price
  test("uses discountedPrice when price is unavailable", () => {
    const item = {
      ...mockItem,
      price: undefined,
      discountedPrice: 75,
    };

    renderCartItem(item);

    expect(
      screen.getByText("₹75")
    ).toBeInTheDocument();
  });

  // 11. Display default price
  test("displays zero price when price is unavailable", () => {
    const item = {
      ...mockItem,
      price: undefined,
      discountedPrice: undefined,
    };

    renderCartItem(item);

    expect(
      screen.getAllByText(/₹\s*0/)
    ).toHaveLength(2);
  });

  // 12. Display quantity
  test("displays item quantity", () => {
    renderCartItem();

    expect(
      screen.getByText("2")
    ).toBeInTheDocument();
  });

  // 13. Increase quantity
  test("calls onIncrease when plus button is clicked", () => {
    renderCartItem();

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[1]);

    expect(mockOnIncrease).toHaveBeenCalledTimes(1);

    expect(mockOnIncrease).toHaveBeenCalledWith(
      mockItem.id
    );
  });

  // 14. Decrease quantity
  test("calls onDecrease when minus button is clicked", () => {
    renderCartItem();

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(mockOnDecrease).toHaveBeenCalledTimes(1);

    expect(mockOnDecrease).toHaveBeenCalledWith(
      mockItem.id
    );
  });

  // 15. Disable decrease at quantity one
  test("disables decrease button when quantity is one", () => {
    const item = {
      ...mockItem,
      quantity: 1,
    };

    renderCartItem(item);

    const decreaseButton = screen.getAllByRole("button")[0];

    expect(decreaseButton).toBeDisabled();
  });

  // 16. Enable decrease when quantity is greater than one
  test("enables decrease button when quantity is greater than one", () => {
    renderCartItem();

    const decreaseButton = screen.getAllByRole("button")[0];

    expect(decreaseButton).toBeEnabled();
  });

  // 17. Default quantity
  test("displays default quantity when quantity is unavailable", () => {
    const item = {
      ...mockItem,
      quantity: undefined,
    };

    renderCartItem(item);

    expect(
      screen.getByText("1")
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button")[0]
    ).toBeDisabled();
  });

  // 18. Calculate total price
  test("calculates total price correctly", () => {
    renderCartItem();

    expect(
      screen.getByText("₹ 200")
    ).toBeInTheDocument();
  });

  // 19. Remove item
  test("calls onRemove when Remove button is clicked", () => {
    renderCartItem();

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

  // 20. Image error handling
  test("calls handleProductImageError when image fails", () => {
    renderCartItem();

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

  // 21. Handle missing image
  test("handles missing image value", () => {
    const item = {
      ...mockItem,
      image: "",
    };

    renderCartItem(item);

    expect(getProductImage).toHaveBeenCalledWith(
      "",
      item.name,
      item.category
    );
  });

  // 22. Callbacks are not triggered during rendering
  test("does not call callbacks during initial render", () => {
    renderCartItem();

    expect(mockOnIncrease).not.toHaveBeenCalled();

    expect(mockOnDecrease).not.toHaveBeenCalled();

    expect(mockOnRemove).not.toHaveBeenCalled();
  });

});
