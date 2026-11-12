import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import { MemoryRouter } from "react-router-dom";
import MobileMenu from "./MobileMenu";

// Mock logo
jest.mock("../../assets/Medikart-logo.png", () => "Medikart-logo.png");

// Mock react-icons
jest.mock("react-icons/fa", () => ({
    FaHome: () => <span data-testid="home-icon">HomeIcon</span>,
    FaShoppingCart: () => (
        <span data-testid="cart-icon">CartIcon</span>
    ),
    FaThLarge: () => (
        <span data-testid="categories-icon">CategoriesIcon</span>
    ),
    FaHeart: () => (
        <span data-testid="heart-icon">HeartIcon</span>
    ),
    FaInfoCircle: () => (
        <span data-testid="info-icon">InfoIcon</span>
    ),
    FaPhone: () => (
        <span data-testid="phone-icon">PhoneIcon</span>
    ),
    FaUser: () => (
        <span data-testid="user-icon">UserIcon</span>
    ),
    FaUserCircle: () => (
        <span data-testid="user-circle-icon">UserCircleIcon</span>
    ),
    FaBox: () => (
        <span data-testid="box-icon">BoxIcon</span>
    ),
    FaMapMarkerAlt: () => (
        <span data-testid="map-icon">MapIcon</span>
    ),
    FaSignOutAlt: () => (
        <span data-testid="logout-icon">LogoutIcon</span>
    ),
    FaSignInAlt: () => (
        <span data-testid="login-icon">LoginIcon</span>
    ),
    FaBars: () => (
        <span data-testid="bars-icon">BarsIcon</span>
    ),
    FaTimes: () => (
        <span data-testid="times-icon">TimesIcon</span>
    ),
    FaChevronDown: () => (
        <span data-testid="chevron-icon">ChevronIcon</span>
    ),
    FaCog: () => (
        <span data-testid="settings-icon">SettingsIcon</span>
    ),
    FaQuestionCircle: () => (
        <span data-testid="question-icon">QuestionIcon</span>
    ),
}));

const renderMobileMenu = () => {
    return render(
        <MemoryRouter>
            <MobileMenu />
        </MemoryRouter>
    );
};

