import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import EmptyState from "./EmptyState";

describe("EmptyState Component", () => {
  test("renders empty state icon", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>
    );

    expect(screen.getByText("📦")).toBeInTheDocument();
  });

  test("renders heading", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>
    );

    expect(
      screen.getByText("No Data Available")
    ).toBeInTheDocument();
  });

  test("renders message", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Nothing to display here.")
    ).toBeInTheDocument();
  });

  test("renders Continue Shopping link", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", {
      name: /Continue Shopping/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/shop");
  });
});