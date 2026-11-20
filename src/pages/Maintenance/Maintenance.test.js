import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Maintenance from "./Maintenance";

describe("Maintenance Component", () => {
  test("renders maintenance icon", () => {
    render(<Maintenance />);

    expect(screen.getByText("🛠")).toBeInTheDocument();
  });

  test("renders maintenance heading", () => {
    render(<Maintenance />);

    expect(
      screen.getByText("Website Under Maintenance")
    ).toBeInTheDocument();
  });

  test("renders maintenance message", () => {
    render(<Maintenance />);

    expect(
      screen.getByText("We'll be back shortly.")
    ).toBeInTheDocument();
  });
});