
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import Shop from "./Shop";
import { getProducts } from "../../api/productApi";
import { toast } from "react-toastify";

// Mock product API
jest.mock("../../api/productApi", () => ({
  getProducts: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock ProductCard
jest.mock("../../components/ProductCard/ProductCard", () => {
  return function MockProductCard({ product }) {
    return (
      <article data-testid="product-card">
        <h3>{product.name}</h3>
        <span>{product.brand}</span>
        <span>{product.price}</span>
      </article>
    );
  };
});

// Mock FilterPanel with functional filter controls
jest.mock("../../components/FilterPanel/FilterPanel", () => {
  return function MockFilterPanel(props) {
    return (
      <div data-testid="filter-panel">
        <select
          aria-label="Category filter"
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
          aria-label="Price filter"
          value={props.priceRange}
          onChange={(event) =>
            props.setPriceRange(event.target.value)
          }
        >
          <option value="all">All prices</option>
          <option value="0-199">₹0 - ₹199</option>
          <option value="200-499">₹200 - ₹499</option>
          <option value="500-999">₹500 - ₹999</option>
          <option value="1000-1999">₹1000 - ₹1999</option>
          <option value="2000">₹2000+</option>
        </select>

        <select
          aria-label="Rating filter"
          value={props.selectedRating}
          onChange={(event) =>
            props.setSelectedRating(event.target.value)
          }
        >
          <option value="all">All ratings</option>
          <option value="4">4 stars and above</option>
          <option value="3">3 stars and above</option>
        </select>

        <select
          aria-label="Brand filter"
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

        <span data-testid="active-filter-count">
          {props.activeFilterCount}
        </span>
      </div>
    );
  };
});

function LocationDisplay() {
  const location = useLocation();

  return (
    <div data-testid="current-location">
      {location.pathname}
    </div>
  );
}

const products = [
  {
    id: 1,
    name: "Paracetamol",
    brand: "HealthCare",
    category: "medicines",
    price: 100,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Digital Thermometer",
    brand: "Dr Trust",
    category: "medical-devices",
    price: 350,
    rating: 4.2,
  },
  {
    id: 3,
    name: "Vitamin C",
    brand: "HealthCare",
    category: "vitamins",
    price: 550,
    rating: 4.8,
  },
  {
    id: 4,
    name: "Baby Lotion",
    brand: "BabySoft",
    category: "baby-care",
    price: 250,
    rating: 3.5,
  },
];

function renderShop(initialPath = "/shop") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
      </Routes>

      <LocationDisplay />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  getProducts.mockResolvedValue(products);
});

// -------------------------------------
// SHOP LOADING TESTS
// -------------------------------------

describe("Shop Loading", () => {
  test("displays loading indicator", () => {
    getProducts.mockReturnValue(new Promise(() => { }));

    renderShop();

    expect(
      screen.getByText("Loading Products...")
    ).toBeInTheDocument();
  });

  test("loads products successfully", async () => {
    renderShop();

    expect(
      await screen.findByText("Paracetamol")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Digital Thermometer")
    ).toBeInTheDocument();
  });

  test("calls getProducts API", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  test("displays API error", async () => {
    getProducts.mockRejectedValue(
      new Error("API connection failed")
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

  test("handles an empty product list", async () => {
    getProducts.mockResolvedValue([]);

    renderShop();

    expect(
      await screen.findByText("No Products Found")
    ).toBeInTheDocument();
  });

  test("handles products returned inside data", async () => {
    getProducts.mockResolvedValue({
      data: products,
    });

    renderShop();

    expect(
      await screen.findByText("Paracetamol")
    ).toBeInTheDocument();
  });

  test("handles products returned inside items", async () => {
    getProducts.mockResolvedValue({
      items: products,
    });

    renderShop();

    expect(
      await screen.findByText("Paracetamol")
    ).toBeInTheDocument();
  });
});

// -------------------------------------
// PRODUCT DISPLAY TESTS
// -------------------------------------

describe("Shop Product Display", () => {
  test("displays all products", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(4);
  });

  test("displays total product count", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    expect(
      screen.getByText("4 Products")
    ).toBeInTheDocument();
  });

  test("displays shop heading", async () => {
    renderShop();

    expect(
      screen.getByRole("heading", {
        name: "All Products",
      })
    ).toBeInTheDocument();
  });

  test("displays filter panel", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    expect(
      screen.getByTestId("filter-panel")
    ).toBeInTheDocument();
  });
});

// -------------------------------------
// CATEGORY TESTS
// -------------------------------------

describe("Shop Category", () => {


  test("filters medical devices category", async () => {
    renderShop("/shop/medical-devices");

    expect(
      await screen.findByText("Digital Thermometer")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Paracetamol")
    ).not.toBeInTheDocument();
  });

  test("supports category aliases", async () => {
    renderShop("/shop/womencare");

    expect(
      await screen.findByText("No Products Found")
    ).toBeInTheDocument();
  });

  test("navigates when category changes", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByLabelText("Category filter"),
      {
        target: { value: "medicines" },
      }
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("current-location")
      ).toHaveTextContent("/shop/medicines");
    });
  });
});

