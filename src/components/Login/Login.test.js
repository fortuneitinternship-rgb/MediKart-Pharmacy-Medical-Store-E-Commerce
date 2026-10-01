import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Login from "./Login";

import {
    loginUser,
    getCurrentUser,
} from "../../api/authApi";


// ======================================================
// MOCK API
// ======================================================

jest.mock("../../api/authApi", () => ({
    loginUser: jest.fn(),
    getCurrentUser: jest.fn(),
}));


// ======================================================
// MOCK REACT ROUTER
// ======================================================

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));


// ======================================================
// MOCK IMAGE
// ======================================================

jest.mock("../../assets/Login.png", () => "login-image.png");


// ======================================================
// TEST SUITE
// ======================================================

describe("Login Component", () => {
    const mockOnClose = jest.fn();
    const mockOnLoginSuccess = jest.fn();
    const mockOnSwitchToRegister = jest.fn();
    const mockOnSwitchToForgotPassword = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        localStorage.clear();

        jest.spyOn(window, "alert").mockImplementation(() => {});

        loginUser.mockReset();
        getCurrentUser.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    // ==================================================
    // RENDERING TESTS
    // ==================================================

    test("renders login popup", () => {
        render(<Login />);

        expect(
            document.querySelector(".login-popup-overlay")
        ).toBeInTheDocument();
    });


    test("renders login popup container", () => {
        render(<Login />);

        expect(
            document.querySelector(".login-popup")
        ).toBeInTheDocument();
    });


    test("renders Login heading", () => {
        render(<Login />);

        expect(
            screen.getByRole("heading", {
                name: "Login",
            })
        ).toBeInTheDocument();
    });


    test("renders MEDIKART logo", () => {
        render(<Login />);

        expect(
            screen.getByText("MEDI")
        ).toBeInTheDocument();

        expect(
            screen.getByText("KART")
        ).toBeInTheDocument();
    });


    test("renders login subtitle", () => {
        render(<Login />);

        expect(
            screen.getByText(
                /Login to continue shopping with MEDIKART/i
            )
        ).toBeInTheDocument();
    });


    test("renders welcome text", () => {
        render(<Login />);

        expect(
            screen.getByText("Welcome to MEDIKART")
        ).toBeInTheDocument();
    });


    test("renders healthcare description", () => {
        render(<Login />);

        expect(
            screen.getByText(
                /Your trusted online healthcare/i
            )
        ).toBeInTheDocument();
    });


    // ==================================================
    // IMAGE TESTS
    // ==================================================

    test("renders login image", () => {
        render(<Login />);

        const image = screen.getByAltText(
            "MEDIKART Login"
        );

        expect(image).toBeInTheDocument();

        expect(image).toHaveAttribute(
            "src",
            "login-image.png"
        );
    });


    test("login image has correct CSS class", () => {
        render(<Login />);

        const image = screen.getByAltText(
            "MEDIKART Login"
        );

        expect(image).toHaveClass("auth-image");
    });


    // ==================================================
    // INPUT TESTS
    // ==================================================

    test("renders email or username input", () => {
        render(<Login />);

        expect(
            screen.getByRole("textbox", {
                name: "Email or Username",
            })
        ).toBeInTheDocument();
    });


    test("renders password input", () => {
        render(<Login />);

        expect(
            screen.getByLabelText("Password")
        ).toBeInTheDocument();
    });


    test("email input has correct autocomplete", () => {
        render(<Login />);

        const input = screen.getByRole("textbox", {
            name: "Email or Username",
        });

        expect(input).toHaveAttribute(
            "autocomplete",
            "username"
        );
    });


    test("password input has correct autocomplete", () => {
        render(<Login />);

        const input = screen.getByLabelText("Password");

        expect(input).toHaveAttribute(
            "autocomplete",
            "current-password"
        );
    });


    test("email input accepts text", () => {
        render(<Login />);

        const input = screen.getByRole("textbox", {
            name: "Email or Username",
        });

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        expect(input).toHaveValue(
            "test@example.com"
        );
    });


    test("password input accepts text", () => {
        render(<Login />);

        const input = screen.getByLabelText("Password");

        fireEvent.change(input, {
            target: {
                value: "test-password",
            },
        });

        expect(input).toHaveValue(
            "test-password"
        );
    });


    // ==================================================
    // PASSWORD VISIBILITY TESTS
    // ==================================================

    test("password is hidden initially", () => {
        render(<Login />);

        const passwordInput =
            screen.getByLabelText("Password");

        expect(passwordInput).toHaveAttribute(
            "type",
            "password"
        );
    });


    test("shows password when eye button is clicked", () => {
        render(<Login />);

        const passwordInput =
            screen.getByLabelText("Password");

        const showButton =
            screen.getByRole("button", {
                name: "Show password",
            });

        fireEvent.click(showButton);

        expect(passwordInput).toHaveAttribute(
            "type",
            "text"
        );
    });


    test("hides password again when eye button is clicked", () => {
        render(<Login />);

        const passwordInput =
            screen.getByLabelText("Password");

        const showButton =
            screen.getByRole("button", {
                name: "Show password",
            });

        fireEvent.click(showButton);

        expect(
            screen.getByRole("button", {
                name: "Hide password",
            })
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Hide password",
            })
        );

        expect(passwordInput).toHaveAttribute(
            "type",
            "password"
        );
    });


    // ==================================================
    // REMEMBER ME TESTS
    // ==================================================

    test("renders Remember me checkbox", () => {
        render(<Login />);

        expect(
            screen.getByRole("checkbox")
        ).toBeInTheDocument();
    });


    test("Remember me is unchecked initially", () => {
        render(<Login />);

        expect(
            screen.getByRole("checkbox")
        ).not.toBeChecked();
    });


    test("can select Remember me", () => {
        render(<Login />);

        const checkbox =
            screen.getByRole("checkbox");

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });


    test("can unselect Remember me", () => {
        render(<Login />);

        const checkbox =
            screen.getByRole("checkbox");

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();

        fireEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
    });


    // ==================================================
    // FORGOT PASSWORD TESTS
    // ==================================================

    test("renders Forgot Password button", () => {
        render(<Login />);

        expect(
            screen.getByRole("button", {
                name: "Forgot Password?",
            })
        ).toBeInTheDocument();
    });


    test("calls forgot password callback", () => {
        render(
            <Login
                onSwitchToForgotPassword={
                    mockOnSwitchToForgotPassword
                }
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Forgot Password?",
            })
        );

        expect(
            mockOnSwitchToForgotPassword
        ).toHaveBeenCalledTimes(1);
    });


    test("navigates to forgot password when callback is not provided", () => {
        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Forgot Password?",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/forgot-password"
        );
    });


    // ==================================================
    // REGISTER TESTS
    // ==================================================

    test("renders Create Account button", () => {
        render(<Login />);

        expect(
            screen.getByRole("button", {
                name: "Create Account",
            })
        ).toBeInTheDocument();
    });


    test("calls register callback", () => {
        render(
            <Login
                onSwitchToRegister={
                    mockOnSwitchToRegister
                }
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            mockOnSwitchToRegister
        ).toHaveBeenCalledTimes(1);
    });


    test("navigates to register when callback is not provided", () => {
        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/register"
        );
    });


    // ==================================================
    // CLOSE BUTTON TESTS
    // ==================================================

    test("renders close login button", () => {
        render(<Login />);

        expect(
            screen.getByRole("button", {
                name: "Close login",
            })
        ).toBeInTheDocument();
    });


    test("calls onClose when close button is clicked", () => {
        render(
            <Login
                onClose={mockOnClose}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close login",
            })
        );

        expect(
            mockOnClose
        ).toHaveBeenCalledTimes(1);
    });


    test("calls onLoginSuccess when onClose is not provided", () => {
        render(
            <Login
                onLoginSuccess={
                    mockOnLoginSuccess
                }
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close login",
            })
        );

        expect(
            mockOnLoginSuccess
        ).toHaveBeenCalledTimes(1);
    });


    test("navigates home when no close callback is provided", () => {
        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close login",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/"
        );
    });


    // ==================================================
    // OVERLAY TESTS
    // ==================================================

    test("closes when clicking outside popup", () => {
        render(
            <Login
                onClose={mockOnClose}
            />
        );

        const overlay =
            document.querySelector(
                ".login-popup-overlay"
            );

        fireEvent.mouseDown(overlay);

        expect(
            mockOnClose
        ).toHaveBeenCalledTimes(1);
    });


    test("does not close when clicking inside popup", () => {
        render(
            <Login
                onClose={mockOnClose}
            />
        );

        const popup =
            document.querySelector(".login-popup");

        fireEvent.mouseDown(popup);

        expect(
            mockOnClose
        ).not.toHaveBeenCalled();
    });


    // ==================================================
    // SOCIAL LOGIN TESTS
    // ==================================================

    test("renders Google login button", () => {
        render(<Login />);

        expect(
            screen.getByRole("button", {
                name: "Google login",
            })
        ).toBeInTheDocument();
    });


    test("renders Facebook login button", () => {
        render(<Login />);

        expect(
            screen.getByRole("button", {
                name: "Facebook login",
            })
        ).toBeInTheDocument();
    });


    test("renders Apple login button", () => {
        render(<Login />);

        expect(
            screen.getByRole("button", {
                name: "Apple login",
            })
        ).toBeInTheDocument();
    });


    test("social login buttons have correct titles", () => {
        render(<Login />);

        expect(
            screen.getByTitle("Google")
        ).toBeInTheDocument();

        expect(
            screen.getByTitle("Facebook")
        ).toBeInTheDocument();

        expect(
            screen.getByTitle("Apple")
        ).toBeInTheDocument();
    });


    // ==================================================
    // VALIDATION TESTS
    // ==================================================

    test("shows validation alert when fields are empty", async () => {
        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Please enter email/username and password."
            );
        });

        expect(loginUser).not.toHaveBeenCalled();
    });


    test("shows validation alert when email is empty", async () => {
        render(<Login />);

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Please enter email/username and password."
            );
        });

        expect(loginUser).not.toHaveBeenCalled();
    });


    test("shows validation alert when password is empty", async () => {
        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Please enter email/username and password."
            );
        });

        expect(loginUser).not.toHaveBeenCalled();
    });


    // ==================================================
    // SUCCESSFUL LOGIN TESTS
    // ==================================================

    test("calls loginUser with entered credentials", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(
            <Login
                onClose={mockOnClose}
            />
        );

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "TEST@EXAMPLE.COM",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(loginUser).toHaveBeenCalledWith(
                "test@example.com",
                "test-password"
            );
        });
    });


    test("stores access token after successful login", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("access_token")
            ).toBe("test-token");
        });
    });


    test("gets current user after successful login", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                getCurrentUser
            ).toHaveBeenCalledTimes(1);
        });
    });


    test("stores login state after successful login", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("isLoggedIn")
            ).toBe("true");
        });
    });


    test("stores generic user session data after login", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("user")
            ).toBeTruthy();
        });
    });


    test("shows successful login alert", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Login successful!"
            );
        });
    });


    test("calls onClose after successful login", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(
            <Login
                onClose={mockOnClose}
            />
        );

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                mockOnClose
            ).toHaveBeenCalled();
        });
    });


    // ==================================================
    // REMEMBER ME LOGIN TESTS
    // ==================================================

    test("stores rememberMe when Remember me is selected", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.click(
            screen.getByRole("checkbox")
        );

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("rememberMe")
            ).toBe("true");
        });
    });


    test("does not store rememberMe when checkbox is unchecked", async () => {
        loginUser.mockResolvedValue({
            access_token: "test-token",
        });

        getCurrentUser.mockResolvedValue({
            name: "Test User",
        });

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("rememberMe")
            ).toBeNull();
        });
    });


    // ==================================================
    // API ERROR TESTS
    // ==================================================

    test("shows API error message when login fails", async () => {
        loginUser.mockRejectedValue(
            new Error("Invalid login")
        );

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Invalid login"
            );
        });
    });


    test("removes access token when login fails", async () => {
        localStorage.setItem(
            "access_token",
            "old-token"
        );

        loginUser.mockRejectedValue(
            new Error("Invalid login")
        );

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("access_token")
            ).toBeNull();
        });
    });


    test("shows default error when API error has no message", async () => {
        loginUser.mockRejectedValue({});

        render(<Login />);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Email or Username",
            }),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Unable to login. Please try again."
            );
        });
    });


    // ==================================================
    // FORM TEST
    // ==================================================

    test("Login button is a submit button", () => {
        render(<Login />);

        const loginButton =
            screen.getByRole("button", {
                name: "Login",
            });

        expect(loginButton).toHaveAttribute(
            "type",
            "submit"
        );
    });


    test("password eye button is not a submit button", () => {
        render(<Login />);

        const eyeButton =
            screen.getByRole("button", {
                name: "Show password",
            });

        expect(eyeButton).toHaveAttribute(
            "type",
            "button"
        );
    });


    test("close button is not a submit button", () => {
        render(<Login />);

        const closeButton =
            screen.getByRole("button", {
                name: "Close login",
            });

        expect(closeButton).toHaveAttribute(
            "type",
            "button"
        );
    });
});