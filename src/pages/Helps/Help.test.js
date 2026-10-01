import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Help from "./Help";

describe("Help Component", () => {
    test("renders the Help page", () => {
        render(<Help />);

        expect(
            screen.getByRole("heading", {
                name: /how can we help you/i,
            })
        ).toBeInTheDocument();
    });

    test("renders help description", () => {
        render(<Help />);

        expect(
            screen.getByText(
                /find answers to your questions or get in touch with medikart support/i
            )
        ).toBeInTheDocument();
    });

    test("renders search input", () => {
        render(<Help />);

        expect(
            screen.getByPlaceholderText(/search for help/i)
        ).toBeInTheDocument();
    });

    test("renders all help categories", () => {
        render(<Help />);

        expect(screen.getByText("Orders")).toBeInTheDocument();
        expect(screen.getByText("Medicines")).toBeInTheDocument();
        expect(screen.getByText("Delivery")).toBeInTheDocument();
        expect(screen.getByText("Payments")).toBeInTheDocument();
        expect(screen.getByText("Account")).toBeInTheDocument();
    });

    test("renders Frequently Asked Questions section", () => {
        render(<Help />);

        expect(
            screen.getByRole("heading", {
                name: /frequently asked questions/i,
            })
        ).toBeInTheDocument();
    });

    test("renders FAQ questions", () => {
        render(<Help />);

        expect(
            screen.getByText(/how can i place an order/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/how can i track my order/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/can i cancel my order/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/how long does delivery take/i)
        ).toBeInTheDocument();
    });

    test("opens FAQ answer when question is clicked", () => {
        render(<Help />);

        const question = screen.getByText(/how can i place an order/i);

        fireEvent.click(question);

        expect(
            screen.getByText(
                /browse medicines or healthcare products, add the required products to your cart/i
            )
        ).toBeInTheDocument();
    });

    test("closes FAQ answer when question is clicked again", () => {
        render(<Help />);

        const question = screen.getByText(/how can i place an order/i);

        fireEvent.click(question);

        expect(
            screen.getByText(
                /browse medicines or healthcare products, add the required products to your cart/i
            )
        ).toBeInTheDocument();

        fireEvent.click(question);

        expect(
            screen.queryByText(
                /browse medicines or healthcare products, add the required products to your cart/i
            )
        ).not.toBeInTheDocument();
    });

    test("opens only the selected FAQ", () => {
        render(<Help />);

        const firstQuestion = screen.getByText(/how can i place an order/i);
        const secondQuestion = screen.getByText(/how can i track my order/i);

        fireEvent.click(firstQuestion);

        expect(
            screen.getByText(
                /browse medicines or healthcare products, add the required products to your cart/i
            )
        ).toBeInTheDocument();

        fireEvent.click(secondQuestion);

        expect(
            screen.queryByText(
                /browse medicines or healthcare products, add the required products to your cart/i
            )
        ).not.toBeInTheDocument();

        expect(
            screen.getByText(
                /go to your orders section and select the order you want to track/i
            )
        ).toBeInTheDocument();
    });

    test("search filters FAQ questions", () => {
        render(<Help />);

        const searchInput = screen.getByPlaceholderText(/search for help/i);

        fireEvent.change(searchInput, {
            target: {
                value: "password",
            },
        });

        expect(
            screen.getByText(/how can i reset my password/i)
        ).toBeInTheDocument();

        expect(
            screen.queryByText(/how can i place an order/i)
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText(/how can i track my order/i)
        ).not.toBeInTheDocument();
    });

    test("search works case-insensitively", () => {
        render(<Help />);

        const searchInput = screen.getByPlaceholderText(/search for help/i);

        fireEvent.change(searchInput, {
            target: {
                value: "DELIVERY",
            },
        });

        expect(
            screen.getByText(/how long does delivery take/i)
        ).toBeInTheDocument();
    });

    test("shows no results message for invalid search", () => {
        render(<Help />);

        const searchInput = screen.getByPlaceholderText(/search for help/i);

        fireEvent.change(searchInput, {
            target: {
                value: "xyzabc123",
            },
        });

        expect(
            screen.getByText(/no results found for "xyzabc123"/i)
        ).toBeInTheDocument();
    });

    test("renders Still need help section", () => {
        render(<Help />);

        expect(
            screen.getByRole("heading", {
                name: /still need help/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Call Us option", () => {
        render(<Help />);

        expect(screen.getByText("Call Us")).toBeInTheDocument();

        expect(
            screen.getByText("+91 98765 43210")
        ).toBeInTheDocument();
    });

    test("renders Email Us option", () => {
        render(<Help />);

        expect(screen.getByText("Email Us")).toBeInTheDocument();

        expect(
            screen.getByText("support@medikart.com")
        ).toBeInTheDocument();
    });

    test("renders Live Chat option", () => {
        render(<Help />);

        expect(screen.getByText("Live Chat")).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /start chat/i,
            })
        ).toBeInTheDocument();
    });

    test("clicking Start Chat shows alert", () => {
        const alertMock = jest
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        render(<Help />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /start chat/i,
            })
        );

        expect(alertMock).toHaveBeenCalledWith(
            "Live chat coming soon!"
        );

        alertMock.mockRestore();
    });

    test("renders correct phone link", () => {
        render(<Help />);

        const phoneLink = screen.getByRole("link", {
            name: "+91 98765 43210",
        });

        expect(phoneLink).toHaveAttribute(
            "href",
            "tel:+91 98765 43210"
        );
    });

    test("renders correct email link", () => {
        render(<Help />);

        const emailLink = screen.getByRole("link", {
            name: "support@medikart.com",
        });

        expect(emailLink).toHaveAttribute(
            "href",
            "mailto:support@medikart.com"
        );
    });

    test("search can be cleared", () => {
        render(<Help />);

        const searchInput = screen.getByPlaceholderText(/search for help/i);

        fireEvent.change(searchInput, {
            target: {
                value: "payment",
            },
        });

        expect(
            screen.getByText(/what payment methods are available/i)
        ).toBeInTheDocument();

        fireEvent.change(searchInput, {
            target: {
                value: "",
            },
        });

        expect(
            screen.getByText(/how can i place an order/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/how can i track my order/i)
        ).toBeInTheDocument();
    });
});