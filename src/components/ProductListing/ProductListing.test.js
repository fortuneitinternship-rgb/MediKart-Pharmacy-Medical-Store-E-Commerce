
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import ProductListing from "./ProductListing";
import { getProducts } from "../../api/productApi";

// Mock API
jest.mock("../../api/productApi", () => ({
  getProducts: jest.fn(),
}));

// Mock ProductCard
jest.mock("../ProductCard/ProductCard", () => {
  return function MockProductCard({ product }) {
    return (
      <div data-testid="product-card">
        {product.name}
      </div>
    );
  };
});

// Mock SortDropdown
jest.mock("../SortDropdown/SortDropdown", () => {
  return function MockSortDropdown({ sortBy, setSortBy }) {
    return (
      <select
        aria-label="Sort products"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="">Default</option>
        <option value="priceLowHigh">Price Low to High</option>
        <option value="priceHighLow">Price High to Low</option>
        <option value="nameAZ">Name A-Z</option>
        <option value="nameZA">Name Z-A</option>
        <option value="rating">Rating</option>
        <option value="newest">Newest</option>
      </select>
    );
  };
});

const mockProducts = [
  {
    id: 1,
    name: "Alpha",
    category: "Category A",
    price: 100,
    rating: 4,
  },
  {
    id: 2,
    name: "Bravo",
    category: "Category B",
    price: 300,
    rating: 5,
  },
  {
    id: 3,
    name: "Charlie",
    category: "Category A",
    price: 200,
    rating: 3,
  },
  {
    id: 4,
    name: "Delta",
    category: "Category C",
    price: 400,
    rating: 4,
  },
  {
    id: 5,
    name: "Echo",
    category: "Category B",
    price: 150,
    rating: 5,
  },
];

const renderComponent = (props = {}) => {
  return render(
    <ProductListing
      sortBy=""
      setSortBy={jest.fn()}
      {...props}
    />
  );
};

