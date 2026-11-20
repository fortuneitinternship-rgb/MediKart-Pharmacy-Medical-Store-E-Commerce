// src/components/HeroBanner/HeroBanner.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroBanner from "./HeroBanner";

// Mock image imports
jest.mock("../../assets/images/Mediction.png", () => "banner1");
jest.mock("../../assets/images/Mediction1.png", () => "banner2");
jest.mock("../../assets/images/Mediction2.png", () => "banner3");
jest.mock("../../assets/images/Mediction3.png", () => "banner4");

// Mock navigate
const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("HeroBanner Component", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("renders hero banner content", () => {
    render(
      <MemoryRouter>
        <HeroBanner />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Your Trusted Online Pharmacy")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Up To 25% OFF on Medicines")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /shop now/i })
    ).toBeInTheDocument();
  });

  test("navigates to shop page when Shop Now button is clicked", () => {
    render(
      <MemoryRouter>
        <HeroBanner />
      </MemoryRouter>
    );
    const shopButton = screen.getByRole("button", {
      name: /shop now/i,
    });
    fireEvent.click(shopButton);
    expect(mockedNavigate).toHaveBeenCalledWith("/shop");
  });

  test("renders slider navigation arrows", () => {
    render(
      <MemoryRouter>
        <HeroBanner />
      </MemoryRouter>
    );
    expect(screen.getByText("❮")).toBeInTheDocument();
    expect(screen.getByText("❯")).toBeInTheDocument();
  });

  test("renders feature items", () => {
    render(
      <MemoryRouter>
        <HeroBanner />
      </MemoryRouter>
    );

    expect(screen.getByText("✔ Genuine Medicines")).toBeInTheDocument();
    expect(screen.getByText("✔ Fast Delivery")).toBeInTheDocument();
    expect(screen.getByText("✔ Secure Payments")).toBeInTheDocument();
    expect(screen.getByText("✔ 24/7 Support")).toBeInTheDocument();
  });
});