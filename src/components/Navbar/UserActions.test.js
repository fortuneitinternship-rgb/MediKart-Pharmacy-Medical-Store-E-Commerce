import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import UserActions from "./UserActions";

// ======================================================
// MOCK CSS MODULE
// ======================================================

jest.mock("./UserActions.module.css", () => ({
    UserActions: "UserActions",
    wishlistBtn: "wishlistBtn",
    cartBtn: "cartBtn",
    label: "label",
    badge: "badge",
    accountWrapper: "accountWrapper",
    accountBtn: "accountBtn",
    arrow: "arrow",
    accountDropdown: "accountDropdown",
    accountHeader: "accountHeader",
    profileIcon: "profileIcon",
    dropdownDivider: "dropdownDivider",
    dropdownItem: "dropdownItem",
    logoutBtn: "logoutBtn",
    overlay: "overlay",
    popup: "popup",
    closeBtn: "closeBtn",
}));

// ======================================================
// MOCK REACT ROUTER
// ======================================================

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    Link: ({ to, children, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
    useNavigate: () => mockNavigate,
}));

// ======================================================
// MOCK REACT ICONS
// ======================================================

jest.mock("react-icons/fa", () => ({
    FaHeart: () => (
        <span data-testid="heart-icon">HeartIcon</span>
    ),

    FaShoppingCart: () => (
        <span data-testid="shopping-cart-icon">
            ShoppingCartIcon
        </span>
    ),

    FaCog: () => (
        <span data-testid="cog-icon">CogIcon</span>
    ),

    FaTruck: () => (
        <span data-testid="truck-icon">TruckIcon</span>
    ),

    FaBoxOpen: () => (
        <span data-testid="box-open-icon">
            BoxOpenIcon
        </span>
    ),
}));

// ======================================================
// MOCK LOGIN
// ======================================================

jest.mock("../Login/Login", () => {
    return function MockLogin({
        onClose,
        onLoginSuccess,
        onSwitchToRegister,
        onSwitchToForgotPassword,
    }) {
        return (
            <div data-testid="login-component">
                <h2>Login Component</h2>

                <button onClick={onLoginSuccess}>
                    Login Success
                </button>

                <button onClick={onClose}>
                    Close Login
                </button>

                <button onClick={onSwitchToRegister}>
                    Switch To Register
                </button>

                <button onClick={onSwitchToForgotPassword}>
                    Switch To Forgot Password
                </button>
            </div>
        );
    };
});

// ======================================================
// MOCK REGISTER
// ======================================================

jest.mock("../Register/Register", () => {
    return function MockRegister({
        onClose,
        onSwitchToLogin,
    }) {
        return (
            <div data-testid="register-component">
                <h2>Register Component</h2>

                <button onClick={onClose}>
                    Close Register
                </button>

                <button onClick={onSwitchToLogin}>
                    Register To Login
                </button>
            </div>
        );
    };
});

// ======================================================
// MOCK FORGOT PASSWORD
// ======================================================

jest.mock("../ForgotPassword/ForgotPassword", () => {
    return function MockForgotPassword({
        onClose,
        onSwitchToLogin,
    }) {
        return (
            <div data-testid="forgot-password-component">
                <h2>Forgot Password Component</h2>

                <button onClick={onClose}>
                    Close Forgot Password
                </button>

                <button onClick={onSwitchToLogin}>
                    Forgot Password To Login
                </button>
            </div>
        );
    };
});

// ======================================================
// HELPER
// ======================================================

const renderUserActions = () => {
    return render(<UserActions />);
};

// ======================================================
// TEST SUITE
// ======================================================

