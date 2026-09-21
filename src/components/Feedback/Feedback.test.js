import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Feedback from "./Feedback";

// Mock react-icons
jest.mock("react-icons/fa", () => ({
  FaStar: () => <span data-testid="star-icon">★</span>,
  FaTimes: () => <span data-testid="close-icon">×</span>,
}));

describe("Feedback Component", () => {
  const mockOnClose = jest.fn();

  const mockOrder = {
    orderId: "TEST123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock alert
    window.alert = jest.fn();
  });

  // ==========================================
  // RENDER TEST
  // ==========================================

  test("renders feedback popup correctly", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByText("How was your order?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Order #TEST123")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your feedback helps us improve MEDIKART.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Rate your experience")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Write a review")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Maybe Later")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Submit Feedback")
    ).toBeInTheDocument();
  });

  // ==========================================
  // CLOSE BUTTON TEST
  // ==========================================

  test("calls onClose when close button is clicked", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole("button", {
      name: "Close",
    });

    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // MAYBE LATER TEST
  // ==========================================

  test("closes popup when Maybe Later is clicked", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const maybeLaterButton = screen.getByRole("button", {
      name: "Maybe Later",
    });

    fireEvent.click(maybeLaterButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    expect(
      localStorage.getItem(
        "feedbackSubmitted_TEST123"
      )
    ).toBeNull();
  });

  // ==========================================
  // INITIAL RATING TEST
  // ==========================================

  test("shows default rating text when no star is selected", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByText("Tap a star to rate")
    ).toBeInTheDocument();
  });

  // ==========================================
  // STAR RATING TEST
  // ==========================================

  test("allows user to select a star rating", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const starButtons = screen.getAllByRole("button");

    // First 5 star buttons are the rating buttons
    const ratingButtons = starButtons.filter(
      (button) =>
        button.querySelector('[data-testid="star-icon"]')
    );

    expect(ratingButtons).toHaveLength(5);

    fireEvent.click(ratingButtons[3]);

    expect(
      screen.getByText("Good")
    ).toBeInTheDocument();
  });

  // ==========================================
  // ONE STAR TEST
  // ==========================================

  test("shows Very Poor for one star", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[0].closest("button"));

    expect(
      screen.getByText("Very Poor")
    ).toBeInTheDocument();
  });

  // ==========================================
  // TWO STAR TEST
  // ==========================================

  test("shows Poor for two stars", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[1].closest("button"));

    expect(
      screen.getByText("Poor")
    ).toBeInTheDocument();
  });

  // ==========================================
  // THREE STAR TEST
  // ==========================================

  test("shows Average for three stars", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[2].closest("button"));

    expect(
      screen.getByText("Average")
    ).toBeInTheDocument();
  });

  // ==========================================
  // FOUR STAR TEST
  // ==========================================

  test("shows Good for four stars", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[3].closest("button"));

    expect(
      screen.getByText("Good")
    ).toBeInTheDocument();
  });

  // ==========================================
  // FIVE STAR TEST
  // ==========================================

  test("shows Excellent for five stars", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[4].closest("button"));

    expect(
      screen.getByText("Excellent")
    ).toBeInTheDocument();
  });

  // ==========================================
  // TEXTAREA TEST
  // ==========================================

  test("allows user to enter feedback", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Tell us about your order experience..."
    );

    fireEvent.change(textarea, {
      target: {
        value: "Great service and good experience.",
      },
    });

    expect(textarea).toHaveValue(
      "Great service and good experience."
    );
  });

  // ==========================================
  // CHARACTER COUNT TEST
  // ==========================================

  test("updates character count when feedback is entered", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Tell us about your order experience..."
    );

    fireEvent.change(textarea, {
      target: {
        value: "Excellent service",
      },
    });

    expect(
      screen.getByText("17/500")
    ).toBeInTheDocument();
  });

  // ==========================================
  // EMPTY RATING SUBMIT TEST
  // ==========================================

  test("shows alert when submitting without rating", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit Feedback",
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please select a star rating."
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    expect(
      localStorage.getItem("feedbacks")
    ).toBeNull();
  });

  // ==========================================
  // SUBMIT FEEDBACK TEST
  // ==========================================

  test("submits feedback successfully", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[4].closest("button"));

    const textarea = screen.getByPlaceholderText(
      "Tell us about your order experience..."
    );

    fireEvent.change(textarea, {
      target: {
        value: "Excellent experience!",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit Feedback",
      })
    );

    const savedFeedback = JSON.parse(
      localStorage.getItem("feedbacks")
    );

    expect(savedFeedback).toHaveLength(1);

    expect(savedFeedback[0]).toMatchObject({
      orderId: "TEST123",
      rating: 5,
      feedback: "Excellent experience!",
    });

    expect(
      localStorage.getItem(
        "feedbackSubmitted_TEST123"
      )
    ).toBe("true");

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // SAVES MULTIPLE FEEDBACKS TEST
  // ==========================================

  test("preserves existing feedbacks when adding new feedback", () => {
    const existingFeedback = {
      id: 111,
      orderId: "OLD123",
      rating: 4,
      feedback: "Good",
      date: "01/01/2026",
    };

    localStorage.setItem(
      "feedbacks",
      JSON.stringify([existingFeedback])
    );

    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[2].closest("button"));

    const textarea = screen.getByPlaceholderText(
      "Tell us about your order experience..."
    );

    fireEvent.change(textarea, {
      target: {
        value: "Average experience",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit Feedback",
      })
    );

    const savedFeedback = JSON.parse(
      localStorage.getItem("feedbacks")
    );

    expect(savedFeedback).toHaveLength(2);

    expect(savedFeedback[0]).toEqual(
      existingFeedback
    );

    expect(savedFeedback[1]).toMatchObject({
      orderId: "TEST123",
      rating: 3,
      feedback: "Average experience",
    });
  });

  // ==========================================
  // OPTIONAL REVIEW TEST
  // ==========================================

  test("allows submitting feedback without writing a review", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[3].closest("button"));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit Feedback",
      })
    );

    const savedFeedback = JSON.parse(
      localStorage.getItem("feedbacks")
    );

    expect(savedFeedback[0]).toMatchObject({
      orderId: "TEST123",
      rating: 4,
      feedback: "",
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // WITHOUT ORDER TEST
  // ==========================================

  test("renders N/A when order is not provided", () => {
    render(
      <Feedback
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByText("Order #N/A")
    ).toBeInTheDocument();
  });

  // ==========================================
  // SUBMIT WITHOUT ORDER TEST
  // ==========================================

  test("submits feedback without order information", () => {
    render(
      <Feedback
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[4].closest("button"));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit Feedback",
      })
    );

    const savedFeedback = JSON.parse(
      localStorage.getItem("feedbacks")
    );

    expect(savedFeedback).toHaveLength(1);

    expect(savedFeedback[0]).toMatchObject({
      orderId: "N/A",
      rating: 5,
      feedback: "",
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // No orderId means this key should not be created
    expect(
      Object.keys(localStorage)
    ).not.toContain(
      "feedbackSubmitted_undefined"
    );
  });

  // ==========================================
  // MAX LENGTH TEST
  // ==========================================

  test("textarea has maximum length of 500 characters", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Tell us about your order experience..."
    );

    expect(textarea).toHaveAttribute(
      "maxLength",
      "500"
    );
  });

  // ==========================================
  // CLOSE FUNCTION SAFETY TEST
  // ==========================================

  test("does not throw error when onClose is not provided", () => {
    expect(() => {
      render(
        <Feedback order={mockOrder} />
      );
    }).not.toThrow();
  });

  // ==========================================
  // FEEDBACK DATA DATE TEST
  // ==========================================

  test("stores a date when feedback is submitted", () => {
    render(
      <Feedback
        order={mockOrder}
        onClose={mockOnClose}
      />
    );

    const stars = screen.getAllByTestId("star-icon");

    fireEvent.click(stars[4].closest("button"));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit Feedback",
      })
    );

    const savedFeedback = JSON.parse(
      localStorage.getItem("feedbacks")
    );

    expect(savedFeedback[0].date).toBeDefined();
    expect(savedFeedback[0].date).not.toBe("");
  });
});