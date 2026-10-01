import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Error500 from "./Error500";

describe("Error500 Component", () => {
  test("renders 500 heading", () => {
    render(
      <MemoryRouter>
        <Error500 />
      </MemoryRouter>
    );

    expect(screen.getByText("500")).toBeInTheDocument();
  });

  test("renders Internal Server Error title", () => {
    render(
      <MemoryRouter>
        <Error500 />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Internal Server Error")
    ).toBeInTheDocument();
  });

  test("renders server error message", () => {
    render(
      <MemoryRouter>
        <Error500 />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Something went wrong on our server.")
    ).toBeInTheDocument();
  });

  test("renders Go Home link", () => {
    render(
      <MemoryRouter>
        <Error500 />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole("link", {
      name: /Go Home/i,
    });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});