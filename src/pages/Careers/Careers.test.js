import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Careers from "./Careers";

describe("Careers Component", () => {
  test("renders careers banner", () => {
    render(<Careers />);

    expect(
      screen.getByText("Careers at MEDIKART")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Join our passionate team and help us build the future of healthcare/i
      )
    ).toBeInTheDocument();
  });

  test("renders Why Join MEDIKART section", () => {
    render(<Careers />);

    expect(
      screen.getByText("Why Join MEDIKART?")
    ).toBeInTheDocument();

    expect(screen.getByText("💼 Career Growth")).toBeInTheDocument();
    expect(screen.getByText("🏥 Health Benefits")).toBeInTheDocument();
    expect(screen.getByText("💰 Competitive Salary")).toBeInTheDocument();
    expect(screen.getByText("🌍 Flexible Work")).toBeInTheDocument();
  });

  test("renders Current Openings heading", () => {
    render(<Careers />);

    expect(
      screen.getByText("Current Openings")
    ).toBeInTheDocument();
  });

  test("renders all job titles", () => {
    render(<Careers />);

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("UI/UX Designer")).toBeInTheDocument();
    expect(
      screen.getByText("Digital Marketing Executive")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Customer Support Executive")
    ).toBeInTheDocument();
    expect(screen.getByText("Pharmacist")).toBeInTheDocument();
  });

  test("renders six Apply Now buttons", () => {
    render(<Careers />);

    const buttons = screen.getAllByRole("button", {
      name: /Apply Now/i,
    });

    expect(buttons).toHaveLength(6);
  });

  test("renders career contact section", () => {
    render(<Careers />);

    expect(
      screen.getByText("Didn't Find a Suitable Role?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Send your resume to:")
    ).toBeInTheDocument();

    expect(
      screen.getByText("careers@medikart.com")
    ).toBeInTheDocument();
  });
});