describe("UserActions Component", () => {
    beforeEach(() => {
        localStorage.clear();

        jest.clearAllMocks();

        window.alert = jest.fn();
    });

    afterEach(() => {
        cleanup();
    });

    // ====================================================
    // BASIC RENDERING
    // ====================================================

    test("renders Wishlist", () => {
        renderUserActions();

        expect(
            screen.getByText("Wishlist")
        ).toBeInTheDocument();
    });

    test("renders Cart", () => {
        renderUserActions();

        expect(
            screen.getByText("Cart")
        ).toBeInTheDocument();
    });

    test("renders Login when no username exists", () => {
        renderUserActions();

        expect(
            screen.getByText("Login")
        ).toBeInTheDocument();
    });

    // ====================================================
    // WISHLIST LINK
    // ====================================================

    test("wishlist link points to wishlist page", () => {
        renderUserActions();

        const wishlistLink = screen.getByRole("link", {
            name: /wishlist/i,
        });

        expect(wishlistLink).toHaveAttribute(
            "href",
            "/wishlist"
        );
    });

    // ====================================================
    // CART LINK
    // ====================================================

    test("cart link points to cart page", () => {
        renderUserActions();

        const cartLink = screen.getByRole("link", {
            name: /^🛒\s*Cart$/i,
        });

        expect(cartLink).toHaveAttribute(
            "href",
            "/cart"
        );
    });

    // ====================================================
    // CART COUNT
    // ====================================================

    test("shows cart count from localStorage", () => {
        localStorage.setItem(
            "cart",
            JSON.stringify([{}, {}, {}])
        );

        renderUserActions();

        expect(
            screen.getByText("3")
        ).toBeInTheDocument();
    });

    test("shows correct cart count when cart contains items", () => {
        localStorage.setItem(
            "cart",
            JSON.stringify([{}, {}])
        );

        renderUserActions();

        expect(
            screen.getByText("2")
        ).toBeInTheDocument();
    });

    test("does not show cart badge when cart is empty", () => {
        localStorage.setItem(
            "cart",
            JSON.stringify([])
        );

        renderUserActions();

        expect(
            screen.queryByText("0")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // WISHLIST COUNT
    // ====================================================

    test("shows wishlist count from localStorage", () => {
        localStorage.setItem(
            "wishlist",
            JSON.stringify([{}, {}])
        );

        renderUserActions();

        expect(
            screen.getByText("2")
        ).toBeInTheDocument();
    });

    test("shows correct wishlist count", () => {
        localStorage.setItem(
            "wishlist",
            JSON.stringify([{}, {}, {}, {}])
        );

        renderUserActions();

        expect(
            screen.getByText("4")
        ).toBeInTheDocument();
    });

    test("does not show wishlist badge when wishlist is empty", () => {
        localStorage.setItem(
            "wishlist",
            JSON.stringify([])
        );

        renderUserActions();

        expect(
            screen.queryByText("0")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // USERNAME
    // ====================================================

    test("shows username from localStorage", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        expect(
            screen.getByText("Test User")
        ).toBeInTheDocument();
    });

    test("shows Login when username is removed", async () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        expect(
            screen.getByText("Test User")
        ).toBeInTheDocument();

        localStorage.removeItem("username");

        window.dispatchEvent(
            new Event("userUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getByText("Login")
            ).toBeInTheDocument();
        });
    });

    // ====================================================
    // LOGIN MODAL
    // ====================================================

    test("opens login modal when Login is clicked", () => {
        renderUserActions();

        const loginButton = screen.getByRole(
            "button",
            {
                name: /login/i,
            }
        );

        fireEvent.click(loginButton);

        expect(
            screen.getByTestId("login-component")
        ).toBeInTheDocument();
    });

    test("renders login component inside popup", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        expect(
            screen.getByText("Login Component")
        ).toBeInTheDocument();
    });

    test("closes login modal using close button", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "✕",
            })
        );

        expect(
            screen.queryByTestId("login-component")
        ).not.toBeInTheDocument();
    });

    test("closes login modal using Login onClose", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close Login",
            })
        );

        expect(
            screen.queryByTestId("login-component")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // LOGIN → REGISTER
    // ====================================================

    test("switches from Login to Register", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Switch To Register",
            })
        );

        expect(
            screen.getByTestId("register-component")
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId("login-component")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // REGISTER → LOGIN
    // ====================================================

    test("switches from Register to Login", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Switch To Register",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Register To Login",
            })
        );

        expect(
            screen.getByTestId("login-component")
        ).toBeInTheDocument();
    });

    test("closes Register modal", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Switch To Register",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close Register",
            })
        );

        expect(
            screen.queryByTestId("register-component")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // LOGIN → FORGOT PASSWORD
    // ====================================================

    test("switches from Login to Forgot Password", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Switch To Forgot Password",
            })
        );

        expect(
            screen.getByTestId(
                "forgot-password-component"
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId("login-component")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // FORGOT PASSWORD → LOGIN
    // ====================================================

    test("switches from Forgot Password to Login", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Switch To Forgot Password",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Forgot Password To Login",
            })
        );

        expect(
            screen.getByTestId("login-component")
        ).toBeInTheDocument();
    });

    test("closes Forgot Password modal", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Switch To Forgot Password",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close Forgot Password",
            })
        );

        expect(
            screen.queryByTestId(
                "forgot-password-component"
            )
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // LOGIN SUCCESS
    // ====================================================

    test("closes authentication modal after login success", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login Success",
            })
        );

        expect(
            screen.queryByTestId("login-component")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // ACCOUNT DROPDOWN
    // ====================================================

    test("opens account dropdown for logged-in user", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByText("My Orders")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Order History")
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
            screen.getByText("Settings")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Logout")
        ).toBeInTheDocument();
    });

    test("shows closed dropdown arrow initially", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        expect(
            screen.getByText("▼")
        ).toBeInTheDocument();
    });

    test("changes arrow when dropdown opens", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByText("▲")
        ).toBeInTheDocument();
    });

    test("closes dropdown when account button is clicked again", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        const accountButton =
            screen.getByRole("button", {
                name: /Test User/i,
            });

        fireEvent.click(accountButton);

        expect(
            screen.getByText("Logout")
        ).toBeInTheDocument();

        fireEvent.click(accountButton);

        expect(
            screen.queryByText("Logout")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // DROPDOWN LINKS
    // ====================================================

    test("My Account link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        const accountLinks =
            screen.getAllByRole("link");

        const accountLink = accountLinks.find(
            (link) =>
                link.getAttribute("href") === "/account"
        );

        expect(accountLink).toBeInTheDocument();
    });

    test("My Orders link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /My Orders/i,
            })
        ).toHaveAttribute(
            "href",
            "/orders"
        );
    });

    test("Order History link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /Order History/i,
            })
        ).toHaveAttribute(
            "href",
            "/order-history"
        );
    });

    test("Track Order link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /Track Order/i,
            })
        ).toHaveAttribute(
            "href",
            "/track-order"
        );
    });

    test("My Wishlist link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /My Wishlist/i,
            })
        ).toHaveAttribute(
            "href",
            "/wishlist"
        );
    });

    test("My Cart link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /My Cart/i,
            })
        ).toHaveAttribute(
            "href",
            "/cart"
        );
    });

    test("Settings link has correct path", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /Settings/i,
            })
        ).toHaveAttribute(
            "href",
            "/settings"
        );
    });

    // ====================================================
    // DROPDOWN CLOSE
    // ====================================================

    test("closes dropdown when My Orders is clicked", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        fireEvent.click(
            screen.getByRole("link", {
                name: /My Orders/i,
            })
        );

        expect(
            screen.queryByText("Logout")
        ).not.toBeInTheDocument();
    });

    test("closes dropdown when Settings is clicked", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        fireEvent.click(
            screen.getByRole("link", {
                name: /Settings/i,
            })
        );

        expect(
            screen.queryByText("Logout")
        ).not.toBeInTheDocument();
    });

    // ====================================================
    // LOGOUT
    // ====================================================

    test("removes username from localStorage on logout", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(
            localStorage.getItem("username")
        ).toBeNull();
    });

    test("removes isLoggedIn from localStorage on logout", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(
            localStorage.getItem("isLoggedIn")
        ).toBeNull();
    });

    test("clears username from UI after logout", async () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText("Login")
            ).toBeInTheDocument();
        });
    });

    test("navigates to home page after logout", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    // ====================================================
    // USER UPDATED EVENT
    // ====================================================

    test("updates username when userUpdated event occurs", async () => {
        renderUserActions();

        expect(
            screen.getByText("Login")
        ).toBeInTheDocument();

        localStorage.setItem(
            "username",
            "Test User"
        );

        window.dispatchEvent(
            new Event("userUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getByText("Test User")
            ).toBeInTheDocument();
        });
    });

    // ====================================================
    // CART UPDATED EVENT
    // ====================================================

    test("updates cart count when cartUpdated event occurs", async () => {
        renderUserActions();

        localStorage.setItem(
            "cart",
            JSON.stringify([{}, {}])
        );

        window.dispatchEvent(
            new Event("cartUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getByText("2")
            ).toBeInTheDocument();
        });
    });

    // ====================================================
    // WISHLIST UPDATED EVENT
    // ====================================================

    test("updates wishlist count when wishlistUpdated event occurs", async () => {
        renderUserActions();

        localStorage.setItem(
            "wishlist",
            JSON.stringify([{}, {}, {}])
        );

        window.dispatchEvent(
            new Event("wishlistUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getByText("3")
            ).toBeInTheDocument();
        });
    });

    // ====================================================
    // ICONS
    // ====================================================

    test("renders account dropdown icons", () => {
        localStorage.setItem(
            "username",
            "Test User"
        );

        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/i,
            })
        );

        expect(
            screen.getByTestId("heart-icon")
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("shopping-cart-icon")
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("cog-icon")
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("truck-icon")
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("box-open-icon")
        ).toBeInTheDocument();
    });

    // ====================================================
    // OVERLAY
    // ====================================================

    test("closes authentication popup when overlay is clicked", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        const overlay =
            document.querySelector(".overlay");

        expect(overlay).toBeInTheDocument();

        fireEvent.click(overlay);

        expect(
            screen.queryByTestId("login-component")
        ).not.toBeInTheDocument();
    });

    test("does not close popup when popup content is clicked", () => {
        renderUserActions();

        fireEvent.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        const popup =
            document.querySelector(".popup");

        expect(popup).toBeInTheDocument();

        fireEvent.click(popup);

        expect(
            screen.getByTestId("login-component")
        ).toBeInTheDocument();
    });

    // ====================================================
    // EVENT LISTENER CLEANUP
    // ====================================================

    test("removes event listeners on unmount", () => {
        const removeEventListenerSpy =
            jest.spyOn(
                window,
                "removeEventListener"
            );

        const { unmount } = renderUserActions();

        unmount();

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

        expect(
            removeEventListenerSpy
        ).toHaveBeenCalledWith(
            "userUpdated",
            expect.any(Function)
        );

        removeEventListenerSpy.mockRestore();
    });
});