describe("MobileMenu Component", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();

        window.history.pushState({}, "", "/");
    });

    afterEach(() => {
        document.body.style.overflow = "";
    });

    test("renders hamburger menu button", () => {
        renderMobileMenu();

        expect(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("bars-icon")
        ).toBeInTheDocument();
    });

    test("renders MEDIKART logo and branding", () => {
        renderMobileMenu();

        expect(
            screen.getByAltText("Medikart Logo")
        ).toBeInTheDocument();

        expect(
            screen.getByText("MEDIKART")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Your Health Partner")
        ).toBeInTheDocument();
    });

    test("menu is closed initially", () => {
        renderMobileMenu();

        expect(
            screen.queryByRole("button", {
                name: "Close menu",
            })
        ).toBeInTheDocument();

        const sidebar = document.querySelector(
            ".mobile-sidebar"
        );

        expect(sidebar).not.toHaveClass(
            "mobile-sidebar-open"
        );
    });

    test("opens sidebar when hamburger button is clicked", () => {
        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        );

        const sidebar = document.querySelector(
            ".mobile-sidebar"
        );

        expect(sidebar).toHaveClass(
            "mobile-sidebar-open"
        );

        expect(
            screen.getByRole("button", {
                name: "Close menu",
            })
        ).toBeInTheDocument();
    });

    test("prevents body scrolling when menu is open", () => {
        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        );

        expect(document.body.style.overflow).toBe(
            "hidden"
        );
    });

    test("restores body scrolling when menu is closed", () => {
        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        );

        expect(document.body.style.overflow).toBe(
            "hidden"
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close menu",
            })
        );

        expect(document.body.style.overflow).toBe("");
    });

    test("closes menu when overlay is clicked", () => {
        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        );

        const overlay = document.querySelector(
            ".mobile-menu-overlay"
        );

        expect(overlay).toBeInTheDocument();

        fireEvent.click(overlay);

        const sidebar = document.querySelector(
            ".mobile-sidebar"
        );

        expect(sidebar).not.toHaveClass(
            "mobile-sidebar-open"
        );
    });

    test("renders all main menu items", () => {
        renderMobileMenu();

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Shop")).toBeInTheDocument();
        expect(
            screen.getByText("Categories")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Wishlist")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Settings")
        ).toBeInTheDocument();
        expect(screen.getByText("Cart")).toBeInTheDocument();
        expect(
            screen.getByText("About Us")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Contact Us")
        ).toBeInTheDocument();
    });

    test("renders MENU heading", () => {
        renderMobileMenu();

        expect(
            screen.getByText("MENU")
        ).toBeInTheDocument();
    });

    test("renders help section", () => {
        renderMobileMenu();

        expect(
            screen.getByText("Need Help?")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Contact MEDIKART Support"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("question-icon")
        ).toBeInTheDocument();
    });

    test("shows login card when user is not logged in", () => {
        renderMobileMenu();

        expect(
            screen.getByText("Welcome to MEDIKART")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Login to view your account"
            )
        ).toBeInTheDocument();
    });

    test("shows bottom Login button when user is not logged in", () => {
        renderMobileMenu();

        const loginButtons = screen.getAllByRole(
            "button",
            {
                name: /Login/,
            }
        );

        expect(loginButtons.length).toBeGreaterThanOrEqual(
            1
        );
    });

    test("navigates to login from login card", () => {
        renderMobileMenu();

        const loginButtons = screen.getAllByRole(
            "button",
            {
                name: /Login/,
            }
        );

        fireEvent.click(loginButtons[0]);

        expect(
            document.querySelector(".mobile-sidebar")
        ).not.toHaveClass("mobile-sidebar-open");
    });

    test("renders logged-in user section", () => {
        const user = {
            name: "Test User",
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        renderMobileMenu();

        expect(
            screen.getByText("Hello,")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Test User")
        ).toBeInTheDocument();
    });

    test("uses username when name is unavailable", () => {
        const user = {
            username: "TestUser",
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        renderMobileMenu();

        expect(
            screen.getByText("TestUser")
        ).toBeInTheDocument();
    });

    test("uses User fallback when name and username are unavailable", () => {
        const user = {};

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        renderMobileMenu();

        expect(
            screen.getByText("User")
        ).toBeInTheDocument();
    });

    test("renders default user icon when photo and image are unavailable", () => {
        const user = {
            name: "Test User",
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        renderMobileMenu();

        expect(
            screen.getByTestId("user-icon")
        ).toBeInTheDocument();
    });

    test("renders profile image when user photo exists", () => {
        const user = {
            name: "Test User",
            photo: "profile.jpg",
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        renderMobileMenu();

        const image = screen.getByAltText("Profile");

        expect(image).toBeInTheDocument();

        expect(image).toHaveAttribute(
            "src",
            "profile.jpg"
        );
    });

    test("renders profile image when user image exists", () => {
        const user = {
            name: "Test User",
            image: "user-image.jpg",
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        renderMobileMenu();

        const image = screen.getByAltText("Profile");

        expect(image).toHaveAttribute(
            "src",
            "user-image.jpg"
        );
    });

    test("opens account dropdown when user button is clicked", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        const userButton = screen.getByRole(
            "button",
            {
                name: /Test User/,
            }
        );

        fireEvent.click(userButton);

        expect(
            screen.getByText("My Profile")
        ).toBeInTheDocument();

        expect(
            screen.getByText("My Orders")
        ).toBeInTheDocument();
    });

    test("closes account dropdown when user button is clicked again", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        const userButton = screen.getByRole(
            "button",
            {
                name: /Test User/,
            }
        );

        fireEvent.click(userButton);

        expect(
            screen.getByText("My Profile")
        ).toBeInTheDocument();

        fireEvent.click(userButton);

        expect(
            screen.queryByText("My Profile")
        ).not.toBeInTheDocument();
    });

    test("renders quick links for logged-in user", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();
    });

    test("does not render quick links for logged-out user", () => {
        renderMobileMenu();

        const quickLinks = document.querySelector(
            ".mobile-quick-links"
        );

        expect(quickLinks).not.toBeInTheDocument();
    });

    test("renders Logout button for logged-in user", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        expect(
            screen.getByRole("button", {
                name: /Logout/,
            })
        ).toBeInTheDocument();
    });

    test("logs out the user", async () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/,
            })
        );

        expect(
            localStorage.getItem("user")
        ).toBeNull();

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Welcome to MEDIKART"
                )
            ).toBeInTheDocument();
        });
    });

    test("dispatches userUpdated event on logout", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        const dispatchSpy = jest.spyOn(
            window,
            "dispatchEvent"
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Logout/,
            })
        );

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "userUpdated",
            })
        );

        dispatchSpy.mockRestore();
    });

    test("updates user when userUpdated event is dispatched", async () => {
        renderMobileMenu();

        expect(
            screen.getByText(
                "Welcome to MEDIKART"
            )
        ).toBeInTheDocument();

        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Updated User",
            })
        );

        window.dispatchEvent(
            new Event("userUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getByText("Updated User")
            ).toBeInTheDocument();
        });
    });

    test("removes user information when userUpdated event is dispatched after logout", async () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        expect(
            screen.getByText("Test User")
        ).toBeInTheDocument();

        localStorage.removeItem("user");

        window.dispatchEvent(
            new Event("userUpdated")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Welcome to MEDIKART"
                )
            ).toBeInTheDocument();
        });
    });

    test("handles invalid user JSON in localStorage", () => {
        localStorage.setItem(
            "user",
            "invalid-json"
        );

        renderMobileMenu();

        expect(
            screen.getByText(
                "Welcome to MEDIKART"
            )
        ).toBeInTheDocument();
    });

    test("closes account dropdown when close menu is clicked", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/,
            })
        );

        expect(
            screen.getByText("My Profile")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close menu",
            })
        );

        expect(
            screen.queryByText("My Profile")
        ).not.toBeInTheDocument();
    });

    test("main menu links have correct destinations", () => {
        renderMobileMenu();

        expect(
            screen.getByText("Home").closest("a")
        ).toHaveAttribute("href", "/");

        expect(
            screen.getByText("Shop").closest("a")
        ).toHaveAttribute("href", "/shop");

        expect(
            screen.getByText("Categories").closest("a")
        ).toHaveAttribute(
            "href",
            "/categories"
        );

        expect(
            screen.getByText("Wishlist").closest("a")
        ).toHaveAttribute(
            "href",
            "/wishlist"
        );

        expect(
            screen.getByText("Settings").closest("a")
        ).toHaveAttribute(
            "href",
            "/settings"
        );

        expect(
            screen.getByText("Cart").closest("a")
        ).toHaveAttribute("href", "/cart");

        expect(
            screen.getByText("About Us").closest("a")
        ).toHaveAttribute("href", "/about");

        expect(
            screen.getByText("Contact Us").closest("a")
        ).toHaveAttribute(
            "href",
            "/contact"
        );
    });

    test("main menu closes when a navigation link is clicked", () => {
        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        );

        const shopLink = screen.getByText("Shop");

        fireEvent.click(shopLink);

        const sidebar = document.querySelector(
            ".mobile-sidebar"
        );

        expect(sidebar).not.toHaveClass(
            "mobile-sidebar-open"
        );
    });

    test("My Profile button exists in account dropdown", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/,
            })
        );

        expect(
            screen.getByText("My Profile")
        ).toBeInTheDocument();
    });

    test("My Orders button exists in account dropdown", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/,
            })
        );

        expect(
            screen.getByText("My Orders")
        ).toBeInTheDocument();
    });

    test("My Wishlist button exists in account dropdown", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/,
            })
        );

        expect(
            screen.getByText("My Wishlist")
        ).toBeInTheDocument();
    });

    test("Saved Addresses button exists in account dropdown", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/,
            })
        );

        expect(
            screen.getByText("Saved Addresses")
        ).toBeInTheDocument();
    });

    test("Settings button exists in account dropdown", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                name: "Test User",
            })
        );

        renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Test User/,
            })
        );
    });

    test("component cleans up userUpdated event listener", () => {
        const removeEventListenerSpy =
            jest.spyOn(
                window,
                "removeEventListener"
            );

        const { unmount } = renderMobileMenu();

        unmount();

        expect(
            removeEventListenerSpy
        ).toHaveBeenCalledWith(
            "userUpdated",
            expect.any(Function)
        );

        removeEventListenerSpy.mockRestore();
    });

    test("cleans body overflow on unmount", () => {
        const { unmount } = renderMobileMenu();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open mobile menu",
            })
        );

        expect(document.body.style.overflow).toBe(
            "hidden"
        );

        unmount();

        expect(document.body.style.overflow).toBe("");
    });
});
