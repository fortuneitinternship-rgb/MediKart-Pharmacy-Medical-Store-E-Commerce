import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PrivacyPolicy from "./PrivacyPolicy";

describe("PrivacyPolicy Component", () => {
  test("renders page heading", () => {
    render(<PrivacyPolicy />);

    expect(
      screen.getByRole("heading", {
        name: /Privacy Policy/i,
      })
    ).toBeInTheDocument();
  });

  test("renders all section headings", () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText(/1\. Information We Collect/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. How We Use Your Information/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Data Security/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Third-Party Services/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Your Rights/i)).toBeInTheDocument();
    expect(screen.getByText(/7\. Contact Us/i)).toBeInTheDocument();
  });

  test("renders privacy description", () => {
    render(<PrivacyPolicy />);

    expect(
      screen.getByText(/Your privacy is important to us/i)
    ).toBeInTheDocument();
  });

  test("renders rights list", () => {
    render(<PrivacyPolicy />);

    expect(
      screen.getByText(/Access your personal information/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Update or correct your information/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Delete your account/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Opt out of promotional emails/i)
    ).toBeInTheDocument();
  });

  test("renders contact information", () => {
    render(<PrivacyPolicy />);

    expect(
      screen.getByText(/support@medikart\.com/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/\+91 98765 43210/i)
    ).toBeInTheDocument();
  });

  test("renders all list items", () => {
    render(<PrivacyPolicy />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(9);
  });
});