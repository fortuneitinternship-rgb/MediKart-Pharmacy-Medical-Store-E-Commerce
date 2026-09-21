import React from "react";
import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AccountDropdown from "./AccountDropdown";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),

    useNavigate: () => mockNavigate,
}));

describe("AccountDropdown Component", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    // ==========================================
    // HELPER
    // ==========================================

    const renderComponent = (props = {}) => {
        return render(
            <MemoryRouter>
                <AccountDropdown {...props} />
            </MemoryRouter>
        );
    };

    // ==========================================
    // BASIC RENDERING
    // ==========================================

    test("renders account dropdown", () => {
        renderComponent();

        expect(
            screen.getByText("My Account")
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Hi,/)
        ).toBeInTheDocument();
    });

    // ==========================================
    // DEFAULT USERNAME
    // ==========================================

    test("renders default username", () => {
        renderComponent();

        expect(
            screen.getByText(/Hi, Satender/)
        ).toBeInTheDocument();
    });

    // ==========================================
    // CUSTOM USERNAME
    // ==========================================

    test("renders custom username", () => {
        renderComponent({
            username: "Test User",
        });

        expect(
            screen.getByText(/Hi, Test User/)
        ).toBeInTheDocument();
    });

    // ==========================================
    // PROFILE
    // ==========================================

    test("renders My Profile link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /My Profile/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/profile"
        );
    });

    // ==========================================
    // MY ORDERS
    // ==========================================

    test("renders My Orders link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /My Orders/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/orders"
        );
    });

    // ==========================================
    // ORDER HISTORY
    // ==========================================

    test("renders Order History link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Order History/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/order-history"
        );
    });

    // ==========================================
    // TRACK ORDER
    // ==========================================

    test("renders Track Order link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Track Order/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/track-order"
        );
    });

    // ==========================================
    // WISHLIST
    // ==========================================

    test("renders Wishlist link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Wishlist/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/wishlist"
        );
    });

    // ==========================================
    // MY CART
    // ==========================================

    test("renders My Cart link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /My Cart/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/cart"
        );
    });

    // ==========================================
    // SAVED PAYMENTS
    // ==========================================

    test("renders Saved Payments link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Saved Payments/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/payments"
        );
    });

    // ==========================================
    // SAVED ADDRESSES
    // ==========================================

    test("renders Saved Addresses link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Saved Addresses/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/addresses"
        );
    });

    // ==========================================
    // UPLOAD PRESCRIPTION
    // ==========================================

    test("renders Upload Prescription link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Upload Prescription/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/upload-prescription"
        );
    });

    // ==========================================
    // HEALTH RECORDS
    // ==========================================

    test("renders Health Records link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Health Records/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/health-records"
        );
    });

    // ==========================================
    // OFFERS
    // ==========================================

    test("renders Offers & Coupons link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Offers & Coupons/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/offers"
        );
    });

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    test("renders Notifications link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Notifications/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/notifications"
        );
    });

    // ==========================================
    // SETTINGS
    // ==========================================

    test("renders Settings link", () => {
        renderComponent();

        const link =
            screen.getByRole("link", {
                name: /Settings/i,
            });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/settings"
        );
    });

    // ==========================================
    // ALL LINKS
    // ==========================================

    test("renders all account navigation links", () => {
        renderComponent();

        const expectedLinks = [
            "My Profile",
            "My Orders",
            "Order History",
            "Track Order",
            "Wishlist",
            "My Cart",
            "Saved Payments",
            "Saved Addresses",
            "Upload Prescription",
            "Health Records",
            "Offers & Coupons",
            "Notifications",
            "Settings",
        ];

        expectedLinks.forEach((linkName) => {
            expect(
                screen.getByRole("link", {
                    name: new RegExp(linkName, "i"),
                })
            ).toBeInTheDocument();
        });
    });

    // ==========================================
    // LOGOUT BUTTON
    // ==========================================

    test("renders Logout button", () => {
        renderComponent();

        expect(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        ).toBeInTheDocument();
    });

    // ==========================================
    // LOGOUT - LOCAL STORAGE
    // ==========================================

    test("removes username from localStorage on logout", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(
            localStorage.getItem("username")
        ).toBeNull();
    });

    test("removes login status from localStorage on logout", () => {
        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(
            localStorage.getItem("isLoggedIn")
        ).toBeNull();
    });

    // ==========================================
    // LOGOUT - NAVIGATION
    // ==========================================

    test("navigates to login page after logout", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    // ==========================================
    // LOGOUT - EVENT
    // ==========================================

    test("dispatches userUpdated event on logout", () => {
        const dispatchSpy = jest.spyOn(
            window,
            "dispatchEvent"
        );

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(dispatchSpy).toHaveBeenCalled();

        const event = dispatchSpy.mock.calls.find(
            ([event]) =>
                event?.type === "userUpdated"
        );

        expect(event).toBeDefined();

        dispatchSpy.mockRestore();
    });

    // ==========================================
    // LOGOUT COMPLETE BEHAVIOR
    // ==========================================

    test("performs complete logout behavior", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(
            localStorage.getItem("username")
        ).toBeNull();

        expect(
            localStorage.getItem("isLoggedIn")
        ).toBeNull();

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    // ==========================================
    // LINK COUNT
    // ==========================================

    test("renders exactly 13 account navigation links", () => {
        renderComponent();

        const links =
            screen.getAllByRole("link");

        expect(links).toHaveLength(13);
    });

    // ==========================================
    // LOGOUT IS NOT A LINK
    // ==========================================

    test("renders logout as a button", () => {
        renderComponent();

        const logoutButton =
            screen.getByRole("button", {
                name: /Logout/i,
            });

        expect(
            logoutButton.tagName
        ).toBe("BUTTON");
    });
});