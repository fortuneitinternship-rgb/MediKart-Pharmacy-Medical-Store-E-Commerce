import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Reviews from "./Reviews";

import {
    getReviews,
    submitReview,
} from "../../api/submissionsApi";

import { getApiErrorMessage } from "../../services/api";

jest.mock("../../api/submissionsApi", () => ({
    getReviews: jest.fn(),
    submitReview: jest.fn(),
}));

jest.mock("../../services/api", () => ({
    getApiErrorMessage: jest.fn(),
}));

describe("Reviews Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getApiErrorMessage.mockImplementation(
            (error, fallback) => fallback
        );

        getReviews.mockResolvedValue([]);
    });

    test("renders reviews page correctly", async () => {
        render(<Reviews />);

        expect(
            screen.getByRole("heading", {
                name: /customer reviews/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/see what our customers say/i)
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(/your name/i)
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(/product name/i)
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(/write your review/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /submit review/i,
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getReviews).toHaveBeenCalledTimes(1);
        });
    });

    test("loads reviews successfully", async () => {
        getReviews.mockResolvedValue([
            {
                id: 1,
                name: "Test",
                product: "Item",
                rating: 5,
                review: "Good",
            },
        ]);

        render(<Reviews />);

        await waitFor(() => {
            expect(screen.getByText("Test")).toBeInTheDocument();
            expect(screen.getByText("Item")).toBeInTheDocument();
            expect(screen.getByText("Good")).toBeInTheDocument();
        });
    });

    test("shows error when reviews cannot be loaded", async () => {
        getReviews.mockRejectedValue(new Error("API error"));

        render(<Reviews />);

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Unable to load reviews."
            );
        });

        expect(getApiErrorMessage).toHaveBeenCalled();
    });

    test("allows entering review form values", () => {
        render(<Reviews />);

        const nameInput = screen.getByPlaceholderText(/your name/i);
        const productInput =
            screen.getByPlaceholderText(/product name/i);
        const reviewInput =
            screen.getByPlaceholderText(/write your review/i);
        const ratingSelect = screen.getByRole("combobox");

        fireEvent.change(nameInput, {
            target: {
                name: "name",
                value: "Test",
            },
        });

        fireEvent.change(productInput, {
            target: {
                name: "product",
                value: "Item",
            },
        });

        fireEvent.change(ratingSelect, {
            target: {
                name: "rating",
                value: "4",
            },
        });

        fireEvent.change(reviewInput, {
            target: {
                name: "review",
                value: "Good",
            },
        });

        expect(nameInput).toHaveValue("Test");
        expect(productInput).toHaveValue("Item");
        expect(ratingSelect).toHaveValue("4");
        expect(reviewInput).toHaveValue("Good");
    });

    test("shows validation alert when required fields are empty", () => {
        const alertMock = jest
            .spyOn(window, "alert")
            .mockImplementation(() => {});

        render(<Reviews />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /submit review/i,
            })
        );

        expect(alertMock).toHaveBeenCalledWith(
            "Please fill all fields"
        );

        expect(submitReview).not.toHaveBeenCalled();

        alertMock.mockRestore();
    });

    test("submits review successfully", async () => {
        submitReview.mockResolvedValue({
            id: 2,
            name: "Test",
            product: "Item",
            rating: 5,
            review: "Excellent",
        });

        render(<Reviews />);

        fireEvent.change(
            screen.getByPlaceholderText(/your name/i),
            {
                target: {
                    name: "name",
                    value: "Test",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(/product name/i),
            {
                target: {
                    name: "product",
                    value: "Item",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(/write your review/i),
            {
                target: {
                    name: "review",
                    value: "Excellent",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /submit review/i,
            })
        );

        await waitFor(() => {
            expect(submitReview).toHaveBeenCalledTimes(1);
        });

        expect(submitReview).toHaveBeenCalledWith({
            name: "Test",
            product: "Item",
            rating: 5,
            review: "Excellent",
        });

        await waitFor(() => {
            expect(
                screen.getByText("Excellent")
            ).toBeInTheDocument();
        });
    });

    test("shows submitting state while review is being submitted", async () => {
        let resolveSubmit;

        submitReview.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSubmit = resolve;
                })
        );

        render(<Reviews />);

        fireEvent.change(
            screen.getByPlaceholderText(/your name/i),
            {
                target: {
                    name: "name",
                    value: "Test",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(/product name/i),
            {
                target: {
                    name: "product",
                    value: "Item",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(/write your review/i),
            {
                target: {
                    name: "review",
                    value: "Good",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /submit review/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /submitting/i,
            })
        ).toBeDisabled();

        resolveSubmit({
            id: 3,
            name: "Test",
            product: "Item",
            rating: 5,
            review: "Good",
        });

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /submit review/i,
                })
            ).not.toBeDisabled();
        });
    });

    test("shows error when review submission fails", async () => {
        submitReview.mockRejectedValue(new Error("Submit failed"));

        render(<Reviews />);

        fireEvent.change(
            screen.getByPlaceholderText(/your name/i),
            {
                target: {
                    name: "name",
                    value: "Test",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(/product name/i),
            {
                target: {
                    name: "product",
                    value: "Item",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(/write your review/i),
            {
                target: {
                    name: "review",
                    value: "Good",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /submit review/i,
            })
        );

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Unable to submit your review."
            );
        });

        expect(getApiErrorMessage).toHaveBeenCalled();
    });

    test("clears the form after successful submission", async () => {
        submitReview.mockResolvedValue({
            id: 4,
            name: "Test",
            product: "Item",
            rating: 5,
            review: "Good",
        });

        render(<Reviews />);

        const nameInput =
            screen.getByPlaceholderText(/your name/i);
        const productInput =
            screen.getByPlaceholderText(/product name/i);
        const reviewInput =
            screen.getByPlaceholderText(/write your review/i);

        fireEvent.change(nameInput, {
            target: {
                name: "name",
                value: "Test",
            },
        });

        fireEvent.change(productInput, {
            target: {
                name: "product",
                value: "Item",
            },
        });

        fireEvent.change(reviewInput, {
            target: {
                name: "review",
                value: "Good",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /submit review/i,
            })
        );

        await waitFor(() => {
            expect(nameInput).toHaveValue("");
            expect(productInput).toHaveValue("");
            expect(reviewInput).toHaveValue("");
        });
    });
});
