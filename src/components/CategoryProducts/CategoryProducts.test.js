import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import CategoryProducts from "./CategoryProducts";
import medicines from "../../data/medicines";

describe("CategoryProducts Component", () => {
  const renderComponent = (category = "medicines") => {
    return render(
      <MemoryRouter
        initialEntries={[`/category/${category}`]}
      >
        <Routes>
          <Route
            path="/category/:categoryName"
            element={<CategoryProducts />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  test("renders category heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: "MEDICINES",
      })
    ).toBeInTheDocument();
  });

  test("renders all medicine products", () => {
    renderComponent();

    const productCards =
      document.querySelectorAll(".product-card");

    expect(productCards).toHaveLength(medicines.length);
  });

  test("renders product details correctly", () => {
    renderComponent();

    const productCards =
      document.querySelectorAll(".product-card");

    medicines.forEach((product, index) => {
      const card = productCards[index];

      expect(card).toBeInTheDocument();

      // Product image
      expect(
        within(card).getByRole("img", {
          name: product.name,
        })
      ).toBeInTheDocument();

      // Product name
      expect(
        within(card).getByRole("heading", {
          name: product.name,
        })
      ).toBeInTheDocument();

      // Brand
      expect(
        within(card).getByText(product.brand)
      ).toBeInTheDocument();

      // Price
      expect(
        within(card).getByText(
          `₹${product.price}`
        )
      ).toBeInTheDocument();

      // Rating
      expect(
        within(card).getByText(
          `⭐ ${product.rating}`
        )
      ).toBeInTheDocument();
    });
  });

  test("renders product images with correct alt text", () => {
    renderComponent();

    medicines.forEach((product) => {
      expect(
        screen.getByAltText(product.name)
      ).toBeInTheDocument();
    });
  });

  test("renders product grid", () => {
    renderComponent();

    expect(
      document.querySelector(".product-grid")
    ).toBeInTheDocument();
  });

  test("renders main container", () => {
    renderComponent();

    expect(
      document.querySelector(".container")
    ).toBeInTheDocument();
  });

  test("shows no products for unknown category", () => {
    renderComponent("unknown");

    expect(
      screen.getByRole("heading", {
        name: "UNKNOWN",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "No products available in this category."
      )
    ).toBeInTheDocument();

    expect(
      document.querySelectorAll(".product-card")
    ).toHaveLength(0);
  });
});