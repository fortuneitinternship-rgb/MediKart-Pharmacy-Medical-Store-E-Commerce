
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import FlashSale from "./FlashSale";

import { addProductToCart } from "../api/cartApi";
import { getFlashSaleProducts } from "../api/productApi";
import {
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";
import { toast } from "react-toastify";

// Mock API functions
jest.mock("../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

jest.mock("../api/productApi", () => ({
  getFlashSaleProducts: jest.fn(),
}));

// Mock image utilities
jest.mock("../utils/productImage", () => ({
  getProductImage: jest.fn(),
  handleProductImageError: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Generic test fixture
const mockItem = {
  id: "test-item-1",
  name: "Test Item",
  brand: "Test Brand",
  category: "healthcare",
  image: "test-image.png",
  price: 100,
  discount_price: 80,
  rating: 4,
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <FlashSale />
    </MemoryRouter>
  );

describe("FlashSale Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFlashSaleProducts.mockResolvedValue([mockItem]);
    addProductToCart.mockResolvedValue({});
    getProductImage.mockReturnValue("/placeholder-image.png");
  });

  // 1. Loading state
  test("shows loading state while products are being fetched", () => {
    getFlashSaleProducts.mockReturnValue(new Promise(() => { }));

    renderComponent();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Loading flash-sale products...");
  });

  // 2. Successful product loading
  test("renders flash-sale products after successful loading", async () => {
    renderComponent();

    expect(
      await screen.findByRole("heading", {
        name: /flash sale/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4")).toBeInTheDocument();
  });

  // 3. Displays product price
  test("displays original and discounted prices", async () => {
    renderComponent();

    expect(await screen.findByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹80")).toBeInTheDocument();
  });

  // 4. Displays product image
  test("renders the product image using the image utility", async () => {
    renderComponent();

    const image = await screen.findByAltText("Test Item");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/placeholder-image.png"
    );

    expect(getProductImage).toHaveBeenCalledWith(
      mockItem.image,
      mockItem.name,
      mockItem.category
    );
  });

  // 5. Handles image loading errors
  test("calls image error handler when the image fails to load", async () => {
    renderComponent();

    const image = await screen.findByAltText("Test Item");

    fireEvent.error(image);

    expect(handleProductImageError).toHaveBeenCalledWith(
      expect.any(Object),
      mockItem.name,
      mockItem.category
    );
  });

  // 6. Displays timer
  test("renders the countdown timer labels", async () => {
    renderComponent();

    expect(await screen.findByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Seconds")).toBeInTheDocument();
  });

  // 7. Displays product details link
  test("renders the product details link", async () => {
    renderComponent();

    const link = await screen.findByRole("link", {
      name: /view details/i,
    });

    expect(link).toHaveAttribute(
      "href",
      `/product/${mockItem.id}`
    );
  });

  // 8. Adds item to cart successfully
  test("adds an item to cart successfully", async () => {
    renderComponent();

    const button = await screen.findByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(mockItem);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Product added to cart!",
        expect.objectContaining({
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        })
      );
    });

    expect(
      await screen.findByRole("button", {
        name: /added/i,
      })
    ).toBeInTheDocument();
  });

  // 9. Displays loading state while adding to cart
  test("disables the cart button while adding an item", async () => {
    let resolveCartRequest;

    addProductToCart.mockReturnValue(
      new Promise((resolve) => {
        resolveCartRequest = resolve;
      })
    );

    renderComponent();

    const button = await screen.findByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(button);

    expect(
      await screen.findByRole("button", {
        name: /adding/i,
      })
    ).toBeDisabled();

    resolveCartRequest({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /added/i,
        })
      ).toBeEnabled();
    });
  });

  // 10. Handles cart API errors
  test("displays an error notification when adding to cart fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Cart request failed")
    );

    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /add to cart/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Cart request failed"
      );
    });

    expect(
      screen.getByRole("button", {
        name: /add to cart/i,
      })
    ).toBeEnabled();
  });

  // 11. Handles cart errors without a message
  test("displays a default error when the cart error has no message", async () => {
    addProductToCart.mockRejectedValue({});

    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /add to cart/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to add this product to your cart."
      );
    });
  });

  // 12. Empty products state
  test("displays empty state when no products are available", async () => {
    getFlashSaleProducts.mockResolvedValue([]);

    renderComponent();

    expect(
      await screen.findByText(
        "No flash-sale products available."
      )
    ).toBeInTheDocument();
  });

  // 13. API error state
  test("displays an error message when product loading fails", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    getFlashSaleProducts.mockRejectedValue(
      new Error("Request failed")
    );

    renderComponent();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Flash-sale products could not be loaded."
    );

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  // 14. Handles an invalid API response
  test("displays empty state when API response is not an array", async () => {
    getFlashSaleProducts.mockResolvedValue({
      results: [],
    });

    renderComponent();

    expect(
      await screen.findByText(
        "No flash-sale products available."
      )
    ).toBeInTheDocument();
  });

  // 15. Handles optional product information
  test("renders when optional product fields are missing", async () => {
    const itemWithoutOptionalFields = {
      id: "test-item-2",
      name: "Basic Item",
      price: 50,
    };

    getFlashSaleProducts.mockResolvedValue([
      itemWithoutOptionalFields,
    ]);

    renderComponent();

    expect(
      await screen.findByText("Basic Item")
    ).toBeInTheDocument();
  });

  // 16. Prevents duplicate cart requests while loading
  test("does not send another cart request while the first is pending", async () => {
    let resolveCartRequest;

    addProductToCart.mockReturnValue(
      new Promise((resolve) => {
        resolveCartRequest = resolve;
      })
    );

    renderComponent();

    const button = await screen.findByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(button);

    await screen.findByRole("button", {
      name: /adding/i,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /adding/i,
      })
    );

    expect(addProductToCart).toHaveBeenCalledTimes(1);

    resolveCartRequest({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /added/i,
        })
      ).toBeInTheDocument();
    });
  });
});
