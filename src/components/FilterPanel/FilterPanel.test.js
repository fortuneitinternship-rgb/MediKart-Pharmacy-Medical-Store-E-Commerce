import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import FilterPanel from "./FilterPanel";

describe("FilterPanel Component", () => {
  const mockProps = {
    selectedCategory: "all",
    setSelectedCategory: jest.fn(),

    priceRange: "all",
    setPriceRange: jest.fn(),

    selectedRating: "all",
    setSelectedRating: jest.fn(),

    selectedBrand: "all",
    setSelectedBrand: jest.fn(),

    brands: ["Cipla", "Micro Labs", "Abbott"],

    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // 1. RENDER FILTER PANEL
  // --------------------------------------------------
  test("renders FilterPanel", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByRole("heading", {
        name: "Filters",
      })
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 2. RENDER CATEGORY OPTIONS
  // --------------------------------------------------
  test("renders all category options", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("All Products")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Medicines")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Healthcare")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Vitamins & Supplements")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Personal Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Baby Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Medical Devices")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Eye Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Hair Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Women's Health")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Premium Healthcare")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 3. CATEGORY SELECTION
  // --------------------------------------------------
  test("calls setSelectedCategory when category is selected", () => {
    render(<FilterPanel {...mockProps} />);

    const medicinesRadio =
      screen.getByDisplayValue("medicines");

    fireEvent.click(medicinesRadio);

    expect(
      mockProps.setSelectedCategory
    ).toHaveBeenCalledWith("medicines");
  });

  // --------------------------------------------------
  // 4. PRICE OPTIONS
  // --------------------------------------------------
  test("renders all price options", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("All Prices")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Under ₹200")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹200 - ₹499")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹500 - ₹999")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹1,000 - ₹1,999")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹2,000 & Above")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 5. PRICE SELECTION
  // --------------------------------------------------
  test("calls setPriceRange when price is selected", () => {
    render(<FilterPanel {...mockProps} />);

    const priceRadio =
      screen.getByDisplayValue("200-499");

    fireEvent.click(priceRadio);

    expect(
      mockProps.setPriceRange
    ).toHaveBeenCalledWith("200-499");
  });

  // --------------------------------------------------
  // 6. RATING OPTIONS
  // --------------------------------------------------
  test("renders all rating options", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("All Ratings")
    ).toBeInTheDocument();

    expect(
      screen.getByText("4★ & Above")
    ).toBeInTheDocument();

    expect(
      screen.getByText("3★ & Above")
    ).toBeInTheDocument();

    expect(
      screen.getByText("2★ & Above")
    ).toBeInTheDocument();

    expect(
      screen.getByText("1★ & Above")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 7. RATING SELECTION
  // --------------------------------------------------
  test("calls setSelectedRating when rating is selected", () => {
    render(<FilterPanel {...mockProps} />);

    const ratingRadio =
      screen.getByDisplayValue("4");

    fireEvent.click(ratingRadio);

    expect(
      mockProps.setSelectedRating
    ).toHaveBeenCalledWith("4");
  });

  // --------------------------------------------------
  // 8. BRAND OPTIONS
  // --------------------------------------------------
  test("renders available brands", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("All Brands")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cipla")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Micro Labs")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Abbott")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 9. BRAND SELECTION
  // --------------------------------------------------
  test("calls setSelectedBrand when brand is selected", () => {
    render(<FilterPanel {...mockProps} />);

    const brandRadio =
      screen.getByDisplayValue("Cipla");

    fireEvent.click(brandRadio);

    expect(
      mockProps.setSelectedBrand
    ).toHaveBeenCalledWith("Cipla");
  });

  // --------------------------------------------------
  // 10. ALL BRANDS SELECTION
  // --------------------------------------------------
  test("calls setSelectedBrand with all when All Brands is selected", () => {
    render(
      <FilterPanel
        {...mockProps}
        selectedBrand="Cipla"
      />
    );

    const brandRadios =
      screen.getAllByRole("radio");

    const allBrandRadio = brandRadios.find(
      (radio) =>
        radio.name === "brand" &&
        radio.value === "all"
    );

    fireEvent.click(allBrandRadio);

    expect(
      mockProps.setSelectedBrand
    ).toHaveBeenCalledWith("all");
  });

  // --------------------------------------------------
  // 11. CLEAR ALL BUTTON
  // --------------------------------------------------
  test("calls onReset when Clear All is clicked", () => {
    render(<FilterPanel {...mockProps} />);

    const clearButton =
      screen.getByRole("button", {
        name: "Clear All",
      });

    fireEvent.click(clearButton);

    expect(
      mockProps.onReset
    ).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // 12. RESET FILTERS BUTTON
  // --------------------------------------------------
  test("calls onReset when Reset Filters is clicked", () => {
    render(<FilterPanel {...mockProps} />);

    const resetButton =
      screen.getByRole("button", {
        name: /Reset Filters/i,
      });

    fireEvent.click(resetButton);

    expect(
      mockProps.onReset
    ).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // 13. CATEGORY COLLAPSE
  // --------------------------------------------------
  test("opens and closes category section", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("All Products")
    ).toBeInTheDocument();

    const categoryButton =
      screen.getByRole("button", {
        name: /Category/i,
      });

    fireEvent.click(categoryButton);

    expect(
      screen.queryByText("All Products")
    ).not.toBeInTheDocument();

    fireEvent.click(categoryButton);

    expect(
      screen.getByText("All Products")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 14. PRICE COLLAPSE
  // --------------------------------------------------
  test("opens and closes price section", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("Under ₹200")
    ).toBeInTheDocument();

    const priceButton =
      screen.getByRole("button", {
        name: /^Price/i,
      });

    fireEvent.click(priceButton);

    expect(
      screen.queryByText("Under ₹200")
    ).not.toBeInTheDocument();

    fireEvent.click(priceButton);

    expect(
      screen.getByText("Under ₹200")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 15. RATING COLLAPSE
  // --------------------------------------------------
  test("opens and closes rating section", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("4★ & Above")
    ).toBeInTheDocument();

    const ratingButton =
      screen.getByRole("button", {
        name: /^Rating/i,
      });

    fireEvent.click(ratingButton);

    expect(
      screen.queryByText("4★ & Above")
    ).not.toBeInTheDocument();

    fireEvent.click(ratingButton);

    expect(
      screen.getByText("4★ & Above")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 16. BRAND COLLAPSE
  // --------------------------------------------------
  test("opens and closes brand section", () => {
    render(<FilterPanel {...mockProps} />);

    expect(
      screen.getByText("Cipla")
    ).toBeInTheDocument();

    const brandButton =
      screen.getByRole("button", {
        name: /^Brand/i,
      });

    fireEvent.click(brandButton);

    expect(
      screen.queryByText("Cipla")
    ).not.toBeInTheDocument();

    fireEvent.click(brandButton);

    expect(
      screen.getByText("Cipla")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 17. NO BRANDS
  // --------------------------------------------------
  test("shows No brands available when brands array is empty", () => {
    render(
      <FilterPanel
        {...mockProps}
        brands={[]}
      />
    );

    expect(
      screen.getByText("No brands available")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // 18. SELECTED CATEGORY RADIO
  // --------------------------------------------------
  test("shows selected category", () => {
    render(
      <FilterPanel
        {...mockProps}
        selectedCategory="medicines"
      />
    );

    expect(
      screen.getByDisplayValue("medicines")
    ).toBeChecked();
  });

  // --------------------------------------------------
  // 19. SELECTED PRICE RADIO
  // --------------------------------------------------
  test("shows selected price", () => {
    render(
      <FilterPanel
        {...mockProps}
        priceRange="500-999"
      />
    );

    expect(
      screen.getByDisplayValue("500-999")
    ).toBeChecked();
  });

  // --------------------------------------------------
  // 20. SELECTED RATING RADIO
  // --------------------------------------------------
  test("shows selected rating", () => {
    render(
      <FilterPanel
        {...mockProps}
        selectedRating="4"
      />
    );

    expect(
      screen.getByDisplayValue("4")
    ).toBeChecked();
  });

  // --------------------------------------------------
  // 21. SELECTED BRAND RADIO
  // --------------------------------------------------
  test("shows selected brand", () => {
    render(
      <FilterPanel
        {...mockProps}
        selectedBrand="Cipla"
      />
    );

    expect(
      screen.getByDisplayValue("Cipla")
    ).toBeChecked();
  });
});