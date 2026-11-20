import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Blog from "./Blog";

describe("Blog Component", () => {
  test("renders blog header", () => {
    render(<Blog />);

    expect(
      screen.getByText("MEDIKART Health Blog")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Stay updated with the latest healthcare tips/i
      )
    ).toBeInTheDocument();
  });

  test("renders all blog titles", () => {
    render(<Blog />);

    expect(
      screen.getByText("10 Tips to Boost Your Immunity Naturally")
    ).toBeInTheDocument();

    expect(
      screen.getByText("How to Store Medicines Safely at Home")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Choosing the Right Vitamins for Your Body")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Benefits of Regular Health Checkups")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Hair Care Tips for Healthy Hair")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Eye Care in the Digital Age")
    ).toBeInTheDocument();
  });

  test("renders all blog categories", () => {
    render(<Blog />);

    expect(screen.getByText("Health Tips")).toBeInTheDocument();
    expect(screen.getByText("Medicines")).toBeInTheDocument();
    expect(screen.getByText("Vitamins")).toBeInTheDocument();
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
    expect(screen.getByText("Hair Care")).toBeInTheDocument();
    expect(screen.getByText("Eye Care")).toBeInTheDocument();
  });

  test("renders six blog images", () => {
    render(<Blog />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(6);
  });

  test("renders six Read More buttons", () => {
    render(<Blog />);

    const buttons = screen.getAllByRole("button", {
      name: /Read More/i,
    });

    expect(buttons).toHaveLength(6);
  });

  test("renders all blog dates", () => {
    render(<Blog />);

    expect(screen.getByText("August 2, 2026")).toBeInTheDocument();
    expect(screen.getByText("July 28, 2026")).toBeInTheDocument();
    expect(screen.getByText("July 20, 2026")).toBeInTheDocument();
    expect(screen.getByText("July 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("July 10, 2026")).toBeInTheDocument();
    expect(screen.getByText("July 5, 2026")).toBeInTheDocument();
  });
});