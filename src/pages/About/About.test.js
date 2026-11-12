import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import About from "./About";

// Mock CSS
jest.mock("./About.css", () => ({}));

// Mock react-icons
jest.mock("react-icons/fa", () => ({
  FaHeartbeat: () => <span data-testid="heartbeat-icon" />,
  FaShieldAlt: () => <span data-testid="shield-icon" />,
  FaTruck: () => <span data-testid="truck-icon" />,
  FaUsers: () => <span data-testid="users-icon" />,
  FaAward: () => <span data-testid="award-icon" />,
  FaPhoneAlt: () => <span data-testid="phone-icon" />,
}));

describe("About Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the About page", () => {
    render(<About />);

    expect(document.querySelector(".about-page")).toBeInTheDocument();
  });

  test("renders the main heading", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /about medikart/i })
    ).toBeInTheDocument();
  });

  test("renders the Who We Are section", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /who we are/i })
    ).toBeInTheDocument();
  });

  test("renders the Why Choose section", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /why choose medikart/i })
    ).toBeInTheDocument();
  });

  test("renders the Our Mission section", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /our mission/i })
    ).toBeInTheDocument();
  });

  test("renders the Need Assistance section", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /need assistance/i })
    ).toBeInTheDocument();
  });

  test("renders all feature cards", () => {
    render(<About />);

    const featureCards = document.querySelectorAll(".feature-card");

    expect(featureCards).toHaveLength(4);
  });

  test("renders feature headings", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /100% genuine medicines/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /fast delivery/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /affordable prices/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /24×7 customer support/i })
    ).toBeInTheDocument();
  });

  test("renders heartbeat icon", () => {
    render(<About />);

    expect(screen.getByTestId("heartbeat-icon")).toBeInTheDocument();
  });

  test("renders feature icons", () => {
    render(<About />);

    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    expect(screen.getByTestId("truck-icon")).toBeInTheDocument();
    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("award-icon")).toBeInTheDocument();
  });

  test("renders contact phone icon", () => {
    render(<About />);

    expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
  });

  test("renders contact section", () => {
    render(<About />);

    const contactSection = document.querySelector(".contact-section");

    expect(contactSection).toBeInTheDocument();
  });

  test("renders mission section", () => {
    render(<About />);

    const missionSection = document.querySelector(".mission-section");

    expect(missionSection).toBeInTheDocument();
  });

  test("renders features section", () => {
    render(<About />);

    const featuresSection = document.querySelector(".features-section");

    expect(featuresSection).toBeInTheDocument();
  });

  test("renders about container", () => {
    render(<About />);

    const aboutContainer = document.querySelector(".about-container");

    expect(aboutContainer).toBeInTheDocument();
  });

  test("renders hero section", () => {
    render(<About />);

    const heroSection = document.querySelector(".hero");

    expect(heroSection).toBeInTheDocument();
  });

  test("renders hero content", () => {
    render(<About />);

    const heroContent = document.querySelector(".hero-content");

    expect(heroContent).toBeInTheDocument();
  });

  test("renders all main sections", () => {
    render(<About />);

    expect(document.querySelector(".hero")).toBeInTheDocument();
    expect(document.querySelector(".about-container")).toBeInTheDocument();
    expect(
      document.querySelector(".features-section")
    ).toBeInTheDocument();
    expect(
      document.querySelector(".mission-section")
    ).toBeInTheDocument();
    expect(
      document.querySelector(".contact-section")
    ).toBeInTheDocument();
  });

  test("renders feature grid", () => {
    render(<About />);

    const featureGrid = document.querySelector(".features-grid");

    expect(featureGrid).toBeInTheDocument();
  });
});
