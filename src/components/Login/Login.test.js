
import React from "react";

import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";

import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
} from "../../api/loginApi";

// MOCK LOGIN API
jest.mock("../../api/loginApi", () => ({
    getCurrentUser: jest.fn(),
    loginUser: jest.fn(),
    logoutUser: jest.fn(),
}));

// MOCK NAVIGATION
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// MOCK ALERT
beforeAll(() => {
    jest.spyOn(window, "alert").mockImplementation(() => { });
});

// RENDER COMPONENT
const renderLogin = (props = {}) => {
    return render(
        <MemoryRouter>
            <Login {...props} />
        </MemoryRouter>
    );
};

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        localStorage.clear();

        loginUser.mockResolvedValue({
            access_token: "mock-access-token",
        });

        getCurrentUser.mockResolvedValue({
            username: "testuser",
            email: "test@example.com",
        });

        logoutUser.mockImplementation(() => { });
    });

    afterEach(() => {
        cleanup();
    });

    afterAll(() => {
        window.alert.mockRestore();
    });

    // 1. RENDER LOGIN
    test("renders login component", () => {
        renderLogin();

        expect(
            screen.getByRole("heading", { name: "Login" })
        ).toBeInTheDocument();
    });

    // 2. DISPLAY LOGO
    test("displays MEDIKART logo", () => {
        renderLogin();

        expect(screen.getByText("MEDI")).toBeInTheDocument();
        expect(screen.getByText("KART")).toBeInTheDocument();
    });

    // 3. DISPLAY EMAIL INPUT
    test("displays email input field", () => {
        renderLogin();

        expect(
            screen.getByRole("textbox", {
                name: /email or username/i,
            })
        ).toBeInTheDocument();
    });

    // 4. DISPLAY PASSWORD INPUT
    test("displays password input field", () => {
        renderLogin();

        expect(
            screen.getByLabelText("Password")
        ).toHaveAttribute("type", "password");
    });

    // 5. DISPLAY LOGIN BUTTON
    test("displays login button", () => {
        renderLogin();

        expect(
            screen.getByRole("button", { name: "Login" })
        ).toBeInTheDocument();
    });

    // 6. DISPLAY REMEMBER ME
    test("displays remember me checkbox", () => {
        renderLogin();

        expect(
            screen.getByRole("checkbox", {
                name: /remember me/i,
            })
        ).toBeInTheDocument();
    });

    // 7. DISPLAY FORGOT PASSWORD
    test("displays forgot password button", () => {
        renderLogin();

        expect(
            screen.getByRole("button", {
                name: /forgot password/i,
            })
        ).toBeInTheDocument();
    });

    // 8. DISPLAY REGISTER OPTION
    test("displays create account button", () => {
        renderLogin();

        expect(
            screen.getByRole("button", {
                name: /create account/i,
            })
        ).toBeInTheDocument();
    });

    // 9. ENTER EMAIL
    test("allows entering email", () => {
        renderLogin();

        const emailInput = screen.getByRole("textbox", {
            name: /email or username/i,
        });

        fireEvent.change(emailInput, {
            target: { value: "test@example.com" },
        });

        expect(emailInput).toHaveValue("test@example.com");
    });

    // 10. ENTER PASSWORD
    test("allows entering password", () => {
        renderLogin();

        const passwordInput = screen.getByLabelText("Password");

        fireEvent.change(passwordInput, {
            target: { value: "testpassword" },
        });

        expect(passwordInput).toHaveValue("testpassword");
    });

    // 11. SHOW PASSWORD
    test("shows password when eye button is clicked", () => {
        renderLogin();

        const passwordInput = screen.getByLabelText("Password");

        fireEvent.click(
            screen.getByRole("button", {
                name: /show password/i,
            })
        );

        expect(passwordInput).toHaveAttribute("type", "text");
    });

    // 12. HIDE PASSWORD
    test("hides password when hide button is clicked", () => {
        renderLogin();

        const passwordInput = screen.getByLabelText("Password");

        fireEvent.click(
            screen.getByRole("button", {
                name: /show password/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /hide password/i,
            })
        );

        expect(passwordInput).toHaveAttribute("type", "password");
    });

    // 13. REMEMBER ME
    test("allows selecting remember me", () => {
        renderLogin();

        const checkbox = screen.getByRole("checkbox", {
            name: /remember me/i,
        });

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });

    // 14. EMPTY FORM VALIDATION
    test("shows alert when email and password are empty", () => {
        renderLogin();

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        expect(window.alert).toHaveBeenCalledWith(
            "Please enter email/username and password."
        );

        expect(loginUser).not.toHaveBeenCalled();
    });

    // 15. LOGIN WITH EMAIL
    test("calls login API with entered credentials", async () => {
        renderLogin();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /email or username/i,
            }),
            {
                target: { value: "TEST@EXAMPLE.COM" },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: { value: "testpassword" },
            }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        await waitFor(() => {
            expect(loginUser).toHaveBeenCalledWith(
                "test@example.com",
                "testpassword"
            );
        });
    });

    // 16. FETCH CURRENT USER
    test("fetches current user after successful login", async () => {
        renderLogin();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /email or username/i,
            }),
            {
                target: { value: "test@example.com" },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: { value: "testpassword" },
            }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        await waitFor(() => {
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
        });
    });

    // 17. SAVE LOGIN TOKEN
    test("stores access token after successful login", async () => {
        renderLogin();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /email or username/i,
            }),
            {
                target: { value: "test@example.com" },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: { value: "testpassword" },
            }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        await waitFor(() => {
            expect(localStorage.getItem("access_token")).toBe(
                "mock-access-token"
            );
        });
    });

    // 18. SUCCESS MESSAGE
    test("displays login successful alert", async () => {
        renderLogin();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /email or username/i,
            }),
            {
                target: { value: "test@example.com" },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: { value: "testpassword" },
            }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Login successful!"
            );
        });
    });

    // 19. REMEMBER ME STORAGE
    test("stores remember me preference", async () => {
        renderLogin();

        fireEvent.click(
            screen.getByRole("checkbox", {
                name: /remember me/i,
            })
        );

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /email or username/i,
            }),
            {
                target: { value: "test@example.com" },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: { value: "testpassword" },
            }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        await waitFor(() => {
            expect(localStorage.getItem("rememberMe")).toBe("true");
        });
    });

    // 20. LOGIN FAILURE
    test("handles login API failure", async () => {
        loginUser.mockRejectedValueOnce(
            new Error("Invalid credentials")
        );

        renderLogin();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /email or username/i,
            }),
            {
                target: { value: "test@example.com" },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: { value: "wrongpassword" },
            }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Login" })
        );

        await waitFor(() => {
            expect(logoutUser).toHaveBeenCalled();

            expect(window.alert).toHaveBeenCalledWith(
                "Invalid credentials"
            );
        });
    });

    // 21. CLOSE LOGIN
    test("calls onClose when close button is clicked", () => {
        const onClose = jest.fn();

        renderLogin({ onClose });

        fireEvent.click(
            screen.getByRole("button", {
                name: /close login/i,
            })
        );

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    // 22. SWITCH TO REGISTER
    test("calls register callback", () => {
        const onSwitchToRegister = jest.fn();

        renderLogin({ onSwitchToRegister });

        fireEvent.click(
            screen.getByRole("button", {
                name: /create account/i,
            })
        );

        expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
    });

    // 23. SWITCH TO FORGOT PASSWORD
    test("calls forgot password callback", () => {
        const onSwitchToForgotPassword = jest.fn();

        renderLogin({ onSwitchToForgotPassword });

        fireEvent.click(
            screen.getByRole("button", {
                name: /forgot password/i,
            })
        );

        expect(
            onSwitchToForgotPassword
        ).toHaveBeenCalledTimes(1);
    });

    // 24. NAVIGATE TO REGISTER
    test("navigates to register when callback is unavailable", () => {
        renderLogin();

        fireEvent.click(
            screen.getByRole("button", {
                name: /create account/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith("/register");
    });

    // 25. NAVIGATE TO FORGOT PASSWORD
    test("navigates to forgot password page", () => {
        renderLogin();

        fireEvent.click(
            screen.getByRole("button", {
                name: /forgot password/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/forgot-password"
        );
    });

    // 26. SOCIAL LOGIN BUTTONS
    test("displays social login buttons", () => {
        renderLogin();

        expect(
            screen.getByRole("button", {
                name: /google login/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /facebook login/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /apple login/i,
            })
        ).toBeInTheDocument();
    });

});
