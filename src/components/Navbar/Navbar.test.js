import React from "react";
import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import Navbar from "./Navbar";

// ======================================================
// MOCK CHILD COMPONENTS
// ======================================================

jest.mock("./Logo", () => {
    return function Logo() {
        return (
            <div data-testid="logo">
                Logo
            </div>
        );
    };
});

jest.mock("./NavLinks", () => {
    return function NavLinks() {
        return (
            <div data-testid="nav-links">
                Navigation Links
            </div>
        );
    };
});

jest.mock("./SearchBar", () => {
    return function SearchBar() {
        return (
            <div data-testid="search-bar">
                Search Bar
            </div>
        );
    };
});

jest.mock("./UserActions", () => {
    return function UserActions({ onLoginClick }) {
        return (
            <div data-testid="user-actions">
                <button
                    type="button"
                    onClick={onLoginClick}
                >
                    Login
                </button>
            </div>
        );
    };
});

jest.mock("./MobileMenu", () => {
    return function MobileMenu() {
        return (
            <div data-testid="mobile-menu">
                Mobile Menu
            </div>
        );
    };
});

// ======================================================
// MOCK LOGIN
// ======================================================

jest.mock("../Login/Login", () => {
    return function Login({ onLoginSuccess }) {
        return (
            <div data-testid="login-component">
                <span>Login Component</span>

                <button
                    type="button"
                    onClick={onLoginSuccess}
                >
                    Complete Login
                </button>
            </div>
        );
    };
});


// ======================================================
// TEST SUITE
// ======================================================

describe("Navbar", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    // ==================================================
    // BASIC RENDERING
    // ==================================================

    test("renders Navbar", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".navbar")
        ).toBeInTheDocument();
    });


    test("renders Logo component", () => {
        render(<Navbar />);

        expect(
            screen.getByTestId("logo")
        ).toBeInTheDocument();
    });


    test("renders desktop navigation section", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".navbar-desktop")
        ).toBeInTheDocument();
    });


    test("renders mobile navigation section", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".navbar-mobile")
        ).toBeInTheDocument();
    });


    test("renders NavLinks component", () => {
        render(<Navbar />);

        expect(
            screen.getByTestId("nav-links")
        ).toBeInTheDocument();
    });


    test("renders SearchBar component", () => {
        render(<Navbar />);

        expect(
            screen.getAllByTestId("search-bar").length
        ).toBeGreaterThan(0);
    });


    test("renders UserActions component", () => {
        render(<Navbar />);

        expect(
            screen.getByTestId("user-actions")
        ).toBeInTheDocument();
    });


    test("renders MobileMenu component", () => {
        render(<Navbar />);

        expect(
            screen.getByTestId("mobile-menu")
        ).toBeInTheDocument();
    });


    // ==================================================
    // MOBILE SEARCH BUTTON
    // ==================================================

    test("renders mobile search button", () => {
        render(<Navbar />);

        expect(
            screen.getByRole("button", {
                name: "Search",
            })
        ).toBeInTheDocument();
    });


    test("mobile search button has correct aria-label", () => {
        render(<Navbar />);

        const searchButton =
            screen.getByRole("button", {
                name: "Search",
            });

        expect(searchButton).toHaveAttribute(
            "aria-label",
            "Search"
        );
    });


    test("mobile search popup is hidden initially", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".search-popup")
        ).not.toBeInTheDocument();
    });


    test("opens mobile search popup", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        expect(
            document.querySelector(".search-popup")
        ).toBeInTheDocument();
    });


    test("shows search overlay when mobile search opens", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        expect(
            document.querySelector(".search-overlay")
        ).toBeInTheDocument();
    });


    test("shows close search button", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        expect(
            document.querySelector(".close-search")
        ).toBeInTheDocument();
    });


    test("mobile search popup contains SearchBar", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        const popup =
            document.querySelector(".search-popup");

        expect(
            popup.querySelector(
                '[data-testid="search-bar"]'
            )
        ).toBeInTheDocument();
    });


    test("closes mobile search using close button", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        expect(
            document.querySelector(".search-popup")
        ).toBeInTheDocument();

        fireEvent.click(
            document.querySelector(".close-search")
        );

        expect(
            document.querySelector(".search-popup")
        ).not.toBeInTheDocument();
    });


    test("closes mobile search by clicking overlay", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        const overlay =
            document.querySelector(".search-overlay");

        expect(overlay).toBeInTheDocument();

        fireEvent.click(overlay);

        expect(
            document.querySelector(".search-popup")
        ).not.toBeInTheDocument();
    });


    // ==================================================
    // LOGIN POPUP
    // ==================================================

    test("login popup is hidden initially", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".popup-overlay")
        ).not.toBeInTheDocument();
    });


    test("opens login popup when Login is clicked", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            document.querySelector(".popup-overlay")
        ).toBeInTheDocument();
    });


    test("renders Login component inside popup", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            screen.getByTestId("login-component")
        ).toBeInTheDocument();
    });


    test("renders popup box after login click", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            document.querySelector(".popup-box")
        ).toBeInTheDocument();
    });


    test("renders close popup button", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            document.querySelector(".close-popup")
        ).toBeInTheDocument();
    });


    test("closes login popup using close button", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            document.querySelector(".popup-overlay")
        ).toBeInTheDocument();

        fireEvent.click(
            document.querySelector(".close-popup")
        );

        expect(
            document.querySelector(".popup-overlay")
        ).not.toBeInTheDocument();
    });


    test("closes login popup by clicking overlay", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        const overlay =
            document.querySelector(".popup-overlay");

        expect(overlay).toBeInTheDocument();

        fireEvent.click(overlay);

        expect(
            document.querySelector(".popup-overlay")
        ).not.toBeInTheDocument();
    });


    test("does not close login popup when clicking popup box", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        const popupBox =
            document.querySelector(".popup-box");

        fireEvent.click(popupBox);

        expect(
            document.querySelector(".popup-overlay")
        ).toBeInTheDocument();
    });


    // ==================================================
    // LOGIN CALLBACK
    // ==================================================

    test("closes login popup after successful login", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            document.querySelector(".popup-overlay")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Complete Login",
            })
        );

        expect(
            document.querySelector(".popup-overlay")
        ).not.toBeInTheDocument();
    });


    // ==================================================
    // CSS CLASS TESTS
    // ==================================================

    test("navbar has correct CSS class", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".navbar")
        ).toHaveClass("navbar");
    });


    test("desktop section has correct CSS class", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".navbar-desktop")
        ).toHaveClass("navbar-desktop");
    });


    test("mobile section has correct CSS class", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".navbar-mobile")
        ).toHaveClass("navbar-mobile");
    });


    test("search button has correct CSS class", () => {
        render(<Navbar />);

        expect(
            screen.getByRole("button", {
                name: "Search",
            })
        ).toHaveClass("search-btn-mobile");
    });


    // ==================================================
    // STATE INDEPENDENCE
    // ==================================================

    test("login and search are hidden on initial render", () => {
        render(<Navbar />);

        expect(
            document.querySelector(".popup-overlay")
        ).not.toBeInTheDocument();

        expect(
            document.querySelector(".search-popup")
        ).not.toBeInTheDocument();
    });


    test("can open search popup independently", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Search",
            })
        );

        expect(
            document.querySelector(".search-popup")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".popup-overlay")
        ).not.toBeInTheDocument();
    });


    test("can open login popup independently", () => {
        render(<Navbar />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            document.querySelector(".popup-overlay")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".search-popup")
        ).not.toBeInTheDocument();
    });
});