
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import RelatedProducts from "./RelatedProducts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addProductToCart } from "../../api/cartApi";

// Mock navigation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock cart API
jest.mock("../../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// Mock product image utilities
jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(() => "test-image.jpg"),
  handleProductImageError: jest.fn(),
}));

describe("RelatedProducts Component", () => {
  let mockNavigate;

  const mockProducts = [
    {
      id: 1,
      name: "Sample Product One",
      category: "Healthcare",
      price: 100,
      rating: 4.5,
      image: "product-one.jpg",
    },
    {
      id: 2,
      name: "Sample Product Two",
      category: "Medicines",
      price: 200,
      rating: 4.0,
      image: "product-two.jpg",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    addProductToCart.mockResolvedValue({});
  });

  // Test 1: Component renders successfully
  test("renders RelatedProducts component without errors", () => {
    render(<RelatedProducts products={mockProducts} />);

    expect(
      screen.getByText("Our Products")
    ).toBeInTheDocument();
  });

  // Test 2: Displays all products
  test("displays all provided products", () => {
    render(<RelatedProducts products={mockProducts} />);

    expect(
      screen.getByText("Sample Product One")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sample Product Two")
    ).toBeInTheDocument();
  });

  // Test 3: Displays product categories
  test("displays product categories", () => {
    render(<RelatedProducts products={mockProducts} />);

    expect(screen.getByText("Healthcare")).toBeInTheDocument();
    expect(screen.getByText("Medicines")).toBeInTheDocument();
  });

  // Test 4: Displays product prices
  test("displays product prices correctly", () => {
    render(<RelatedProducts products={mockProducts} />);

    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹200")).toBeInTheDocument();
  });

  // Test 5: Displays product ratings
  test("displays product ratings", () => {
    render(<RelatedProducts products={mockProducts} />);

    expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4")).toBeInTheDocument();
  });

  // Test 6: Displays product images
  test("renders product images correctly", () => {
    render(<RelatedProducts products={mockProducts} />);

    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "test-image.jpg");
  });

  // Test 7: Navigates to product details
  test("navigates to product details when clicking View Details", () => {
    render(<RelatedProducts products={mockProducts} />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "View Details",
      })[0]
    );

    expect(mockNavigate).toHaveBeenCalledWith("/product/1");
  });

  // Test 8: Navigates when clicking product image
  test("navigates to product details when clicking product image", () => {
    render(<RelatedProducts products={mockProducts} />);

    fireEvent.click(screen.getAllByRole("img")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/product/1");
  });

  // Test 9: Adds product to cart successfully
  test("adds product to cart successfully", async () => {
    render(<RelatedProducts products={mockProducts} />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        mockProducts[0]
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Sample Product One added to cart!"
    );
  });

  // Test 10: Changes button text after adding product
  test("displays Added after successfully adding product", async () => {
    render(<RelatedProducts products={mockProducts} />);

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

  // Test 11: Displays error when API fails
  test("displays error notification when adding product fails", async () => {
    addProductToCart.mockRejectedValueOnce(
      new Error("Cart API failed")
    );

    render(<RelatedProducts products={mockProducts} />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Cart API failed"
      );
    });
  });

  // Test 12: Displays default error message
  test("displays default error message when error has no message", async () => {
    addProductToCart.mockRejectedValueOnce({});

    render(<RelatedProducts products={mockProducts} />);

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

  // Test 13: Handles empty products array
  test("renders without errors when products array is empty", () => {
    const { container } = render(
      <RelatedProducts products={[]} />
    );

    expect(
      screen.getByText("Our Products")
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll("img")
    ).toHaveLength(0);
  });

  // Test 14: Resets Added button after two seconds
  test("resets Added button after two seconds", async () => {
    jest.useFakeTimers();

    try {
      render(<RelatedProducts products={mockProducts} />);

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

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(
        screen.getByRole("button", {
          name: "Add to Cart",
        })
      ).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  // Test 15: Prevents event propagation when adding to cart
  test("does not navigate when Add to Cart is clicked", async () => {
    render(<RelatedProducts products={mockProducts} />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
