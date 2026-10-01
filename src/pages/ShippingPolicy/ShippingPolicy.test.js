import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShippingPolicy from "./ShippingPolicy";

describe("ShippingPolicy Component", () => {
  beforeEach(() => {
    render(<ShippingPolicy />);
  });

  test("renders page heading", () => {
    expect(
      screen.getByRole("heading", { name: /Shipping Policy/i })
    ).toBeInTheDocument();
  });

  test("renders page description", () => {
    expect(
      screen.getByText(/we are committed to delivering your/i)
    ).toBeInTheDocument();
  });

  test("renders all section headings", () => {
    expect(screen.getByText(/1\. Order Processing/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Delivery Time/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Shipping Charges/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Order Tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Delivery Partners/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Delayed Deliveries/i)).toBeInTheDocument();
    expect(screen.getByText(/7\. Damaged Package/i)).toBeInTheDocument();
    expect(screen.getByText(/8\. Incorrect Address/i)).toBeInTheDocument();
    expect(screen.getByText(/9\. International Shipping/i)).toBeInTheDocument();
    expect(screen.getByText(/10\. Contact Us/i)).toBeInTheDocument();
  });

  test("renders delivery time details", () => {
    expect(
      screen.getByText("Metro Cities: 1–3 Business Days")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Other Cities: 3–5 Business Days")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Remote Areas: 5–7 Business Days")
    ).toBeInTheDocument();
  });

  test("renders shipping charges", () => {
    expect(
      screen.getByText("Orders above ₹499 – FREE Delivery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Orders below ₹499 – ₹49 Shipping Fee")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Medical Devices may have additional delivery charges."
      )
    ).toBeInTheDocument();
  });

  test("renders contact details", () => {
    expect(
      screen.getByText(/support@medikart\.com/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/\+91 98765 43210/i)
    ).toBeInTheDocument();
  });

  test("renders all list items", () => {
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(6);
  });
});