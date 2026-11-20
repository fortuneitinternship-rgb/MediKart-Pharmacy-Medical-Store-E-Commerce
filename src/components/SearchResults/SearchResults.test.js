import { render, screen } from "@testing-library/react";
import SearchResults from "./SearchResults";

// Mock ProductCard component
jest.mock("../ProductCard/ProductCard", () => ({ product }) => (
  <div data-testid="product-card">{product.name}</div>
));

describe("SearchResults Component", () => {
  const mockProducts = [
    {
      id: 1,
      name: "Dolo 650",
      category: "Medicine",
      price: 30,
    },
    {
      id: 2,
      name: "Crocin",
      category: "Medicine",
      price: 45,
    },
  ];

  test("renders all product cards when products are available", () => {
    render(<SearchResults products={mockProducts} />);

    const cards = screen.getAllByTestId("product-card");

    expect(cards).toHaveLength(2);
    expect(screen.getByText("Dolo 650")).toBeInTheDocument();
    expect(screen.getByText("Crocin")).toBeInTheDocument();
  });

  test("shows 'No Products Found' when product list is empty", () => {
    render(<SearchResults products={[]} />);

    expect(screen.getByText("No Products Found")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Try searching with a different product name or category."
      )
    ).toBeInTheDocument();
  });

  test("does not show 'No Products Found' when products exist", () => {
    render(<SearchResults products={mockProducts} />);

    expect(
      screen.queryByText("No Products Found")
    ).not.toBeInTheDocument();
  });

  test("renders correct number of product cards", () => {
    render(<SearchResults products={mockProducts} />);

    expect(screen.getAllByTestId("product-card")).toHaveLength(
      mockProducts.length
    );
  });
});