import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SortDropdown from "./SortDropdown";

describe("SortDropdown Component", () => {
  let setSortBy;

  beforeEach(() => {
    setSortBy = jest.fn();
  });

  test("renders the dropdown", () => {
    render(<SortDropdown sortBy="" setSortBy={setSortBy} />);

    const selectElement = screen.getByRole("combobox");

    expect(selectElement).toBeInTheDocument();
  });

  test("renders all sort options", () => {
    render(<SortDropdown sortBy="" setSortBy={setSortBy} />);

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(7);

    expect(screen.getByText("Price: Low to High")).toBeInTheDocument();
    expect(screen.getByText("Price: High to Low")).toBeInTheDocument();
    expect(screen.getByText("Name: A - Z")).toBeInTheDocument();
    expect(screen.getByText("Name: Z - A")).toBeInTheDocument();
    expect(screen.getByText("Highest Rated")).toBeInTheDocument();
    expect(screen.getByText("Newest First")).toBeInTheDocument();
  });

  test("shows the selected value", () => {
    render(
      <SortDropdown
        sortBy="priceLowHigh"
        setSortBy={setSortBy}
      />
    );

    const selectElement = screen.getByRole("combobox");

    expect(selectElement.value).toBe("priceLowHigh");
  });

  test("calls setSortBy when a new option is selected", () => {
    render(<SortDropdown sortBy="" setSortBy={setSortBy} />);

    const selectElement = screen.getByRole("combobox");

    fireEvent.change(selectElement, {
      target: { value: "rating" },
    });

    expect(setSortBy).toHaveBeenCalledTimes(1);
    expect(setSortBy).toHaveBeenCalledWith("rating");
  });

  test("changes to Price High to Low", () => {
    render(<SortDropdown sortBy="" setSortBy={setSortBy} />);

    const selectElement = screen.getByRole("combobox");

    fireEvent.change(selectElement, {
      target: { value: "priceHighLow" },
    });

    expect(setSortBy).toHaveBeenCalledWith("priceHighLow");
  });

  test("changes to Name A-Z", () => {
    render(<SortDropdown sortBy="" setSortBy={setSortBy} />);

    const selectElement = screen.getByRole("combobox");

    fireEvent.change(selectElement, { target: { value: "nameAZ" }, });

    expect(setSortBy).toHaveBeenCalledWith("nameAZ");
  });
});