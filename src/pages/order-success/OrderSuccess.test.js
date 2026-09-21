import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import OrderSuccess from "./OrderSuccess";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useLocation: () => ({
        state: null,
    }),
}));

describe("OrderSuccess Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    test("renders order success page", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByText("Order Placed Successfully!")
        ).toBeInTheDocument();
    });

    test("renders success message", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByText(
                /thank you for your order. your order has been placed successfully/i
            )
        ).toBeInTheDocument();
    });

    test("renders order ID section", () => {
        render(<OrderSuccess />);

        expect(screen.getByText("Order ID")).toBeInTheDocument();
        expect(screen.getByText("MK0000000000")).toBeInTheDocument();
    });

    test("renders delivery message", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByText(
                /your order will be processed and delivered to you soon/i
            )
        ).toBeInTheDocument();
    });

    test("renders View Orders button", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByRole("button", {
                name: /view orders/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Continue Shopping button", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByRole("button", {
                name: /continue shopping/i,
            })
        ).toBeInTheDocument();
    });

    test("View Orders button navigates to orders page", () => {
        render(<OrderSuccess />);

        const button = screen.getByRole("button", {
            name: /view orders/i,
        });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/orders");
    });

    test("Continue Shopping button navigates to shop page", () => {
        render(<OrderSuccess />);

        const button = screen.getByRole("button", {
            name: /continue shopping/i,
        });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/shop");
    });

    test("uses lastOrderId from localStorage", () => {
        localStorage.setItem("lastOrderId", "MK1234567890");

        render(<OrderSuccess />);

        expect(
            screen.getByText("MK1234567890")
        ).toBeInTheDocument();
    });

    test("uses fallback order ID when localStorage is empty", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByText("MK0000000000")
        ).toBeInTheDocument();
    });

    test("has success icon", () => {
        render(<OrderSuccess />);

        const icon = document.querySelector(".success-icon");

        expect(icon).toBeInTheDocument();
        expect(icon.querySelector("svg")).toBeInTheDocument();
    });

    test("renders order information container", () => {
        render(<OrderSuccess />);

        const orderInfo = document.querySelector(".order-info");

        expect(orderInfo).toBeInTheDocument();
        expect(orderInfo).toHaveTextContent("Order ID");
    });

    test("renders success action container", () => {
        render(<OrderSuccess />);

        expect(
            document.querySelector(".success-actions")
        ).toBeInTheDocument();
    });

    test("buttons are enabled", () => {
        render(<OrderSuccess />);

        expect(
            screen.getByRole("button", {
                name: /view orders/i,
            })
        ).toBeEnabled();

        expect(
            screen.getByRole("button", {
                name: /continue shopping/i,
            })
        ).toBeEnabled();
    });
});