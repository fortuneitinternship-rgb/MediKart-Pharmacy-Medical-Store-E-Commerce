import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Categories from "./Categories";

describe("Categories", () => {
  test("renders the Categories page", () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Shop by Category")
    ).toBeTruthy();
  });

  test("renders the description", () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "Choose a category to explore healthcare products."
      )
    ).toBeTruthy();
  });

  test("renders all category names", () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const categories = [
      "Medicines",
      "Healthcare",
      "Vitamins & Supplements",
      "Personal Care",
      "Baby Care",
      "Medical Devices",
      "Eye Care",
      "Premium Healthcare",
      "Hair Care",
      "Women's Health",
    ];

    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeTruthy();
    });
  });

  test("renders 10 category links", () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");

    expect(links.length).toBe(10);
  });

  test("renders 10 category images", () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const images = screen.getAllByRole("img");

    expect(images.length).toBe(10);
  });
});