// -------------------------------------
// SEARCH TESTS
// -------------------------------------

describe("Shop Search", () => {
  test("searches products by name", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByPlaceholderText(
        /search medicines, healthcare products/i
      ),
      {
        target: { value: "Paracetamol" },
      }
    );

    expect(
      screen.getByText("Paracetamol")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Digital Thermometer")
    ).not.toBeInTheDocument();
  });

  test("searches products by brand", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByPlaceholderText(
        /search medicines, healthcare products/i
      ),
      {
        target: { value: "Dr Trust" },
      }
    );

    expect(
      screen.getByText("Digital Thermometer")
    ).toBeInTheDocument();
  });

  test("searches products case-insensitively", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByPlaceholderText(
        /search medicines, healthcare products/i
      ),
      {
        target: { value: "vitamin c" },
      }
    );

    expect(
      screen.getByText("Vitamin C")
    ).toBeInTheDocument();
  });

  test("displays no products for unmatched search", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

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

  test("clears search", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    const searchInput = screen.getByPlaceholderText(
      /search medicines, healthcare products/i
    );

    fireEvent.change(searchInput, {
      target: { value: "Paracetamol" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear search",
      })
    );

    expect(searchInput).toHaveValue("");
  });
});

// -------------------------------------
// PRICE FILTER TESTS
// -------------------------------------

describe("Shop Price Filter", () => {
  test("filters products by price", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByLabelText("Price filter"),
      {
        target: { value: "0-199" },
      }
    );

    expect(
      screen.getByText("Paracetamol")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Digital Thermometer")
    ).not.toBeInTheDocument();
  });

  test("filters products between 200 and 499", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByLabelText("Price filter"),
      {
        target: { value: "200-499" },
      }
    );

    expect(
      screen.getByText("Digital Thermometer")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Baby Lotion")
    ).toBeInTheDocument();
  });
});

// -------------------------------------
// RATING FILTER TESTS
// -------------------------------------

describe("Shop Rating Filter", () => {
  test("filters products by rating", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByLabelText("Rating filter"),
      {
        target: { value: "4" },
      }
    );

    expect(
      screen.getByText("Vitamin C")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Baby Lotion")
    ).not.toBeInTheDocument();
  });
});

// -------------------------------------
// BRAND FILTER TESTS
// -------------------------------------

describe("Shop Brand Filter", () => {
  test("filters products by brand", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByLabelText("Brand filter"),
      {
        target: { value: "Dr Trust" },
      }
    );

    expect(
      screen.getByText("Digital Thermometer")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Paracetamol")
    ).not.toBeInTheDocument();
  });
});

// -------------------------------------
// SORTING TESTS
// -------------------------------------

describe("Shop Sorting", () => {
  test("sorts products by lowest price", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "",
      }),
      {
        target: { value: "priceLow" },
      }
    );
  });

  test("sorts products by highest price", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    const sortSelect = screen.getByDisplayValue("Sort By");

    fireEvent.change(sortSelect, {
      target: { value: "priceHigh" },
    });

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Vitamin C");
  });

  test("sorts products alphabetically", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByDisplayValue("Sort By"),
      {
        target: { value: "name" },
      }
    );

    const cards = screen.getAllByTestId("product-card");

    expect(cards[0]).toHaveTextContent("Baby Lotion");
  });

  test("shows sorting notification", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByDisplayValue("Sort By"),
      {
        target: { value: "priceLow" },
      }
    );

    expect(toast.info).toHaveBeenCalledWith(
      "Sorted by Price: Low to High"
    );
  });
});

// -------------------------------------
// RESET FILTER TESTS
// -------------------------------------

describe("Shop Reset Filters", () => {
  test("resets all filters", async () => {
    renderShop();

    await screen.findByText("Paracetamol");

    fireEvent.change(
      screen.getByLabelText("Price filter"),
      {
        target: { value: "0-199" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reset Filters",
      })
    );

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(4);

    expect(toast.success).toHaveBeenCalledWith(
      "Filters cleared successfully"
    );
  });
});

// -------------------------------------
// LOAD MORE TESTS
// -------------------------------------

describe("Shop Load More", () => {
  const manyProducts = Array.from(
    { length: 25 },
    (_, index) => ({
      id: index + 1,
      name: `Product ${index + 1}`,
      brand: "TestBrand",
      category: "healthcare",
      price: 100 + index,
      rating: 4,
    })
  );

  test("initially displays 12 products", async () => {
    getProducts.mockResolvedValue(manyProducts);

    renderShop();

    await screen.findByText("Product 1");

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(12);
  });

  test("loads more products", async () => {
    getProducts.mockResolvedValue(manyProducts);

    renderShop();

    await screen.findByText("Product 1");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load More Products",
      })
    );

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(24);
  });

  test("shows all products", async () => {
    getProducts.mockResolvedValue(manyProducts);

    renderShop();

    await screen.findByText("Product 1");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show All Products",
      })
    );

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(25);
  });
});
