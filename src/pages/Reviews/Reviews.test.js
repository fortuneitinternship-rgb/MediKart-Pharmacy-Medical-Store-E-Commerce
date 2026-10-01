import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Reviews from "./Reviews";

describe("Reviews Component", () => {
  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  test("renders page heading and description", () => {
    render(<Reviews />);

    expect(screen.getByText("Customer Reviews")).toBeInTheDocument();

    expect(
      screen.getByText(/See what our customers say about/i)
    ).toBeInTheDocument();
  });

  test("renders initial reviews", () => {
    render(<Reviews />);

    expect(screen.getByText("Rahul Sharma")).toBeInTheDocument();
    expect(screen.getByText("Priya Verma")).toBeInTheDocument();
    expect(screen.getByText("Amit Kumar")).toBeInTheDocument();
    expect(screen.getByText("Sneha Patel")).toBeInTheDocument();
  });

  test("renders form inputs", () => {
    render(<Reviews />);

    expect(
      screen.getByPlaceholderText("Your Name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Product Name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Write your review...")
    ).toBeInTheDocument();

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Review/i })
    ).toBeInTheDocument();
  });

  test("shows alert when submitting empty form", () => {
    render(<Reviews />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Submit Review/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please fill all fields"
    );
  });

  test("adds a new review successfully", () => {
    render(<Reviews />);

    fireEvent.change(
      screen.getByPlaceholderText("Your Name"),
      {
        target: { value: "John Doe", name: "name" },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Product Name"),
      {
        target: {
          value: "Vitamin C",
          name: "product",
        },
      }
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: {
        value: "4",
        name: "rating",
      },
    });

    fireEvent.change(
      screen.getByPlaceholderText("Write your review..."),
      {
        target: {
          value: "Very good product",
          name: "review",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Submit Review/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Review Added Successfully!"
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
    expect(
      screen.getByText("Very good product")
    ).toBeInTheDocument();
  });

  test("clears form after successful submission", () => {
    render(<Reviews />);

    const nameInput =
      screen.getByPlaceholderText("Your Name");
    const productInput =
      screen.getByPlaceholderText("Product Name");
    const reviewInput =
      screen.getByPlaceholderText(
        "Write your review..."
      );

    fireEvent.change(nameInput, {
      target: {
        value: "John",
        name: "name",
      },
    });

    fireEvent.change(productInput, {
      target: {
        value: "Medicine",
        name: "product",
      },
    });

    fireEvent.change(reviewInput, {
      target: {
        value: "Excellent",
        name: "review",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Submit Review/i,
      })
    );

    expect(nameInput.value).toBe("");
    expect(productInput.value).toBe("");
    expect(reviewInput.value).toBe("");
  });
});