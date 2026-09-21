import { render, screen, fireEvent } from "@testing-library/react";
import Newsletter from "./Newsletter";

describe("Newsletter Component", () => {
    test("renders newsletter title", () => { 
        render(<Newsletter />); 
        expect(screen.getByText("Subscribe to Our Newsletter")).toBeInTheDocument();
    });

    test("renders email input", () => {
        render(<Newsletter />);
        expect(screen.getByPlaceholderText("Enter your email address")).toBeInTheDocument();
    });

    test("renders subscribe button", () => {
        render(<Newsletter />);
        expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
    });

    test("shows error message when email is empty", () => {
        render(<Newsletter />);
        fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
        expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
    });

    test("shows error message for invalid email", () => {
        render(<Newsletter />);
        fireEvent.change(screen.getByPlaceholderText("Enter your email address"),
            {
                target: { value: "invalid-email" },
            });

        fireEvent.click(screen.getByRole("button", { name: /subscribe/i })
        );

        expect(screen.getByText("Please enter a valid email address.")
        ).toBeInTheDocument();
    });

    test("shows success message for valid email", () => {
        render(<Newsletter />);
        fireEvent.change(screen.getByPlaceholderText("Enter your email address"),
            {
                target: { value: "test@example.com" },
            });
        fireEvent.click(screen.getByRole("button", { name: /subscribe/i })
        );
        expect(screen.getByText("Thank you for subscribing! You'll receive our latest updates and offers.")).toBeInTheDocument();
    });

    test("clears input after successful submit", () => {
        render(<Newsletter />);
        const input = screen.getByPlaceholderText("Enter your email address");
        fireEvent.change(input, {
            target: { value: "test@example.com" },
        });

        fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
        expect(input.value).toBe("");
    });
});
