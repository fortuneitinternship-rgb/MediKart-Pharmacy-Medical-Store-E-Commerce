import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CompareProducts from "./CompareProducts";

describe("CompareProducts Component", () => {
  test("renders page heading and description", () => {
    render(<CompareProducts />);

    expect(screen.getByText("Compare Products")).toBeInTheDocument();

    expect(
      screen.getByText(
        /Compare product specifications and choose the best one/i
      )
    ).toBeInTheDocument();
  });

  test("renders all product names", () => {
    render(<CompareProducts />);

    expect(screen.getByText("Paracetamol Tablets")).toBeInTheDocument();
    expect(screen.getByText("Vitamin D Capsules")).toBeInTheDocument();
    expect(screen.getByText("Blood Pressure Monitor")).toBeInTheDocument();
  });

  test("renders feature names", () => {
    render(<CompareProducts />);

    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  test("renders product brands", () => {
    render(<CompareProducts />);

    expect(screen.getByText("Micro Labs")).toBeInTheDocument();
    expect(screen.getByText("HealthVit")).toBeInTheDocument();
    expect(screen.getByText("Omron")).toBeInTheDocument();
  });

  test("renders product prices", () => {
    render(<CompareProducts />);

    expect(screen.getByText("₹96")).toBeInTheDocument();
    expect(screen.getByText("₹559")).toBeInTheDocument();
    expect(screen.getByText("₹1874")).toBeInTheDocument();
  });

  test("renders product ratings", () => {
    render(<CompareProducts />);

    expect(screen.getByText("⭐ 4.8")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4.7")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4.9")).toBeInTheDocument();
  });

  test("renders availability", () => {
    render(<CompareProducts />);

    const stock = screen.getAllByText("In Stock");
    expect(stock).toHaveLength(3);
  });

  test("renders three Buy Now buttons", () => {
    render(<CompareProducts />);

    const buttons = screen.getAllByRole("button", {
      name: /Buy Now/i,
    });

    expect(buttons).toHaveLength(3);
  });
});