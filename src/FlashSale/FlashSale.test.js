
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import FlashSale from "./FlashSale";

import { addProductToCart } from "../api/cartApi";
import { getFlashSaleProducts } from "../api/productApi";
import { toast } from "react-toastify";

import {
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

// Mock cart API
jest.mock("../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// Mock product API
jest.mock("../api/productApi", () => ({
  getFlashSaleProducts: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock image utilities
jest.mock("../utils/productImage", () => ({
  getProductImage: jest.fn(() => "/mock-image.png"),
  handleProductImageError: jest.fn(),
}));

// Generic test data
const mockProducts = [
  {
    id: 1,
    name: "Item A",
    brand: "Brand A",
    category: "Category A",
    image: "image-a.png",
    price: 100,
    discount_price: 80,
    rating: 4,
  },
  {
    id: 2,
    name: "Item B",
    brand: "Brand B",
    category: "Category B",
    image: "image-b.png",
    price: 200,
    discount_price: 150,
    rating: 5,
  },
  {
    id: 3,
    name: "Item C",
    brand: "Brand C",
    category: "Category C",
    image: "image-c.png",
    price: 300,
    discount_price: null,
    rating: 3,
  },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <FlashSale />
    </MemoryRouter>
  );

describe("FlashSale Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFlashSaleProducts.mockResolvedValue(mockProducts);
    addProductToCart.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  // 1. Render component
  test("renders Flash Sale heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /Flash Sale/i,
      })
    ).toBeInTheDocument();
  });

  // 2. Render subtitle
  test("renders Limited Time Deals text", () => {
    renderComponent();

    expect(
      screen.getByText("Limited Time Deals")
    ).toBeInTheDocument();
  });

  // 3. Initial countdown
  test("renders initial countdown timer", () => {
    renderComponent();

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();

    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Seconds")).toBeInTheDocument();
  });

  // 4. Fetch products
  test("calls getFlashSaleProducts on component mount", () => {
    renderComponent();

    expect(getFlashSaleProducts).toHaveBeenCalledTimes(1);
  });

  // 5. Display products
  test("displays products after successful API response", async () => {
    renderComponent();

    expect(
      await screen.findByText("Item A")
    ).toBeInTheDocument();

    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText("Item C")).toBeInTheDocument();
  });

  // 6. Display brands
  test("displays product brands", async () => {
    renderComponent();

    expect(await screen.findByText("Brand A")).toBeInTheDocument();
    expect(screen.getByText("Brand B")).toBeInTheDocument();
    expect(screen.getByText("Brand C")).toBeInTheDocument();
  });

  // 7. Display ratings
  test("displays product ratings", async () => {
    renderComponent();

    await screen.findByText("Item A");

    expect(screen.getByText("⭐ 4")).toBeInTheDocument();
    expect(screen.getByText("⭐ 5")).toBeInTheDocument();
    expect(screen.getByText("⭐ 3")).toBeInTheDocument();
  });

  // 8. Display original prices
  test("displays original product prices", async () => {
    renderComponent();

    await screen.findByText("Item A");

    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹200")).toBeInTheDocument();
    expect(screen.getByText("₹300")).toBeInTheDocument();
  });

  // 9. Display discounted prices
  test("displays discounted prices", async () => {
    renderComponent();

    await screen.findByText("Item A");

    expect(screen.getByText("₹80")).toBeInTheDocument();
    expect(screen.getByText("₹150")).toBeInTheDocument();
  });

  // 10. Fallback price
  test("uses original price when discount price is null", async () => {
    renderComponent();

    await screen.findByText("Item C");

    const prices = screen.getAllByText("₹300");

    expect(prices).toHaveLength(2);
  });

  // 11. Display images
  test("renders product images", async () => {
    renderComponent();

    await screen.findByText("Item A");

    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(3);

    images.forEach((image) => {
      expect(image).toHaveAttribute(
        "src",
        "/mock-image.png"
      );
    });
  });

  // 12. Image utility
  test("calls getProductImage for every product", async () => {
    renderComponent();

    await screen.findByText("Item A");

    expect(getProductImage).toHaveBeenCalledTimes(3);
  });

  // 13. Image error handling
  test("handles image loading errors", async () => {
    renderComponent();

    await screen.findByText("Item A");

    const images = screen.getAllByRole("img");

    fireEvent.error(images[0]);

    expect(handleProductImageError).toHaveBeenCalledTimes(1);
  });

  // 14. View Details links
  test("renders View Details links", async () => {
    renderComponent();

    await screen.findByText("Item A");

    expect(
      screen.getAllByRole("link", {
        name: "View Details",
      })
    ).toHaveLength(3);
  });

  // 15. Product navigation
  test("renders correct product detail URLs", async () => {
    renderComponent();

    await screen.findByText("Item A");

    const links = screen.getAllByRole("link", {
      name: "View Details",
    });

    expect(links[0]).toHaveAttribute("href", "/product/1");
    expect(links[1]).toHaveAttribute("href", "/product/2");
    expect(links[2]).toHaveAttribute("href", "/product/3");
  });

  // 16. Add to Cart buttons
  test("renders Add to Cart buttons", async () => {
    renderComponent();

    await screen.findByText("Item A");

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(3);
  });

  // 17. Button type
  test("renders cart buttons with button type", async () => {
    renderComponent();

    await screen.findByText("Item A");

    const buttons = screen.getAllByRole("button", {
      name: "Add to Cart",
    });

    buttons.forEach((button) => {
      expect(button).toHaveAttribute("type", "button");
    });
  });

  // 18. Add product to cart
  test("calls addProductToCart when Add to Cart is clicked", async () => {
    renderComponent();

    await screen.findByText("Item A");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledTimes(1);
    });

    expect(addProductToCart).toHaveBeenCalledWith(mockProducts[0]);
  });

  // 19. Add selected product
  test("passes the selected product to cart API", async () => {
    renderComponent();

    await screen.findByText("Item B");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[1]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          name: "Item B",
        })
      );
    });
  });

  // 20. Success notification
  test("displays success toast after adding product", async () => {
    renderComponent();

    await screen.findByText("Item A");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Item A added to cart!",
        expect.objectContaining({
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        })
      );
    });
  });

  // 21. Added button state
  test("changes button text after successful cart operation", async () => {
    renderComponent();

    await screen.findByText("Item A");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    expect(
      await screen.findByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();
  });

  // 22. Error notification
  test("displays error toast when cart API fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Cart operation failed")
    );

    renderComponent();

    await screen.findByText("Item A");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Cart operation failed"
      );
    });
  });

  // 23. Default error notification
  test("displays default error message when error message is missing", async () => {
    addProductToCart.mockRejectedValue({});

    renderComponent();

    await screen.findByText("Item A");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to add this product to your cart."
      );
    });
  });

  // 24. Failed cart request
  test("does not show Added state when cart API fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Request failed")
    );

    renderComponent();

    await screen.findByText("Item A");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(3);

    expect(
      screen.queryByRole("button", {
        name: "✓ Added",
      })
    ).not.toBeInTheDocument();
  });

  // 25. Empty products
  test("renders empty product grid when API returns empty array", async () => {
    getFlashSaleProducts.mockResolvedValue([]);

    const { container } = renderComponent();

    await waitFor(() => {
      expect(getFlashSaleProducts).toHaveBeenCalledTimes(1);
    });

    expect(
      container.querySelector(".productGrid")
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll(".productCard")
    ).toHaveLength(0);
  });

  // 26. API error
  test("displays error message when product API fails", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    getFlashSaleProducts.mockRejectedValue(
      new Error("API request failed")
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

  // 27. No products displayed after API error
  test("does not display product cards after API failure", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    getFlashSaleProducts.mockRejectedValue(
      new Error("Request failed")
    );

    const { container } = renderComponent();

    await screen.findByRole("alert");

    expect(
      container.querySelectorAll(".productCard")
    ).toHaveLength(0);

    consoleError.mockRestore();
  });

  // 28. Countdown updates
  test("updates countdown after one second", async () => {
    jest.useFakeTimers();

    renderComponent();

    expect(screen.getByText("24")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument();
  });

  // 29. Countdown timer cleanup
  test("cleans up countdown interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(
      global,
      "clearInterval"
    );

    const { unmount } = renderComponent();

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  // 30. Added button resets after two seconds
  test("resets Added button after two seconds", async () => {
    jest.useFakeTimers();

    renderComponent();

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(3);
  });

  // 31. CSS structure
  test("renders correct component CSS structure", () => {
    const { container } = renderComponent();

    expect(
      container.querySelector("section")
    ).toBeInTheDocument();

    expect(
      container.querySelector(".header")
    ).toBeInTheDocument();

    expect(
      container.querySelector(".timer")
    ).toBeInTheDocument();

    expect(
      container.querySelector(".productGrid")
    ).toBeInTheDocument();
  });

  // 32. Product card structure
  test("renders product cards with image and content sections", async () => {
    const { container } = renderComponent();

    await screen.findByText("Item A");

    expect(
      container.querySelectorAll(".productCard")
    ).toHaveLength(3);

    expect(
      container.querySelectorAll(".imageWrapper")
    ).toHaveLength(3);

    expect(
      container.querySelectorAll(".cardContent")
    ).toHaveLength(3);
  });
});
