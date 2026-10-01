import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "./ProductCard";

// Mock the react-icons
jest.mock("react-icons/fa", () => ({
  FaHeart: () => <span data-testid="heart-icon">❤️</span>,
  FaShoppingCart: () => <span data-testid="cart-icon">🛒</span>,
  FaEye: () => <span data-testid="eye-icon">👁️</span>,
  FaStar: () => <span data-testid="star-icon">⭐</span>,
}));

// Mock the CSS import
jest.mock("./ProductCard.css", () => ({}));

describe("ProductCard Component", () => {
  const mockProduct = {
    id: 1,
    name: "Test Product",
    brand: "Test Brand",
    category: "Test Category",
    price: 999,
    rating: 4.5,
    stock: true,
    image: "test-image.jpg",
  };

  const mockOnAddToCart = jest.fn();
  const mockOnAddToWishlist = jest.fn();

  const renderProductCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <ProductCard
          product={mockProduct}
          onAddToCart={mockOnAddToCart}
          onAddToWishlist={mockOnAddToWishlist}
          {...props}
        />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders product information correctly", () => {
    renderProductCard();

    // Check if product name is rendered
    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Check if brand is rendered
    expect(screen.getByText("Test Brand")).toBeInTheDocument();

    // Check if category is rendered
    expect(screen.getByText("Test Category")).toBeInTheDocument();

    // Check if price is rendered with correct format
    expect(screen.getByText("₹999")).toBeInTheDocument();

    // Check if rating is rendered
    expect(screen.getByText("4.5")).toBeInTheDocument();

    // Check if stock status is rendered
    expect(screen.getByText("✔ In Stock")).toBeInTheDocument();
  });

  test("renders product image with correct src and alt", () => {
    renderProductCard();

    const image = screen.getByAltText("Test Product");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.jpg");
  });

  test("displays 'Out of Stock' when stock is false", () => {
    const outOfStockProduct = { ...mockProduct, stock: false };
    renderProductCard({ product: outOfStockProduct });

    expect(screen.getByText("✖ Out of Stock")).toBeInTheDocument();
  });

  test("applies correct stock status class", () => {
    const { rerender } = renderProductCard();
    const stockElement = screen.getByText("✔ In Stock");
    expect(stockElement).toHaveClass("stock in");

    // Rerender with out of stock
    const outOfStockProduct = { ...mockProduct, stock: false };
    rerender(
      <BrowserRouter>
        <ProductCard
          product={outOfStockProduct}
          onAddToCart={mockOnAddToCart}
          onAddToWishlist={mockOnAddToWishlist}
        />
      </BrowserRouter>
    );

    const outOfStockElement = screen.getByText("✖ Out of Stock");
    expect(outOfStockElement).toHaveClass("stock out");
  });

  test("calls onAddToCart when Add to Cart button is clicked", () => {
    renderProductCard();

    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  test("calls onAddToWishlist when Wishlist button is clicked", () => {
    renderProductCard();

    const wishlistButton = screen.getByRole("button", { name: /wishlist/i });
    fireEvent.click(wishlistButton);

    expect(mockOnAddToWishlist).toHaveBeenCalledTimes(1);
    expect(mockOnAddToWishlist).toHaveBeenCalledWith(mockProduct);
  });

  test("renders View Details link with correct URL", () => {
    renderProductCard();

    const detailsLink = screen.getByRole("link", { name: /view details/i });
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink).toHaveAttribute("href", "/product/1");
  });

  test("renders all icons correctly", () => {
    renderProductCard();

    expect(screen.getByTestId("cart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
  });

  test("renders rating with star icon", () => {
    renderProductCard();

    const ratingContainer = screen.getByText("4.5").parentElement;
    expect(ratingContainer).toContainElement(screen.getByTestId("star-icon"));
  });

  test("handles missing optional props gracefully", () => {
    const minimalProduct = {
      id: 2,
      name: "Minimal Product",
      brand: "Minimal Brand",
      category: "Minimal Category",
      price: 500,
      rating: 3.0,
      stock: true,
      image: "minimal.jpg",
    };

    render(
      <BrowserRouter>
        <ProductCard
          product={minimalProduct}
          onAddToCart={mockOnAddToCart}
          onAddToWishlist={mockOnAddToWishlist}
        />
      </BrowserRouter>
    );
  });

  test("renders buttons with correct accessibility attributes", () => {
    renderProductCard();

    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
    const wishlistButton = screen.getByRole("button", { name: /wishlist/i });
    const detailsLink = screen.getByRole("link", { name: /view details/i });

    expect(addToCartButton).toBeEnabled();
    expect(wishlistButton).toBeEnabled();
    expect(detailsLink).toBeInTheDocument();
  });

  test("matches snapshot", () => {
    const { container } = renderProductCard();
    expect(container).toMatchSnapshot();
  });
});