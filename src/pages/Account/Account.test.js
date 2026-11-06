import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Account from "./Account";
import { getAccessToken, getCart } from "../../api/cartApi";
import { getWishlist } from "../../api/wishlistApi";
import { getOrders } from "../../api/ordersApi";
import { logoutUser } from "../../api/loginApi";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

jest.mock("../../api/cartApi", () => ({
    getAccessToken: jest.fn(),
    getCart: jest.fn(),
}));

jest.mock("../../api/wishlistApi", () => ({
    getWishlist: jest.fn(),
}));

jest.mock("../../api/ordersApi", () => ({
    getOrders: jest.fn(),
}));

jest.mock("../../api/loginApi", () => ({
    logoutUser: jest.fn(),
}));

describe("Account", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        getAccessToken.mockReturnValue(null);
        getCart.mockResolvedValue([]);
        getWishlist.mockResolvedValue([]);
        getOrders.mockResolvedValue([]);
    });

    test("renders the account page and guest defaults", () => {
        render(<Account />);

        expect(screen.getByRole("heading", { name: "My Account" })).toBeInTheDocument();
        expect(screen.getByText("MEDIKART User")).toBeInTheDocument();
        expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });

    test("loads profile information from the saved session", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ name: "Test User", email: "test@example.com" })
        );

        render(<Account />);

        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    test("loads cart, wishlist, and order counts from authenticated APIs", async () => {
        getAccessToken.mockReturnValue("test-token");
        getCart.mockResolvedValue([{ quantity: 2 }, { quantity: 1 }]);
        getWishlist.mockResolvedValue([{ id: 1 }]);
        getOrders.mockResolvedValue([{ id: 1 }, { id: 2 }]);

        render(<Account />);

        await waitFor(() => {
            expect(getCart).toHaveBeenCalled();
            expect(getWishlist).toHaveBeenCalled();
            expect(getOrders).toHaveBeenCalled();
            expect(screen.getAllByText("3").length).toBeGreaterThan(0);
            expect(screen.getAllByText("2").length).toBeGreaterThan(0);
            expect(screen.getAllByText("1").length).toBeGreaterThan(0);
        });

        expect(screen.getByText("Recent Order")).toBeInTheDocument();
    });

    test("does not fetch private account data without an access token", async () => {
        render(<Account />);

        await waitFor(() => {
            expect(screen.getByText("No recent orders")).toBeInTheDocument();
        });

        expect(getCart).not.toHaveBeenCalled();
        expect(getWishlist).not.toHaveBeenCalled();
        expect(getOrders).not.toHaveBeenCalled();
    });

    test("refreshes account data after cart updates", async () => {
        getAccessToken.mockReturnValue("test-token");
        getCart
            .mockResolvedValueOnce([{ quantity: 1 }])
            .mockResolvedValueOnce([{ quantity: 4 }]);

        render(<Account />);
        await waitFor(() => expect(getCart).toHaveBeenCalledTimes(1));

        fireEvent(window, new Event("cartUpdated"));

        await waitFor(() => {
            expect(getCart).toHaveBeenCalledTimes(2);
            expect(screen.getAllByText("4").length).toBeGreaterThan(0);
        });
    });

    test("logs out and navigates to login", () => {
        render(<Account />);
        fireEvent.click(screen.getByRole("button", { name: /logout/i }));

        expect(logoutUser).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("cleans up account event listeners on unmount", () => {
        const removeListener = jest.spyOn(window, "removeEventListener");
        const { unmount } = render(<Account />);

        unmount();

        expect(removeListener).toHaveBeenCalledWith("storage", expect.any(Function));
        expect(removeListener).toHaveBeenCalledWith("cartUpdated", expect.any(Function));
        removeListener.mockRestore();
    });
});
