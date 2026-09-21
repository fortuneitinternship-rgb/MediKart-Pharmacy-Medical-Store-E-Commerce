import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FAQ from "./FAQ";

describe("FAQ Component", () => {
  test("renders FAQ heading and description", () => {
    render(<FAQ />);

    expect(
      screen.getByText("Frequently Asked Questions")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Find answers to the most common questions about MEDIKART."
      )
    ).toBeInTheDocument();
  });

  test("renders all FAQ questions", () => {
    render(<FAQ />);

    expect(
      screen.getByText("How do I place an order?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("What payment methods do you accept?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("How can I track my order?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Can I cancel my order?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Do you sell genuine medicines?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("How long does delivery take?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Can I return products?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("How do I contact customer support?")
    ).toBeInTheDocument();
  });

  test("does not show answers initially", () => {
    render(<FAQ />);

    expect(
      screen.queryByText(
        /Browse products, add them to your cart/i
      )
    ).not.toBeInTheDocument();
  });

  test("shows answer when a question is clicked", () => {
    render(<FAQ />);

    fireEvent.click(
      screen.getByText("How do I place an order?")
    );

    expect(
      screen.getByText(
        /Browse products, add them to your cart/i
      )
    ).toBeInTheDocument();
  });

  test("hides answer when the same question is clicked again", () => {
    render(<FAQ />);

    const question = screen.getByText(
      "How do I place an order?"
    );

    fireEvent.click(question);

    expect(
      screen.getByText(
        /Browse products, add them to your cart/i
      )
    ).toBeInTheDocument();

    fireEvent.click(question);

    expect(
      screen.queryByText(
        /Browse products, add them to your cart/i
      )
    ).not.toBeInTheDocument();
  });

  test("opens only one FAQ answer at a time", () => {
    render(<FAQ />);

    fireEvent.click(
      screen.getByText("How do I place an order?")
    );

    fireEvent.click(
      screen.getByText("What payment methods do you accept?")
    );

    expect(
      screen.queryByText(
        /Browse products, add them to your cart/i
      )
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        /We accept UPI, Credit Cards, Debit Cards/i
      )
    ).toBeInTheDocument();
  });
});