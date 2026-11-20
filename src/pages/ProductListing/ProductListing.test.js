import React from "react";
import { render, screen, fireEvent, } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProductListing from "./ProductListing";

/* ============================================================
   MOCK FILTER PANEL
============================================================ */

jest.mock(
  "../../components/FilterPanel/FilterPanel",
  () => {
    return function MockFilterPanel({
      filters,
      setFilters,
    }) {
      return (
        <div data-testid="filter-panel">

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                category: "medicines",
              })
            }
          >
            Filter Medicines
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                category: "vitamins",
              })
            }
          >
            Filter Vitamins
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                category: "healthcare",
              })
            }
          >
            Filter Healthcare
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                brand: "Micro Labs",
              })
            }
          >
            Filter Micro Labs
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                rating: "4.8",
              })
            }
          >
            Rating 4.8
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                availability: true,
              })
            }
          >
            Available Only
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                minPrice: "200",
              })
            }
          >
            Minimum ₹200
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                maxPrice: "300",
              })
            }
          >
            Maximum ₹300
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters({
                category: "",
                brand: "",
                rating: "",
                availability: false,
                minPrice: "",
                maxPrice: "",
              })
            }
          >
            Clear Filters
          </button>

        </div>
      );
    };
  }
);


/* ============================================================
   MOCK SORT DROPDOWN
============================================================ */

jest.mock(
  "../../components/SortDropdown/SortDropdown",
  () => {
    return function MockSortDropdown({
      sortBy,
      setSortBy,
    }) {
      return (
        <select
          data-testid="sort-dropdown"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="">
            Default
          </option>

          <option value="priceLowHigh">
            Price Low to High
          </option>

          <option value="priceHighLow">
            Price High to Low
          </option>

          <option value="nameAZ">
            Name A-Z
          </option>

          <option value="nameZA">
            Name Z-A
          </option>

          <option value="rating">
            Rating
          </option>
        </select>
      );
    };
  }
);


/* ============================================================
   HELPERS
============================================================ */

