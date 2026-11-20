import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Error404 from "./Error404";

describe("Error404 Component", () => {
  test("renders 404 heading", () => {
    render(
      <MemoryRouter>
        <Error404 />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  test("renders Page Not Found title", () => {
    render(
      <MemoryRouter>
        <Error404 />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Page Not Found")
    ).toBeInTheDocument();
  });

  test("renders error message", () => {
    render(
      <MemoryRouter>
        <Error404 />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "Sorry, the page you are looking for doesn't exist."
      )
    ).toBeInTheDocument();
  });

  test("renders Back to Home link", () => {
    render(
      <MemoryRouter>
        <Error404 />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole("link", {
      name: /Back to Home/i,
    });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});