import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Account from "./Account";

// ======================================================
// MOCK NAVIGATION
// ======================================================

const mockNavigate = jest.fn();

// ======================================================
// MOCK REACT ROUTER
// ======================================================

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),

    useNavigate: () => mockNavigate,

    Link: ({ children, to, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

// ======================================================
// TEST SETUP
// ======================================================

describe("Account Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        delete window.location;
        window.location = {
            href: "",
        };
    });

    // ======================================================
    // BASIC RENDERING
    // ======================================================

    test("renders My Account page", () => {
        render(<Account />);

        expect(
            screen.getByRole("heading", {
                name: "My Account",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Manage your MEDIKART account"
            )
        ).toBeInTheDocument();
    });

    // ======================================================
    // HEADER
    // ======================================================

    test("renders Back to Home link", () => {
        render(<Account />);

        const homeLink = screen.getByRole("link", {
            name: /back to home/i,
        });

        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute("href", "/");
    });

    // ======================================================
    // DEFAULT USER
    // ======================================================

    test("renders default account information", () => {
        render(<Account />);

        expect(
            screen.getByText("MEDIKART User")
        ).toBeInTheDocument();

        expect(
            screen.getByText("user@example.com")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Welcome back,")
        ).toBeInTheDocument();

        expect(
            screen.getByText("MEDIKART Member")
        ).toBeInTheDocument();
    });

    // ======================================================
    // LOAD USER FROM LOCAL STORAGE
    // ======================================================

    test("loads account information from localStorage", async () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
                email: "test@example.com",
            })
        );

        render(<Account />);

        await waitFor(() => {
            expect(
                screen.getByText("Test User")
            ).toBeInTheDocument();

            expect(
                screen.getByText("test@example.com")
            ).toBeInTheDocument();
        });
    });

    // ======================================================
    // CART COUNT
    // ======================================================

    test("loads cart count from localStorage", async () => {
        localStorage.setItem(
            "cart",
            JSON.stringify([
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ])
        );

        render(<Account />);

        await waitFor(() => {
            const cartLinks = screen.getAllByRole("link", {
                name: /cart/i,
            });

            expect(cartLinks.length).toBeGreaterThan(0);
        });

        expect(
            screen.getByText("Cart Items")
        ).toBeInTheDocument();

        expect(
            screen.getAllByText("3").length
        ).toBeGreaterThan(0);
    });

    // ======================================================
    // WISHLIST COUNT
    // ======================================================

    test("loads wishlist count from localStorage", async () => {
        localStorage.setItem(
            "wishlist",
            JSON.stringify([
                { id: 1 },
                { id: 2 },
            ])
        );

        render(<Account />);

        await waitFor(() => {
            expect(
                screen.getByText("Wishlist")
            ).toBeInTheDocument();
        });

        expect(
            screen.getAllByText("2").length
        ).toBeGreaterThan(0);
    });

    // ======================================================
    // ORDERS COUNT
    // ======================================================

    test("loads orders count from localStorage", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
            ])
        );

        render(<Account />);

        await waitFor(() => {
            expect(
                screen.getByText("Orders")
            ).toBeInTheDocument();
        });

        expect(
            screen.getAllByText("4").length
        ).toBeGreaterThan(0);
    });

    // ======================================================
    // DEFAULT COUNTS
    // ======================================================

    test("shows zero counts when storage is empty", () => {
        render(<Account />);

        expect(
            screen.getByText("Orders")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Wishlist")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Cart Items")
        ).toBeInTheDocument();

        const zeroValues = screen.getAllByText("0");

        expect(zeroValues.length).toBeGreaterThanOrEqual(3);
    });

    // ======================================================
    // ACCOUNT MENU
    // ======================================================

    test("renders all account menu items", () => {
        render(<Account />);

        expect(
            screen.getByText("My Orders")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Track Order")
        ).toBeInTheDocument();

        expect(
            screen.getByText("My Wishlist")
        ).toBeInTheDocument();

        expect(
            screen.getByText("My Cart")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Saved Addresses")
        ).toBeInTheDocument();

        expect(
            screen.getByText("My Prescriptions")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Payments")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Notifications")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Account Settings")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Help & Support")
        ).toBeInTheDocument();
    });

    // ======================================================
    // ACCOUNT MENU LINKS
    // ======================================================

    test("renders correct navigation paths", () => {
        render(<Account />);

        expect(
            screen.getByRole("link", {
                name: /my orders/i,
            })
        ).toHaveAttribute("href", "/orders");

        expect(
            screen.getByRole("link", {
                name: /track order/i,
            })
        ).toHaveAttribute("href", "/track-order");

        expect(
            screen.getByRole("link", {
                name: /my wishlist/i,
            })
        ).toHaveAttribute("href", "/wishlist");

        expect(
            screen.getByRole("link", {
                name: /my cart/i,
            })
        ).toHaveAttribute("href", "/cart");

        expect(
            screen.getByRole("link", {
                name: /saved addresses/i,
            })
        ).toHaveAttribute("href", "/addresses");

        expect(
            screen.getByRole("link", {
                name: /my prescriptions/i,
            })
        ).toHaveAttribute("href", "/prescriptions");

        expect(
            screen.getByRole("link", {
                name: /payments/i,
            })
        ).toHaveAttribute("href", "/payments");

        expect(
            screen.getByRole("link", {
                name: /notifications/i,
            })
        ).toHaveAttribute("href", "/notifications");

        expect(
            screen.getByRole("link", {
                name: /account settings/i,
            })
        ).toHaveAttribute("href", "/settings");

        expect(
            screen.getByRole("link", {
                name: /help & support/i,
            })
        ).toHaveAttribute("href", "/help");
    });

    // ======================================================
    // QUICK STATS LINKS
    // ======================================================

    test("renders quick statistics links", () => {
        render(<Account />);

        const orderLinks = screen.getAllByRole("link", {
            name: /orders/i,
        });

        expect(orderLinks.length).toBeGreaterThan(0);

        const wishlistLinks = screen.getAllByRole("link", {
            name: /wishlist/i,
        });

        expect(wishlistLinks.length).toBeGreaterThan(0);

        const cartLinks = screen.getAllByRole("link", {
            name: /cart/i,
        });

        expect(cartLinks.length).toBeGreaterThan(0);

        expect(
            screen.getByText("My Delivery")
        ).toBeInTheDocument();
    });

    // ======================================================
    // EDIT PROFILE
    // ======================================================

    test("navigates to settings when Edit Profile is clicked", () => {
        render(<Account />);

        const editButton = screen.getByRole("button", {
            name: /edit profile/i,
        });

        fireEvent.click(editButton);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/settings"
        );
    });

    // ======================================================
    // EMPTY RECENT ACTIVITY
    // ======================================================

    test("shows no recent orders when orders are empty", () => {
        render(<Account />);

        expect(
            screen.getByText("No recent orders")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Once you place an order, you can see it here."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: /start shopping/i,
            })
        ).toHaveAttribute("href", "/shop");
    });

    // ======================================================
    // RECENT ORDER
    // ======================================================

    test("shows recent order activity when orders exist", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([{ id: 1 }])
        );

        render(<Account />);

        await waitFor(() => {
            expect(
                screen.getByText("Recent Order")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                "Your latest order is available here."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: /view order/i,
            })
        ).toHaveAttribute("href", "/orders");
    });

    // ======================================================
    // VIEW ALL ORDERS
    // ======================================================

    test("renders View All orders link", () => {
        render(<Account />);

        const viewAll = screen.getByRole("link", {
            name: /view all/i,
        });

        expect(viewAll).toHaveAttribute(
            "href",
            "/orders"
        );
    });

    // ======================================================
    // SUPPORT SECTION
    // ======================================================

    test("renders support section", () => {
        render(<Account />);

        expect(
            screen.getByText("Need Help?")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Our MEDIKART support team is here to help you."
            )
        ).toBeInTheDocument();

        const supportLink = screen.getByRole("link", {
            name: /contact support/i,
        });

        expect(supportLink).toHaveAttribute(
            "href",
            "/help"
        );
    });

    // ======================================================
    // LOGOUT
    // ======================================================

    test("removes login status and navigates to login", () => {
        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        render(<Account />);

        const logoutButton = screen.getByRole("button", {
            name: /logout/i,
        });

        fireEvent.click(logoutButton);

        expect(
            localStorage.getItem("isLoggedIn")
        ).toBeNull();

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    // ======================================================
    // CART UPDATED EVENT
    // ======================================================

    test("updates cart count when cartUpdated event is dispatched", async () => {
        render(<Account />);

        expect(
            screen.getByText("Cart Items")
        ).toBeInTheDocument();

        localStorage.setItem(
            "cart",
            JSON.stringify([
                { id: 1 },
                { id: 2 },
            ])
        );

        window.dispatchEvent(
            new Event("cartUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getAllByText("2").length
            ).toBeGreaterThan(0);
        });
    });

    // ======================================================
    // WISHLIST UPDATED EVENT
    // ======================================================

    test("updates wishlist count when wishlistUpdated event is dispatched", async () => {
        render(<Account />);

        localStorage.setItem(
            "wishlist",
            JSON.stringify([
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ])
        );

        window.dispatchEvent(
            new Event("wishlistUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getAllByText("3").length
            ).toBeGreaterThan(0);
        });
    });

    // ======================================================
    // STORAGE EVENT
    // ======================================================

    test("updates account data when storage event is dispatched", async () => {
        render(<Account />);

        localStorage.setItem(
            "orders",
            JSON.stringify([
                { id: 1 },
                { id: 2 },
            ])
        );

        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "orders",
            })
        );

        await waitFor(() => {
            expect(
                screen.getAllByText("2").length
            ).toBeGreaterThan(0);
        });
    });

    // ======================================================
    // USER FALLBACK VALUES
    // ======================================================

    test("uses fallback values when user data is incomplete", async () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "",
                email: "",
            })
        );

        render(<Account />);

        await waitFor(() => {
            expect(
                screen.getByText("MEDIKART User")
            ).toBeInTheDocument();

            expect(
                screen.getByText("user@example.com")
            ).toBeInTheDocument();
        });
    });

    // ======================================================
    // INVALID STORAGE DATA
    // ======================================================

    test("handles invalid localStorage data without crashing", () => {
        localStorage.setItem(
            "user",
            "invalid-json"
        );

        localStorage.setItem(
            "cart",
            "invalid-json"
        );

        localStorage.setItem(
            "wishlist",
            "invalid-json"
        );

        localStorage.setItem(
            "orders",
            "invalid-json"
        );

        expect(() => {
            render(<Account />);
        }).not.toThrow();
    });

    // ======================================================
    // COUNT BAD DATA
    // ======================================================

    test("uses zero count when stored cart data is not an array", async () => {
        localStorage.setItem(
            "cart",
            JSON.stringify({
                invalid: true,
            })
        );

        localStorage.setItem(
            "wishlist",
            JSON.stringify({
                invalid: true,
            })
        );

        localStorage.setItem(
            "orders",
            JSON.stringify({
                invalid: true,
            })
        );

        render(<Account />);

        await waitFor(() => {
            expect(
                screen.getByText("No recent orders")
            ).toBeInTheDocument();
        });
    });

    // ======================================================
    // CLEANUP EVENT LISTENERS
    // ======================================================

    test("removes event listeners when component unmounts", () => {
        const removeEventListenerSpy = jest.spyOn(
            window,
            "removeEventListener"
        );

        const { unmount } = render(
            <Account />
        );

        unmount();

        expect(
            removeEventListenerSpy
        ).toHaveBeenCalledWith(
            "storage",
            expect.any(Function)
        );

        expect(
            removeEventListenerSpy
        ).toHaveBeenCalledWith(
            "cartUpdated",
            expect.any(Function)
        );

        expect(
            removeEventListenerSpy
        ).toHaveBeenCalledWith(
            "wishlistUpdated",
            expect.any(Function)
        );

        removeEventListenerSpy.mockRestore();
    });
});