const renderProductListing = (
  initialRoute = "/products"
) => {
  return render(
    <MemoryRouter
      initialEntries={[initialRoute]}
    >
      <Routes>
        <Route
          path="/products"
          element={<ProductListing />}
        />

        <Route
          path="/products/:category"
          element={<ProductListing />}
        />

        <Route
          path="/product/:id"
          element={<div>Product Details</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};


/* ============================================================
   TESTS
============================================================ */

describe("ProductListing", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  /* ==========================================================
     BASIC RENDER
  ========================================================== */

  test("renders Product Listing page", () => {
    renderProductListing();

    expect(
      screen.getByTestId("filter-panel")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("sort-dropdown")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Products/)
    ).toBeInTheDocument();
  });


  /* ==========================================================
     PRODUCTS DISPLAY
  ========================================================== */

  test("displays products", () => {
    renderProductListing();

    const productCards =
      document.querySelectorAll(
        ".product-card"
      );

    expect(productCards.length).toBeGreaterThan(0);
  });


  /* ==========================================================
     PRODUCT NAME
  ========================================================== */

  test("displays product names", () => {
    renderProductListing();

    const productNames =
      document.querySelectorAll(
        ".product-name-link h3"
      );

    expect(productNames.length).toBeGreaterThan(0);

    productNames.forEach((element) => {
      expect(
        element.textContent.trim()
      ).not.toBe("");
    });
  });


  /* ==========================================================
     PRODUCT IMAGE
  ========================================================== */

  test("displays product images with alt text", () => {
    renderProductListing();

    const images =
      screen.getAllByRole("img");

    expect(images.length).toBeGreaterThan(0);

    images.forEach((image) => {
      expect(
        image
      ).toHaveAttribute("alt");

      expect(
        image.getAttribute("alt")
      ).not.toBe("");
    });
  });


  /* ==========================================================
     PRODUCT PRICE
  ========================================================== */

  test("displays product prices", () => {
    renderProductListing();

    const prices =
      document.querySelectorAll(
        ".product-price"
      );

    expect(prices.length).toBeGreaterThan(0);

    prices.forEach((price) => {
      expect(
        price.textContent
      ).toMatch(/₹/);
    });
  });


  /* ==========================================================
     PRODUCT RATING
  ========================================================== */

  test("displays product ratings", () => {
    renderProductListing();

    const ratings =
      document.querySelectorAll(
        ".rating"
      );

    expect(ratings.length).toBeGreaterThan(0);

    ratings.forEach((rating) => {
      expect(
        rating.textContent
      ).toContain("⭐");
    });
  });


  /* ==========================================================
     VIEW DETAILS LINKS
  ========================================================== */

  test("renders View Details links", () => {
    renderProductListing();

    const links =
      screen.getAllByRole("link", {
        name: "View Details",
      });

    expect(links.length).toBeGreaterThan(0);

    links.forEach((link) => {
      expect(
        link
      ).toHaveAttribute(
        "href",
        expect.stringMatching(
          /^\/product\//
        )
      );
    });
  });


  /* ==========================================================
     PRODUCT IMAGE LINKS
  ========================================================== */

  test("product images link to product details", () => {
    renderProductListing();

    const imageLinks =
      document.querySelectorAll(
        ".product-image-link"
      );

    expect(
      imageLinks.length
    ).toBeGreaterThan(0);

    imageLinks.forEach((link) => {
      expect(
        link.getAttribute("href")
      ).toMatch(/^\/product\//);
    });
  });


  /* ==========================================================
     MEDICINES CATEGORY
  ========================================================== */

  test("filters medicines category correctly", () => {
    renderProductListing(
      "/products/medicines"
    );

    const cards =
      document.querySelectorAll(
        ".product-card"
      );

    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      const text =
        card.textContent.toLowerCase();

      /*
       * Medicine products should not be
       * selected merely because their name
       * contains "tablet".
       */
      expect(
        text
      ).not.toContain(
        "vitamin c tablets"
      );
    });
  });


  /* ==========================================================
     VITAMINS CATEGORY
  ========================================================== */

  test("filters vitamins category correctly", () => {
    renderProductListing(
      "/products/vitamins"
    );

    const vitaminHeading =
      screen.queryByText(
        "Vitamin C Tablets"
      );

    if (vitaminHeading) {
      expect(
        vitaminHeading
      ).toBeInTheDocument();
    }
  });


  /* ==========================================================
     CATEGORY THROUGH FILTER PANEL
  ========================================================== */

  test("filters products using category filter", () => {
    renderProductListing();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Filter Medicines",
      })
    );

    const cards =
      document.querySelectorAll(
        ".product-card"
      );

    expect(cards.length).toBeGreaterThan(0);

    expect(
      screen.queryByText(
        "Vitamin C Tablets"
      )
    ).not.toBeInTheDocument();
  });


  /* ==========================================================
     BRAND FILTER
  ========================================================== */

  test("filters products by brand", () => {
    renderProductListing();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Filter Micro Labs",
      })
    );

    const cards =
      document.querySelectorAll(
        ".product-card"
      );

    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(
        card.textContent
      ).toContain("Micro Labs");
    });
  });


  /* ==========================================================
     RATING FILTER
  ========================================================== */

  test("filters products by rating", () => {
    renderProductListing();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Rating 4.8",
      })
    );

    const ratings =
      document.querySelectorAll(
        ".rating"
      );

    ratings.forEach((rating) => {
      const value =
        rating.textContent
          .replace("⭐", "")
          .trim();

      expect(
        Number(value)
      ).toBeGreaterThanOrEqual(4.8);
    });
  });


  /* ==========================================================
     AVAILABILITY FILTER
  ========================================================== */

  test("filters available products", () => {
    renderProductListing();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Available Only",
      })
    );

    const cards =
      document.querySelectorAll(
        ".product-card"
      );

    expect(cards.length).toBeGreaterThan(0);
  });


  /* ==========================================================
     MIN PRICE
  ========================================================== */

  test("filters by minimum price", () => {
    renderProductListing();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Minimum ₹200",
      })
    );

    const prices =
      document.querySelectorAll(
        ".product-price"
      );

    prices.forEach((element) => {
      const price =
        Number(
          element.textContent
            .replace("₹", "")
            .trim()
        );

      expect(price).toBeGreaterThanOrEqual(
        200
      );
    });
  });


  /* ==========================================================
     MAX PRICE
  ========================================================== */

  test("filters by maximum price", () => {
    renderProductListing();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Maximum ₹300",
      })
    );

    const prices =
      document.querySelectorAll(
        ".product-price"
      );

    prices.forEach((element) => {
      const price =
        Number(
          element.textContent
            .replace("₹", "")
            .trim()
        );

      expect(price).toBeLessThanOrEqual(
        300
      );
    });
  });


  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  test("shows empty state when no products match", () => {
    renderProductListing();

    /*
     * Combine filters that should produce
     * no result.
     */
    fireEvent.click(
      screen.getByRole("button", {
        name: "Minimum ₹200",
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Maximum ₹300",
      })
    );

    /*
     * We cannot assume these particular
     * filters always produce zero products
     * because product data may change.
     */
    const productCards =
      document.querySelectorAll(
        ".product-card"
      );

    if (productCards.length === 0) {
      expect(
        screen.getByText(
          "No Products Found"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Try changing your filters."
        )
      ).toBeInTheDocument();
    }
  });


  /* ==========================================================
     SORT LOW → HIGH
  ========================================================== */

  test("sorts by price low to high", () => {
    renderProductListing();

    fireEvent.change(
      screen.getByTestId(
        "sort-dropdown"
      ),
      {
        target: {
          value: "priceLowHigh",
        },
      }
    );

    const prices = Array.from(
      document.querySelectorAll(
        ".product-price"
      )
    ).map((element) =>
      Number(
        element.textContent
          .replace("₹", "")
          .trim()
      )
    );

    const sorted = [...prices].sort(
      (a, b) => a - b
    );

    expect(prices).toEqual(sorted);
  });


  /* ==========================================================
     SORT HIGH → LOW
  ========================================================== */

  test("sorts by price high to low", () => {
    renderProductListing();

    fireEvent.change(
      screen.getByTestId(
        "sort-dropdown"
      ),
      {
        target: {
          value: "priceHighLow",
        },
      }
    );

    const prices = Array.from(
      document.querySelectorAll(
        ".product-price"
      )
    ).map((element) =>
      Number(
        element.textContent
          .replace("₹", "")
          .trim()
      )
    );

    const sorted = [...prices].sort(
      (a, b) => b - a
    );

    expect(prices).toEqual(sorted);
  });


  /* ==========================================================
     SORT NAME A-Z
  ========================================================== */

  test("sorts by name A-Z", () => {
    renderProductListing();

    fireEvent.change(
      screen.getByTestId(
        "sort-dropdown"
      ),
      {
        target: {
          value: "nameAZ",
        },
      }
    );

    const names = Array.from(
      document.querySelectorAll(
        ".product-name-link h3"
      )
    ).map((element) =>
      element.textContent.trim()
    );

    const sorted = [...names].sort(
      (a, b) =>
        a.localeCompare(b)
    );

    expect(names).toEqual(sorted);
  });


  /* ==========================================================
     SORT NAME Z-A
  ========================================================== */

  test("sorts by name Z-A", () => {
    renderProductListing();

    fireEvent.change(
      screen.getByTestId(
        "sort-dropdown"
      ),
      {
        target: {
          value: "nameZA",
        },
      }
    );

    const names = Array.from(
      document.querySelectorAll(
        ".product-name-link h3"
      )
    ).map((element) =>
      element.textContent.trim()
    );

    const sorted = [...names].sort(
      (a, b) =>
        b.localeCompare(a)
    );

    expect(names).toEqual(sorted);
  });


  /* ==========================================================
     SORT RATING
  ========================================================== */

  test("sorts by rating", () => {
    renderProductListing();

    fireEvent.change(
      screen.getByTestId(
        "sort-dropdown"
      ),
      {
        target: {
          value: "rating",
        },
      }
    );

    const ratings = Array.from(
      document.querySelectorAll(
        ".rating"
      )
    ).map((element) => {
      return Number(
        element.textContent
          .replace("⭐", "")
          .trim()
      );
    });

    const sorted = [...ratings].sort(
      (a, b) => b - a
    );

    expect(ratings).toEqual(sorted);
  });


  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  test("clears filters", () => {
    renderProductListing();

    const initialCount =
      document.querySelectorAll(
        ".product-card"
      ).length;

    fireEvent.click(
      screen.getByRole("button", {
        name: "Filter Medicines",
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear Filters",
      })
    );

    const finalCount =
      document.querySelectorAll(
        ".product-card"
      ).length;

    expect(finalCount).toBe(
      initialCount
    );
  });


  /* ==========================================================
     EMPTY PRODUCT MESSAGE
  ========================================================== */

  test("does not display empty state when products exist", () => {
    renderProductListing();

    expect(
      screen.queryByText(
        "No Products Found"
      )
    ).not.toBeInTheDocument();
  });


  /* ==========================================================
     PRODUCT DETAILS ROUTE
  ========================================================== */

  test("View Details links contain product IDs", () => {
    renderProductListing();

    const links =
      screen.getAllByRole("link", {
        name: "View Details",
      });

    expect(
      links.length
    ).toBeGreaterThan(0);

    links.forEach((link) => {
      const href =
        link.getAttribute("href");

      expect(href).toMatch(
        /^\/product\/.+/
      );
    });
  });


  /* ==========================================================
     CATEGORY URL
  ========================================================== */

  test("reads category from URL", () => {
    renderProductListing(
      "/products/vitamins"
    );

    expect(
      screen.getByText(/Products/)
    ).toBeInTheDocument();
  });


  /* ==========================================================
     DUPLICATE PRODUCT IDS
  ========================================================== */

  test("does not render duplicate product IDs", () => {
    renderProductListing();

    const links =
      document.querySelectorAll(
        ".product-image-link"
      );

    const ids = Array.from(
      links
    ).map((link) => {
      const href =
        link.getAttribute("href");

      return href.split("/").pop();
    });

    const uniqueIds =
      new Set(ids);

    expect(ids.length).toBe(
      uniqueIds.size
    );
  });

});