
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import { MemoryRouter } from "react-router-dom";

import Shop from "../Shop";
import { getProducts } from "../../../api/productApi";

// ============================================================
// MOCK COMPONENTS
// ============================================================

jest.mock(
  "../../../components/ProductCard/ProductCard",
  () => {
    return function MockProductCard({ product }) {
      return (
        <div data-testid="product-card">
          <h3>{product.name}</h3>
          <span>{product.brand}</span>
          <span>{product.price}</span>
        </div>
      );
    };
  }
);

jest.mock(
  "../../../components/FilterPanel/FilterPanel",
  () => {
    return function MockFilterPanel({
      selectedCategory,
      setSelectedCategory,
      priceRange,
      setPriceRange,
      selectedRating,
      setSelectedRating,
      selectedBrand,
      setSelectedBrand,
      brands,
      categories,
      onReset,
    }) {
      return (
        <div data-testid="filter-panel">

          <select
            aria-label="Category filter"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
          >
            {categories.map((category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Price filter"
            value={priceRange}
            onChange={(event) =>
              setPriceRange(event.target.value)
            }
          >
            <option value="all">All Prices</option>
            <option value="0-199">0-199</option>
            <option value="200-499">200-499</option>
            <option value="500-999">500-999</option>
            <option value="1000-1999">1000-1999</option>
            <option value="2000">2000+</option>
          </select>

          <select
            aria-label="Rating filter"
            value={selectedRating}
            onChange={(event) =>
              setSelectedRating(event.target.value)
            }
          >
            <option value="all">All Ratings</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>

          <select
            aria-label="Brand filter"
            value={selectedBrand}
            onChange={(event) =>
              setSelectedBrand(event.target.value)
            }
          >
            <option value="all">All Brands</option>

            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <button onClick={onReset}>
            Reset Filters
          </button>

        </div>
      );
    };
  }
);

// ============================================================
// MOCK DATA
// No real product or personal information.
// ============================================================

const mockProducts = [
  {
    id: 1,
    name: "Sample Product A",
    brand: "Brand A",
    category: "medicines",
    price: 100,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Sample Product B",
    brand: "Brand B",
    category: "healthcare",
    price: 300,
    rating: 4.0,
  },
  {
    id: 3,
    name: "Sample Product C",
    brand: "Brand A",
    category: "vitamins",
    price: 600,
    rating: 3.5,
  },
  {
    id: 4,
    name: "Sample Product D",
    brand: "Brand C",
    category: "personal-care",
    price: 1500,
    rating: 5,
  },
  {
    id: 5,
    name: "Sample Product E",
    brand: "Brand B",
    category: "baby-care",
    price: 2500,
    rating: 4.8,
  },
];

// ============================================================
// RENDER HELPER
// ============================================================

function renderShop(path = "/shop") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Shop />
    </MemoryRouter>
  );
}

// ============================================================
// TEST SETUP
// ============================================================

beforeEach(() => {
  jest.clearAllMocks();

  getProducts.mockResolvedValue(mockProducts);
});

// ============================================================
// SHOP COMPONENT TESTS
// ============================================================

describe("MEDIKART SHOP TESTING", () => {

  // ----------------------------------------------------------
  // 1. RENDER SHOP PAGE
  // ----------------------------------------------------------

  test("renders shop page", async () => {
    renderShop();

    expect(
      await screen.findByRole("heading", {
        name: "All Products",
      })
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 2. LOAD PRODUCTS
  // ----------------------------------------------------------

  test("loads products from API", async () => {
    renderShop();

    expect(
      await screen.findByText("Sample Product A")
    ).toBeInTheDocument();

    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  // ----------------------------------------------------------
  // 3. DISPLAY ALL PRODUCTS
  // ----------------------------------------------------------

  test("displays all loaded products", async () => {
    renderShop();

    await screen.findByText("Sample Product E");

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(5);
  });

  // ----------------------------------------------------------
  // 4. CATEGORY FILTER
  // ----------------------------------------------------------

  test("filters products by category", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByLabelText("Category filter"),
      {
        target: { value: "medicines" },
      }
    );

    await waitFor(() => {
      expect(
        screen.getByText("Sample Product A")
      ).toBeInTheDocument();

      expect(
        screen.queryByText("Sample Product B")
      ).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 5. SEARCH PRODUCTS
  // ----------------------------------------------------------

  test("searches products by name", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByPlaceholderText(
        /search medicines, healthcare products/i
      ),
      {
        target: { value: "Sample Product C" },
      }
    );

    expect(
      screen.getByText("Sample Product C")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Sample Product A")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 6. SEARCH BY BRAND
  // ----------------------------------------------------------

  test("searches products by brand", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByPlaceholderText(
        /search medicines, healthcare products/i
      ),
      {
        target: { value: "Brand B" },
      }
    );

    expect(
      screen.getByText("Sample Product B")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sample Product E")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Sample Product A")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 7. CLEAR SEARCH
  // ----------------------------------------------------------

  test("clears search input", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    const search = screen.getByPlaceholderText(
      /search medicines, healthcare products/i
    );

    fireEvent.change(search, {
      target: { value: "Sample Product A" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear search",
      })
    );

    expect(search).toHaveValue("");

    expect(
      await screen.findByText("Sample Product E")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 8. PRICE FILTER
  // ----------------------------------------------------------

  test("filters products by price", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByLabelText("Price filter"),
      {
        target: { value: "200-499" },
      }
    );

    expect(
      screen.getByText("Sample Product B")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Sample Product A")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 9. RATING FILTER
  // ----------------------------------------------------------

  test("filters products by rating", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByLabelText("Rating filter"),
      {
        target: { value: "4" },
      }
    );

    expect(
      screen.getByText("Sample Product A")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Sample Product C")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 10. BRAND FILTER
  // ----------------------------------------------------------

  test("filters products by brand", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByLabelText("Brand filter"),
      {
        target: { value: "Brand A" },
      }
    );

    expect(
      screen.getByText("Sample Product A")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sample Product C")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Sample Product B")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 11. SORT PRICE LOW TO HIGH
  // ----------------------------------------------------------

  test("sorts products by price low to high", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "",
      }).closest(".shop-sort").querySelector("select"),
      {
        target: { value: "priceLow" },
      }
    );

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");

      expect(cards[0]).toHaveTextContent("Sample Product A");
      expect(cards[4]).toHaveTextContent("Sample Product E");
    });
  });

  // ----------------------------------------------------------
  // 12. SORT PRICE HIGH TO LOW
  // ----------------------------------------------------------

  test("sorts products by price high to low", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    const sortSelect = document.querySelector(
      ".shop-sort select"
    );

    fireEvent.change(sortSelect, {
      target: { value: "priceHigh" },
    });

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");

      expect(cards[0]).toHaveTextContent("Sample Product E");
      expect(cards[4]).toHaveTextContent("Sample Product A");
    });
  });

  // ----------------------------------------------------------
  // 13. SORT BY RATING
  // ----------------------------------------------------------

  test("sorts products by highest rating", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      document.querySelector(".shop-sort select"),
      {
        target: { value: "rating" },
      }
    );

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");

      expect(cards[0]).toHaveTextContent("Sample Product D");
    });
  });

  // ----------------------------------------------------------
  // 14. SORT BY NAME
  // ----------------------------------------------------------

  test("sorts products alphabetically", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      document.querySelector(".shop-sort select"),
      {
        target: { value: "name" },
      }
    );

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");

      expect(cards[0]).toHaveTextContent("Sample Product A");
      expect(cards[4]).toHaveTextContent("Sample Product E");
    });
  });

  // ----------------------------------------------------------
  // 15. RESET FILTERS
  // ----------------------------------------------------------

  test("resets all filters", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByLabelText("Brand filter"),
      {
        target: { value: "Brand A" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reset Filters",
      })
    );

    expect(
      screen.getByLabelText("Brand filter")
    ).toHaveValue("all");

    expect(
      await screen.findByText("Sample Product E")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 16. EMPTY SEARCH RESULTS
  // ----------------------------------------------------------

  test("displays no products message when search has no results", async () => {
    renderShop();

    await screen.findByText("Sample Product A");

    fireEvent.change(
      screen.getByPlaceholderText(
        /search medicines, healthcare products/i
      ),
      {
        target: { value: "Unknown Item" },
      }
    );

    expect(
      screen.getByText("No Products Found")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 17. CATEGORY URL
  // ----------------------------------------------------------

  test("loads selected category from URL", async () => {
    renderShop("/shop/medicines");

    expect(
      await screen.findByRole("heading", {
        name: "Medicines",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sample Product A")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Sample Product B")
    ).not.toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 18. CATEGORY ALIAS
  // ----------------------------------------------------------

  test("supports category URL aliases", async () => {
    renderShop("/shop/womencare");

    expect(
      await screen.findByRole("heading", {
        name: "Women's Health",
      })
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 19. API ERROR
  // ----------------------------------------------------------

  test("displays error when API request fails", async () => {
    getProducts.mockRejectedValue(
      new Error("API request failed")
    );

    renderShop();

    expect(
      await screen.findByText("Unable to Load Products")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Products could not be loaded from the database."
      )
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 20. EMPTY API RESPONSE
  // ----------------------------------------------------------

  test("displays empty message when API returns no products", async () => {
    getProducts.mockResolvedValue([]);

    renderShop();

    expect(
      await screen.findByText("No Products Found")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 21. API OBJECT RESPONSE
  // ----------------------------------------------------------

  test("supports API response containing products property", async () => {
    getProducts.mockResolvedValue({
      products: mockProducts,
    });

    renderShop();

    expect(
      await screen.findByText("Sample Product A")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 22. API DATA RESPONSE
  // ----------------------------------------------------------

  test("supports API response containing data property", async () => {
    getProducts.mockResolvedValue({
      data: mockProducts,
    });

    renderShop();

    expect(
      await screen.findByText("Sample Product A")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 23. API ITEMS RESPONSE
  // ----------------------------------------------------------

  test("supports API response containing items property", async () => {
    getProducts.mockResolvedValue({
      items: mockProducts,
    });

    renderShop();

    expect(
      await screen.findByText("Sample Product A")
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 24. LOAD MORE PRODUCTS
  // ----------------------------------------------------------

  test("loads more products when more than 12 exist", async () => {
    const manyProducts = Array.from(
      { length: 15 },
      (_, index) => ({
        id: index + 1,
        name: `Item ${index + 1}`,
        brand: "Test Brand",
        category: "medicines",
        price: 100,
        rating: 4,
      })
    );

    getProducts.mockResolvedValue(manyProducts);

    renderShop();

    expect(
      await screen.findByText("Item 1")
    ).toBeInTheDocument();

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(12);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load More Products",
      })
    );

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(15);
  });

  // ----------------------------------------------------------
  // 25. SHOW ALL PRODUCTS
  // ----------------------------------------------------------

  test("shows all products when Show All is clicked", async () => {
    const manyProducts = Array.from(
      { length: 15 },
      (_, index) => ({
        id: index + 1,
        name: `Item ${index + 1}`,
        brand: "Test Brand",
        category: "medicines",
        price: 100,
        rating: 4,
      })
    );

    getProducts.mockResolvedValue(manyProducts);

    renderShop();

    await screen.findByText("Item 1");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show All Products",
      })
    );

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(15);
  });

});
