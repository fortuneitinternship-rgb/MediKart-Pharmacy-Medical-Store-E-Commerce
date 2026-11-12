import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Newsletter from "./Newsletter";
import { subscribeNewsletter } from "../../api/newsletterApi";

// Mock newsletter API
jest.mock("../../api/newsletterApi", () => ({
    subscribeNewsletter: jest.fn(),
}));

describe("Newsletter Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Render test
    test("renders newsletter section correctly", () => {
        render(<Newsletter />);

        expect(
            screen.getByRole("heading", {
                name: /subscribe to our newsletter/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(
                /enter your email address/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        ).toBeInTheDocument();
    });

    // 2. Empty email validation
    test("shows error when email is empty", async () => {
        render(<Newsletter />);

        const button = screen.getByRole("button", {
            name: /subscribe/i,
        });

        fireEvent.click(button);

        expect(
            await screen.findByText(
                "Please enter your email address."
            )
        ).toBeInTheDocument();

        expect(subscribeNewsletter).not.toHaveBeenCalled();
    });

    // 3. Invalid email validation
    test("shows error for invalid email", async () => {
        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "invalid-email",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        );

        expect(
            await screen.findByText(
                "Please enter a valid email address."
            )
        ).toBeInTheDocument();

        expect(subscribeNewsletter).not.toHaveBeenCalled();
    });

    // 4. Input change test
    test("allows user to enter email", () => {
        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        expect(input).toHaveValue("test@example.com");
    });

    // 5. Successful subscription
    test("subscribes successfully with valid email", async () => {
        subscribeNewsletter.mockResolvedValueOnce({
            message: "Subscribed successfully",
        });

        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        );

        await waitFor(() => {
            expect(subscribeNewsletter).toHaveBeenCalledTimes(1);
        });

        expect(subscribeNewsletter).toHaveBeenCalledWith(
            "test@example.com"
        );

        expect(
            await screen.findByText(
                "Thank you for subscribing! You'll receive our latest updates and offers."
            )
        ).toBeInTheDocument();

        // Email should be cleared after successful subscription
        expect(input).toHaveValue("");
    });

    // 6. Loading state
    test("shows loading state while subscribing", async () => {
        let resolveRequest;

        subscribeNewsletter.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /subscribing/i,
            })
        ).toBeDisabled();

        expect(input).toBeDisabled();

        // Complete API request
        await act(async () => {
            resolveRequest({
                message: "Success",
            });
        });

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /subscribe/i,
                })
            ).not.toBeDisabled();
        });
    });

    // 7. API error
    test("shows error when API request fails", async () => {
        subscribeNewsletter.mockRejectedValueOnce(
            new Error("Subscription failed")
        );

        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        );

        expect(
            await screen.findByText("Subscription failed")
        ).toBeInTheDocument();

        expect(subscribeNewsletter).toHaveBeenCalledWith(
            "test@example.com"
        );
    });

    // 8. Generic API error
    test("shows default error when API error has no message", async () => {
        subscribeNewsletter.mockRejectedValueOnce({});

        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        );

        expect(
            await screen.findByText(
                "Something went wrong. Please try again."
            )
        ).toBeInTheDocument();
    });

    // 9. Message auto hides after 5 seconds
    test("automatically hides success message after 5 seconds", async () => {
        jest.useFakeTimers();

        subscribeNewsletter.mockResolvedValueOnce({});

        render(<Newsletter />);

        const input = screen.getByPlaceholderText(
            /enter your email address/i
        );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /subscribe/i,
            })
        );

        expect(
            await screen.findByText(
                "Thank you for subscribing! You'll receive our latest updates and offers."
            )
        ).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        await waitFor(() => {
            expect(
                screen.queryByText(
                    "Thank you for subscribing! You'll receive our latest updates and offers."
                )
            ).not.toBeInTheDocument();
        });

        jest.useRealTimers();
    });
});