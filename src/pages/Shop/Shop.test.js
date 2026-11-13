
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Shop from "./Shop";
import { getProducts } from "../../api/productApi";
import { toast } from "react-toastify";

jest.mock("../../api/productApi", () => ({
  getProducts: jest.fn(),
}));

jest.mock("../../utils/productImage", () => ({
  getUniqueProductsByImage: (items) => items,
}));

jest.mock("react-toastify", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../components/ProductCard/ProductCard", () => {
  return function MockProductCard({ product }) {
    return (
      <article data-testid="product-card">
        {product.name}
      </article>
    );
  };
});

jest.mock("../../components/FilterPanel/FilterPanel", () => {
  return function MockFilterPanel(props) {
    return (
      <div data-testid="filter-panel">
        <select
          aria-label="Category"
          value={props.selectedCategory}
          onChange={(event) =>
            props.setSelectedCategory(event.target.value)
          }
        >
          {props.categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Price range"
          value={props.priceRange}
          onChange={(event) =>
            props.setPriceRange(event.target.value)
          }
        >
          <option value="all">All prices</option>
          <option value="0-199">0-199</option>
          <option value="200-499">200-499</option>
          <option value="500-999">500-999</option>
          <option value="1000-1999">1000-1999</option>
          <option value="2000">2000+</option>
        </select>

        <select
          aria-label="Rating"
          value={props.selectedRating}
          onChange={(event) =>
            props.setSelectedRating(event.target.value)
          }
        >
          <option value="all">All ratings</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </select>

        <select
          aria-label="Brand"
          value={props.selectedBrand}
          onChange={(event) =>
            props.setSelectedBrand(event.target.value)
          }
        >
          <option value="all">All brands</option>
          {props.brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <button type="button" onClick={props.onReset}>
          Reset Filters
        </button>
      </div>
    );
  };
});

// Generic temporary test fixtures.
// These are not real customer or product records.
const createItem = (id, overrides = {}) => ({
  id,
  name: `Item ${id}`,
  brand: `Brand ${id}`,
  category: "Healthcare",
  price: 100,
  discount_price: 100,
  rating: 4,
  ...overrides,
});

const renderShop = (initialEntry = "/shop") => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Shop Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays loading state while data is loading", () => {
    getProducts.mockReturnValue(new Promise(() => { }));

    renderShop();

    expect(
      screen.getByText("Loading Products...")
    ).toBeInTheDocument();
  });

  test("loads and displays items successfully", async () => {
    getProducts.mockResolvedValue([
      createItem(1),
      createItem(2),
    ]);

    renderShop();

    expect(
      await screen.findAllByTestId("product-card")
    ).toHaveLength(2);

    expect(screen.getByText("2 Products")).toBeInTheDocument();
  });

  test("displays an error when loading fails", async () => {
    getProducts.mockRejectedValue(new Error("Request failed"));

    renderShop();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Products could not be loaded from the database."
    );
  });

  test("displays empty state when no items are available", async () => {
    getProducts.mockResolvedValue([]);

    renderShop();

    expect(
      await screen.findByText("No Products Found")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Try changing your search or filters.")
    ).toBeInTheDocument();
  });

  test("renders filter panel", async () => {
    getProducts.mockResolvedValue([createItem(1)]);

    renderShop();

    expect(
      await screen.findByTestId("filter-panel")
    ).toBeInTheDocument();
  });

  test("searches items by name", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { name: "Alpha" }),
      createItem(2, { name: "Beta" }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(
      screen.getByPlaceholderText(
        "Search medicines, healthcare products..."
      ),
      { target: { value: "Alpha" } }
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  test("clears search text", async () => {
    getProducts.mockResolvedValue([
      createItem(1),
      createItem(2),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    const searchInput = screen.getByPlaceholderText(
      "Search medicines, healthcare products..."
    );

    fireEvent.change(searchInput, {
      target: { value: "Item 1" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Clear search" })
    );

    expect(searchInput).toHaveValue("");
    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
  });

  test("shows no results for unmatched search", async () => {
    getProducts.mockResolvedValue([createItem(1)]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(
      screen.getByPlaceholderText(
        "Search medicines, healthcare products..."
      ),
      { target: { value: "No matching item" } }
    );

    expect(
      screen.getByText("No Products Found")
    ).toBeInTheDocument();
  });

  test("sorts items by price low to high", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { price: 300 }),
      createItem(2, { price: 100 }),
      createItem(3, { price: 200 }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByRole("combobox", {
      name: "",
    }), {
      target: { value: "priceLow" },
    });

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");

      expect(cards[0]).toHaveTextContent("Item 2");
      expect(cards[1]).toHaveTextContent("Item 3");
      expect(cards[2]).toHaveTextContent("Item 1");
    });
  });

  test("filters items by price range", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { price: 100 }),
      createItem(2, { price: 300 }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByLabelText("Price range"), {
      target: { value: "0-199" },
    });
  });

  test("filters items by rating", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { rating: 3 }),
      createItem(2, { rating: 5 }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByLabelText("Rating"), {
      target: { value: "4" },
    });

    expect(screen.getAllByTestId("product-card")).toHaveLength(1);
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  test("filters items by brand", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { brand: "Brand A" }),
      createItem(2, { brand: "Brand B" }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByLabelText("Brand"), {
      target: { value: "Brand A" },
    });

    expect(screen.getAllByTestId("product-card")).toHaveLength(1);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  test("filters items by category", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { category: "Healthcare" }),
      createItem(2, { category: "Medicines" }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "medicines" },
    });

    expect(screen.getAllByTestId("product-card")).toHaveLength(1);
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  test("resets all filters", async () => {
    getProducts.mockResolvedValue([
      createItem(1),
      createItem(2),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByLabelText("Price range"), {
      target: { value: "0-199" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Reset Filters" })
    );

    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    expect(toast.success).toHaveBeenCalledWith(
      "All filters have been cleared"
    );
  });

  test("loads more items when Load More is clicked", async () => {
    const items = Array.from({ length: 15 }, (_, index) =>
      createItem(index + 1)
    );

    getProducts.mockResolvedValue(items);

    renderShop();

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(12);
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load More Products",
      })
    );

    expect(screen.getAllByTestId("product-card")).toHaveLength(15);
  });

  test("shows all items when Show All is clicked", async () => {
    const items = Array.from({ length: 15 }, (_, index) =>
      createItem(index + 1)
    );

    getProducts.mockResolvedValue(items);

    renderShop();

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(12);
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show All Products",
      })
    );

    expect(screen.getAllByTestId("product-card")).toHaveLength(15);
  });

  test("loads products only once on initial render", async () => {
    getProducts.mockResolvedValue([]);

    renderShop();

    await screen.findByText("No Products Found");

    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  test("uses category from the route", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { category: "Medicines" }),
      createItem(2, { category: "Healthcare" }),
    ]);

    renderShop("/shop/medicines");

    expect(
      await screen.findByText("1 Products")
    ).toBeInTheDocument();

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Item 2")).not.toBeInTheDocument();
  });

  test("sorts items by rating", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { rating: 3 }),
      createItem(2, { rating: 5 }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByRole("combobox", {
      name: "",
    }), {
      target: { value: "rating" },
    });

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Item 2");
    expect(cards[1]).toHaveTextContent("Item 1");
  });

  test("displays category count after filtering", async () => {
    getProducts.mockResolvedValue([
      createItem(1, { category: "Healthcare" }),
      createItem(2, { category: "Medicines" }),
    ]);

    renderShop();

    await screen.findAllByTestId("product-card");

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "medicines" },
    });

    expect(screen.getByText("1 Products")).toBeInTheDocument();
  });
});
