import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import AccessDenied from "./AccessDenied";

describe("AccessDenied Component", () => {
  test("renders 403 heading", () => {
    render(
      <MemoryRouter>
        <AccessDenied />
      </MemoryRouter>
    );

    expect(screen.getByText("403")).toBeInTheDocument();
  });

  test("renders Access Denied title", () => {
    render(
      <MemoryRouter>
        <AccessDenied />
      </MemoryRouter>
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  test("renders permission message", () => {
    render(
      <MemoryRouter>
        <AccessDenied />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "You don't have permission to view this page."
      )
    ).toBeInTheDocument();
  });

  test("renders Home link", () => {
    render(
      <MemoryRouter>
        <AccessDenied />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole("link", {
      name: /Home/i,
    });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});