describe("ProductListing Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Loading state
  test("displays loading message while products are loading", () => {
    getProducts.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(
      screen.getByText("Loading Products...")
    ).toBeInTheDocument();
  });

  // 2. API called on mount
  test("calls getProducts when component mounts", async () => {
    getProducts.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalledTimes(1);
    });
  });

  // 3. Successfully loads products
  test("displays products after successful API response", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    expect(
      await screen.findByText("Our Products")
    ).toBeInTheDocument();

    expect(screen.getAllByTestId("product-card")).toHaveLength(4);

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
  });

  // 4. API error
  test("displays error message when API request fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    getProducts.mockRejectedValue(
      new Error("API request failed")
    );

    renderComponent();

    expect(
      await screen.findByText(
        "Products could not be loaded from the database."
      )
    ).toBeInTheDocument();

    console.error.mockRestore();
  });

  // 5. Empty product list
  test("displays no products available when API returns empty array", async () => {
    getProducts.mockResolvedValue([]);

    renderComponent();

    expect(
      await screen.findByText("No Products Available")
    ).toBeInTheDocument();
  });

  // 6. Search input
  test("renders search input", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    expect(
      await screen.findByRole("textbox", {
        name: "Search products",
      })
    ).toBeInTheDocument();
  });

  // 7. Search by product name
  test("filters products by name", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    const searchInput = await screen.findByRole("textbox", {
      name: "Search products",
    });

    fireEvent.change(searchInput, {
      target: { value: "Alpha" },
    });

    expect(screen.getByText("Alpha")).toBeInTheDocument();

    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
  });

  // 8. Search by category
  test("filters products by category", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    const searchInput = await screen.findByRole("textbox", {
      name: "Search products",
    });

    fireEvent.change(searchInput, {
      target: { value: "Category A" },
    });

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();

    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
  });

  // 9. Case insensitive search
  test("search works without case sensitivity", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    const searchInput = await screen.findByRole("textbox", {
      name: "Search products",
    });

    fireEvent.change(searchInput, {
      target: { value: "alpha" },
    });

    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  // 10. No search results
  test("displays no products found for unmatched search", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    const searchInput = await screen.findByRole("textbox", {
      name: "Search products",
    });

    fireEvent.change(searchInput, {
      target: { value: "Unknown" },
    });

    expect(screen.getByText("No Products Found")).toBeInTheDocument();

    expect(
      screen.getByText("Try another search keyword.")
    ).toBeInTheDocument();
  });

  // 11. Clear search
  test("clears search input when clear icon is clicked", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    const searchInput = await screen.findByRole("textbox", {
      name: "Search products",
    });

    fireEvent.change(searchInput, {
      target: { value: "Alpha" },
    });

    expect(screen.getByText("Alpha")).toBeInTheDocument();

    const clearIcon = document.querySelector("svg");

    // Select the clear icon using its CSS module class
    const clearButton = document.querySelector(
      '[class*="clearIcon"]'
    );

    fireEvent.click(clearButton || clearIcon);

    expect(searchInput).toHaveValue("");
    expect(screen.getAllByTestId("product-card")).toHaveLength(4);
  });

  // 12. Default visible products
  test("displays only four products initially", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    await screen.findByText("Our Products");

    expect(screen.getAllByTestId("product-card")).toHaveLength(4);
  });

  // 13. Load more
  test("loads additional products when Load More is clicked", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    await screen.findByText("Our Products");

    fireEvent.click(screen.getByRole("button", {
      name: "Load More",
    }));

    expect(screen.getAllByTestId("product-card")).toHaveLength(5);

    expect(
      screen.queryByRole("button", {
        name: "Load More",
      })
    ).not.toBeInTheDocument();
  });

  // 14. Sort by price low to high
  test("sorts products by price from low to high", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent({
      sortBy: "priceLowHigh",
    });

    await screen.findByText("Our Products");

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Alpha");
    expect(cards[1]).toHaveTextContent("Echo");
    expect(cards[2]).toHaveTextContent("Charlie");
    expect(cards[3]).toHaveTextContent("Bravo");
  });

  // 15. Sort by price high to low
  test("sorts products by price from high to low", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent({
      sortBy: "priceHighLow",
    });

    await screen.findByText("Our Products");

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Delta");
    expect(cards[1]).toHaveTextContent("Bravo");
    expect(cards[2]).toHaveTextContent("Charlie");
    expect(cards[3]).toHaveTextContent("Echo");
  });

  // 16. Sort by name A-Z
  test("sorts products by name A-Z", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent({
      sortBy: "nameAZ",
    });

    await screen.findByText("Our Products");

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Alpha");
    expect(cards[1]).toHaveTextContent("Bravo");
    expect(cards[2]).toHaveTextContent("Charlie");
    expect(cards[3]).toHaveTextContent("Delta");
  });

  // 17. Sort by name Z-A
  test("sorts products by name Z-A", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent({
      sortBy: "nameZA",
    });

    await screen.findByText("Our Products");

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Echo");
    expect(cards[1]).toHaveTextContent("Delta");
    expect(cards[2]).toHaveTextContent("Charlie");
    expect(cards[3]).toHaveTextContent("Bravo");
  });

  // 18. Sort by rating
  test("sorts products by rating from highest to lowest", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent({
      sortBy: "rating",
    });

    await screen.findByText("Our Products");

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Bravo");
    expect(cards[1]).toHaveTextContent("Echo");
  });

  // 19. Sort by newest
  test("sorts products by newest ID", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent({
      sortBy: "newest",
    });

    await screen.findByText("Our Products");

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Echo");
    expect(cards[1]).toHaveTextContent("Delta");
    expect(cards[2]).toHaveTextContent("Charlie");
    expect(cards[3]).toHaveTextContent("Bravo");
  });

  // 20. Search resets visible count
  test("resets visible products when search changes", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    await screen.findByText("Our Products");

    fireEvent.click(screen.getByRole("button", {
      name: "Load More",
    }));

    expect(screen.getAllByTestId("product-card")).toHaveLength(5);

    const searchInput = screen.getByRole("textbox", {
      name: "Search products",
    });

    fireEvent.change(searchInput, {
      target: { value: "Category A" },
    });

    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
  });

  // 21. Sort dropdown
  test("renders sort dropdown", async () => {
    getProducts.mockResolvedValue(mockProducts);

    renderComponent();

    expect(
      await screen.findByRole("combobox", {
        name: "Sort products",
      })
    ).toBeInTheDocument();
  });
});
