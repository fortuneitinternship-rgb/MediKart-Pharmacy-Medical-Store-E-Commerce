import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FeedbackPopup from "./Feedback";

import { submitOrderFeedback } from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

jest.mock("../../api/submissionsApi", () => ({
    submitOrderFeedback: jest.fn(),
}));

jest.mock("../../services/api", () => ({
    getApiErrorMessage: jest.fn(),
}));

describe("FeedbackPopup Component", () => {
    const mockOrder = {
        orderId: "TEST-001",
    };

    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        getApiErrorMessage.mockImplementation(
            (error, fallback) => error?.message || fallback
        );
    });

    // 1. Render popup
    test("renders feedback popup correctly", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        expect(
            screen.getByText("How was your order?")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Order #TEST-001")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Rate your experience")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Write a review")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        ).toBeInTheDocument();
    });

    // 2. Shows N/A when order is missing
    test("shows N/A when order ID is missing", () => {
        render(
            <FeedbackPopup
                order={{}}
                onClose={mockOnClose}
            />
        );

        expect(
            screen.getByText("Order #N/A")
        ).toBeInTheDocument();
    });

    // 3. Selects one star
    test("selects a star rating", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const starButtons = screen.getAllByRole("button");

        // First button after close button is the first star
        fireEvent.click(starButtons[1]);

        expect(
            screen.getByText("Very Poor")
        ).toBeInTheDocument();
    });

    // 4. Selects different ratings
    test("updates rating text when different stars are selected", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const buttons = screen.getAllByRole("button");

        // Star 3
        fireEvent.click(buttons[3]);

        expect(
            screen.getByText("Average")
        ).toBeInTheDocument();

        // Star 5
        fireEvent.click(buttons[5]);

        expect(
            screen.getByText("Excellent")
        ).toBeInTheDocument();
    });

    // 5. Textarea works
    test("allows user to enter feedback", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const textarea = screen.getByPlaceholderText(
            "Tell us about your order experience..."
        );

        fireEvent.change(textarea, {
            target: {
                value: "Test feedback message",
            },
        });

        expect(textarea).toHaveValue(
            "Test feedback message"
        );

        expect(
            screen.getByText("21/500")
        ).toBeInTheDocument();
    });

    // 6. Character count starts at zero
    test("shows initial character count", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        expect(
            screen.getByText("0/500")
        ).toBeInTheDocument();
    });

    // 7. Prevents submission without rating
    test("shows alert when submitting without rating", () => {
        const alertMock = jest
            .spyOn(window, "alert")
            .mockImplementation(() => {});

        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        );

        expect(alertMock).toHaveBeenCalledWith(
            "Please select a star rating."
        );

        expect(
            submitOrderFeedback
        ).not.toHaveBeenCalled();

        alertMock.mockRestore();
    });

    // 8. Shows error when order cannot be identified
    test("shows error when order ID is missing during submission", () => {
        render(
            <FeedbackPopup
                order={{}}
                onClose={mockOnClose}
            />
        );

        const buttons = screen.getAllByRole("button");

        // Select first star
        fireEvent.click(buttons[1]);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        );

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent(
            "The order could not be identified."
        );

        expect(
            submitOrderFeedback
        ).not.toHaveBeenCalled();
    });

    // 9. Successfully submits feedback
    test("submits feedback successfully", async () => {
        submitOrderFeedback.mockResolvedValue({
            success: true,
        });

        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const buttons = screen.getAllByRole("button");

        // Select 5 stars
        fireEvent.click(buttons[5]);

        const textarea = screen.getByPlaceholderText(
            "Tell us about your order experience..."
        );

        fireEvent.change(textarea, {
            target: {
                value: "Test feedback",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        );

        await waitFor(() => {
            expect(
                submitOrderFeedback
            ).toHaveBeenCalledWith({
                order_id: "TEST-001",
                rating: 5,
                feedback: "Test feedback",
            });
        });

        expect(mockOnClose).toHaveBeenCalledTimes(1);

        expect(
            localStorage.getItem(
                "feedbackSubmitted_TEST-001"
            )
        ).toBe("true");
    });

    // 10. Shows submitting state
    test("shows submitting state while API request is pending", async () => {
        let resolveRequest;

        submitOrderFeedback.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[2]);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        );

        expect(
            screen.getByRole("button", {
                name: "Submitting...",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Maybe Later",
            })
        ).toBeDisabled();

        resolveRequest({ success: true });

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    // 11. Handles API error
    test("shows API error when submission fails", async () => {
        const apiError = new Error("Server error");

        submitOrderFeedback.mockRejectedValue(apiError);

        getApiErrorMessage.mockReturnValue(
            "Unable to submit feedback."
        );

        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const buttons = screen.getAllByRole("button");

        // Select rating
        fireEvent.click(buttons[3]);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        );

        await waitFor(() => {
            expect(
                screen.getByRole("alert")
            ).toHaveTextContent(
                "Unable to submit feedback."
            );
        });

        expect(mockOnClose).not.toHaveBeenCalled();

        expect(getApiErrorMessage).toHaveBeenCalled();
    });

    // 12. Maybe Later closes popup
    test("closes popup when Maybe Later is clicked", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Maybe Later",
            })
        );

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // 13. Close X button closes popup
    test("closes popup using close button", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close",
            })
        );

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // 14. Supports order_id format
    test("supports order_id when orderId is not available", async () => {
        submitOrderFeedback.mockResolvedValue({
            success: true,
        });

        const orderWithSnakeCase = {
            order_id: "TEST-002",
        };

        render(
            <FeedbackPopup
                order={orderWithSnakeCase}
                onClose={mockOnClose}
            />
        );

        const buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[2]);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Submit Feedback",
            })
        );

        await waitFor(() => {
            expect(
                submitOrderFeedback
            ).toHaveBeenCalledWith({
                order_id: "TEST-002",
                rating: 2,
                feedback: "",
            });
        });
    });

    // 15. Feedback can be up to 500 characters
    test("accepts feedback text up to 500 characters", () => {
        render(
            <FeedbackPopup
                order={mockOrder}
                onClose={mockOnClose}
            />
        );

        const textarea = screen.getByPlaceholderText(
            "Tell us about your order experience..."
        );

        const testText = "A".repeat(500);

        fireEvent.change(textarea, {
            target: {
                value: testText,
            },
        });

        expect(textarea).toHaveValue(testText);

        expect(
            screen.getByText("500/500")
        ).toBeInTheDocument();
    });
});