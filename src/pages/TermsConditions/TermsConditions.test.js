import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import TermsConditions from "./TermsConditions";

describe("TermsConditions Component", () => {

    // ---------------------------------------------------------
    // BASIC RENDERING
    // ---------------------------------------------------------

    test("renders Terms & Conditions page", () => {
        render(<TermsConditions />);

        expect(
            document.querySelector(".terms-container")
        ).toBeInTheDocument();
    });

    test("renders terms header", () => {
        render(<TermsConditions />);

        expect(
            document.querySelector(".terms-header")
        ).toBeInTheDocument();
    });

    test("renders Terms & Conditions heading", () => {
        render(<TermsConditions />);

        expect(
            screen.getByRole("heading", {
                name: "Terms & Conditions",
                level: 1,
            })
        ).toBeInTheDocument();
    });

    test("renders welcome paragraph", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /Welcome to/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // CONTENT CONTAINER
    // ---------------------------------------------------------

    test("renders terms content container", () => {
        render(<TermsConditions />);

        expect(
            document.querySelector(".terms-content")
        ).toBeInTheDocument();
    });

    test("renders all terms cards", () => {
        render(<TermsConditions />);

        const cards =
            document.querySelectorAll(".terms-card");

        expect(cards).toHaveLength(10);
    });

    // ---------------------------------------------------------
    // SECTION HEADINGS
    // ---------------------------------------------------------

    test("renders all terms section headings", () => {
        render(<TermsConditions />);

        const headings = [
            "1. Acceptance of Terms",
            "2. User Account",
            "3. Orders & Payments",
            "4. Shipping & Delivery",
            "5. Returns & Refunds",
            "6. Prohibited Activities",
            "7. Intellectual Property",
            "8. Limitation of Liability",
            "9. Changes to Terms",
            "10. Contact Us",
        ];

        headings.forEach((heading) => {
            expect(
                screen.getByRole("heading", {
                    name: heading,
                    level: 2,
                })
            ).toBeInTheDocument();
        });
    });

    // ---------------------------------------------------------
    // ACCEPTANCE OF TERMS
    // ---------------------------------------------------------

    test("renders Acceptance of Terms section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /By using MEDIKART, you confirm that you have read/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // USER ACCOUNT
    // ---------------------------------------------------------

    test("renders User Account section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /You are responsible for maintaining your account details/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Keep your login credentials secure/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /You must provide accurate information/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // ORDERS & PAYMENTS
    // ---------------------------------------------------------

    test("renders Orders & Payments section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /All orders are subject to product availability/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Prices may change without prior notice/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Payments must be completed before order processing/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // SHIPPING & DELIVERY
    // ---------------------------------------------------------

    test("renders Shipping & Delivery information", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /Delivery timelines depend on your location/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Delays caused by weather, logistics, or unforeseen events/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // RETURNS & REFUNDS
    // ---------------------------------------------------------

    test("renders Returns & Refunds section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /Products can be returned only if eligible/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Refunds are processed after successful verification/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Prescription medicines cannot be returned/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // PROHIBITED ACTIVITIES
    // ---------------------------------------------------------

    test("renders Prohibited Activities section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText("Misuse of the website.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Providing false information.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Attempting unauthorized access.")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Using the website for illegal activities."
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // INTELLECTUAL PROPERTY
    // ---------------------------------------------------------

    test("renders Intellectual Property section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /All content including logos, images, graphics, and text belongs/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // LIMITATION OF LIABILITY
    // ---------------------------------------------------------

    test("renders Limitation of Liability section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /shall not be liable for any indirect or incidental damages/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // CHANGES TO TERMS
    // ---------------------------------------------------------

    test("renders Changes to Terms section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /We reserve the right to update these Terms & Conditions/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Continued use of the website indicates acceptance/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // CONTACT SECTION
    // ---------------------------------------------------------

    test("renders Contact Us section", () => {
        render(<TermsConditions />);

        expect(
            screen.getByText(
                /Email:/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Phone:/i
            )
        ).toBeInTheDocument();
    });

    // ---------------------------------------------------------
    // LISTS
    // ---------------------------------------------------------

    test("renders unordered lists for applicable sections", () => {
        render(<TermsConditions />);

        const lists =
            document.querySelectorAll(
                ".terms-card ul"
            );

    });

    test("renders list items", () => {
        render(<TermsConditions />);

        const listItems =
            document.querySelectorAll(
                ".terms-card li"
            );

        expect(listItems.length).toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // PARAGRAPHS
    // ---------------------------------------------------------

    test("renders paragraphs inside terms cards", () => {
        render(<TermsConditions />);

        const paragraphs =
            document.querySelectorAll(
                ".terms-card p"
            );

        expect(paragraphs.length).toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // STRUCTURE
    // ---------------------------------------------------------

    test("each terms card contains a heading", () => {
        render(<TermsConditions />);

        const cards =
            document.querySelectorAll(
                ".terms-card"
            );

        cards.forEach((card) => {
            expect(
                card.querySelector("h2")
            ).toBeInTheDocument();
        });
    });

    test("terms page has correct main structure", () => {
        render(<TermsConditions />);

        expect(
            document.querySelector(".terms-container")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".terms-header")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".terms-content")
        ).toBeInTheDocument();

        expect(
            document.querySelectorAll(".terms-card")
        ).toHaveLength(10);
    });

    // ---------------------------------------------------------
    // HEADING COUNT
    // ---------------------------------------------------------

    test("renders one main heading and ten section headings", () => {
        render(<TermsConditions />);

        expect(
            screen.getAllByRole("heading", {
                level: 1,
            })
        ).toHaveLength(1);

        expect(
            screen.getAllByRole("heading", {
                level: 2,
            })
        ).toHaveLength(10);
    });

    // ---------------------------------------------------------
    // COMPONENT DOES NOT CRASH
    // ---------------------------------------------------------

    test("renders without crashing", () => {
        expect(() => {
            render(<TermsConditions />);
        }).not.toThrow();
    });
});