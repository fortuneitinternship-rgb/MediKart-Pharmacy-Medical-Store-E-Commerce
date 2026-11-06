import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Offers from "./Offers";

// Mock Footer so the test only focuses on Offers
jest.mock("../../components/Footer/Footer", () => () => (
    <div data-testid="mock-footer">Footer</div>
));

describe("Offers Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        Object.defineProperty(navigator, "clipboard", {
            value: {
                writeText: jest.fn().mockResolvedValue(undefined),
            },
            configurable: true,
        });

        jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("renders Offers page", () => {
        render(<Offers />);

        expect(
            screen.getByText("MEDIKART Offers & Coupons")
        ).toBeInTheDocument();
    });

    test("renders offers description", () => {
        render(<Offers />);

        expect(
            screen.getByText("Save more on every order.")
        ).toBeInTheDocument();
    });

    test("renders offers header", () => {
        render(<Offers />);

        const heading = screen.getByRole("heading", {
            name: /medikart offers & coupons/i,
        });

        expect(heading).toBeInTheDocument();
    });

    test("renders offer cards", () => {
        render(<Offers />);

        const cards = document.querySelectorAll(".offer-card");

        expect(cards).toHaveLength(4);
    });

    test("renders offer grid", () => {
        render(<Offers />);

        expect(
            document.querySelector(".offers-grid")
        ).toBeInTheDocument();
    });

    test("renders coupon boxes", () => {
        render(<Offers />);

        const couponBoxes = document.querySelectorAll(".coupon-box");

        expect(couponBoxes).toHaveLength(4);
    });

    test("renders valid till text for offers", () => {
        render(<Offers />);

        const validTillTexts = screen.getAllByText(/valid till:/i);

        expect(validTillTexts).toHaveLength(4);
    });

    test("renders Copy Code buttons", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        expect(buttons).toHaveLength(4);
    });

    test("Copy Code buttons have correct class", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        buttons.forEach((button) => {
            expect(button).toHaveClass("copy-btn");
        });
    });

    test("renders Footer", () => {
        render(<Offers />);

        expect(
            screen.getByTestId("mock-footer")
        ).toBeInTheDocument();
    });

    test("renders offer icons", () => {
        render(<Offers />);

        const icons = document.querySelectorAll(".offer-icon");

        expect(icons).toHaveLength(4);
    });

    test("clicking Copy Code calls clipboard writeText", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        fireEvent.click(buttons[0]);

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    test("clicking each Copy Code button calls clipboard", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        buttons.forEach((button) => {
            fireEvent.click(button);
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(4);
    });

    test("clicking Copy Code shows alert", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        fireEvent.click(buttons[0]);

        expect(window.alert).toHaveBeenCalledTimes(1);
    });

    test("alert is displayed after copying", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        fireEvent.click(buttons[0]);

        expect(window.alert).toHaveBeenCalled();
    });

    test("each Copy Code button can be clicked", () => {
        render(<Offers />);

        const buttons = screen.getAllByRole("button", {
            name: /copy code/i,
        });

        buttons.forEach((button) => {
            expect(button).toBeEnabled();
        });
    });

    test("offers page has correct main container", () => {
        render(<Offers />);

        expect(
            document.querySelector(".offers-page")
        ).toBeInTheDocument();
    });

    test("offers header has correct class", () => {
        render(<Offers />);

        expect(
            document.querySelector(".offers-header")
        ).toBeInTheDocument();
    });
});