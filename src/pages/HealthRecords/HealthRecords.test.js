import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import HealthRecords from "./HealthRecords";

describe("HealthRecords Component", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    // ======================================================
    // RENDERING
    // ======================================================

    test("renders Health Records heading", () => {
        render(<HealthRecords />);

        expect(
            screen.getByRole("heading", {
                name: "Health Records",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // ADD RECORD BUTTON
    // ======================================================

    test("renders Add Record button", () => {
        render(<HealthRecords />);

        expect(
            screen.getByRole("button", {
                name: /add record/i,
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // HEALTH RECORDS
    // ======================================================

    test("renders all health records", () => {
        render(<HealthRecords />);

        expect(
            screen.getByRole("heading", {
                name: "Blood Test",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Eye Checkup",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Diabetes Check",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // HOSPITAL DETAILS
    // ======================================================

    test("renders hospital details", () => {
        render(<HealthRecords />);

        expect(
            screen.getByText("Apollo Hospital")
        ).toBeInTheDocument();

        expect(
            screen.getByText("AIIMS")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Fortis Hospital")
        ).toBeInTheDocument();
    });

    // ======================================================
    // DOCTOR DETAILS
    // ======================================================

    test("renders doctor details", () => {
        render(<HealthRecords />);

        expect(
            screen.getByText("Dr. Sharma")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Dr. Verma")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Dr. Singh")
        ).toBeInTheDocument();
    });

    // ======================================================
    // DATE DETAILS
    // ======================================================

    test("renders record dates", () => {
        render(<HealthRecords />);

        expect(
            screen.getByText("05 Aug 2026")
        ).toBeInTheDocument();

        expect(
            screen.getByText("18 Jul 2026")
        ).toBeInTheDocument();

        expect(
            screen.getByText("12 Jun 2026")
        ).toBeInTheDocument();
    });

    // ======================================================
    // COMPLETED STATUS
    // ======================================================

    test("renders completed status correctly", () => {
        render(<HealthRecords />);

        const completed =
            screen.getAllByText("Completed");

        expect(completed).toHaveLength(2);

        completed.forEach((element) => {
            expect(element).toHaveClass("status");
            expect(element).toHaveClass("completed");
        });
    });

    // ======================================================
    // PENDING STATUS
    // ======================================================

    test("renders pending status correctly", () => {
        render(<HealthRecords />);

        const pending =
            screen.getByText("Pending");

        expect(pending).toBeInTheDocument();

        expect(pending).toHaveClass("status");
        expect(pending).toHaveClass("pending");
    });

    // ======================================================
    // DELETE BUTTONS
    // ======================================================

    test("renders three delete buttons", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        expect(deleteButtons).toHaveLength(3);
    });

    // ======================================================
    // DELETE FIRST RECORD
    // ======================================================

    test("deletes the first health record", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.queryByRole("heading", {
                name: "Blood Test",
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Eye Checkup",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Diabetes Check",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // DELETE SECOND RECORD
    // ======================================================

    test("deletes the second health record", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[1]);

        expect(
            screen.queryByRole("heading", {
                name: "Eye Checkup",
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Blood Test",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Diabetes Check",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // DELETE THIRD RECORD
    // ======================================================

    test("deletes the third health record", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[2]);

        expect(
            screen.queryByRole("heading", {
                name: "Diabetes Check",
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Blood Test",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Eye Checkup",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // LOCAL STORAGE
    // ======================================================

    test("stores updated records in localStorage after deletion", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        const storedRecords = JSON.parse(
            localStorage.getItem("healthRecords")
        );

        expect(storedRecords).toHaveLength(2);

        expect(storedRecords[0].title).toBe(
            "Eye Checkup"
        );

        expect(storedRecords[1].title).toBe(
            "Diabetes Check"
        );
    });

    // ======================================================
    // LOCAL STORAGE KEY
    // ======================================================

    test("uses healthRecords as the localStorage key", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        expect(
            localStorage.getItem("healthRecords")
        ).not.toBeNull();
    });

    // ======================================================
    // DELETE ALL RECORDS
    // ======================================================

    test("shows empty state after deleting all records", () => {
        render(<HealthRecords />);

        let deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByRole("heading", {
                name: "No Health Records Found",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // EMPTY STATE ICON / MESSAGE
    // ======================================================

    test("displays empty record message", () => {
        render(<HealthRecords />);

        let deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByText("No Health Records Found")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Blood Test")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Eye Checkup")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Diabetes Check")
        ).not.toBeInTheDocument();
    });

    // ======================================================
    // RECORD COUNT
    // ======================================================

    test("initially displays three records", () => {
        render(<HealthRecords />);

        const recordTitles = [
            "Blood Test",
            "Eye Checkup",
            "Diabetes Check",
        ];

        recordTitles.forEach((title) => {
            expect(
                screen.getByRole("heading", {
                    name: title,
                })
            ).toBeInTheDocument();
        });
    });

    // ======================================================
    // ADD BUTTON ENABLED
    // ======================================================

    test("Add Record button is enabled", () => {
        render(<HealthRecords />);

        const addButton =
            screen.getByRole("button", {
                name: /add record/i,
            });

        expect(addButton).toBeEnabled();
    });

    // ======================================================
    // DELETE BUTTONS ENABLED
    // ======================================================

    test("all Delete buttons are enabled", () => {
        render(<HealthRecords />);

        const deleteButtons =
            screen.getAllByRole("button", {
                name: /delete/i,
            });

        deleteButtons.forEach((button) => {
            expect(button).toBeEnabled();
        });
    });

    // ======================================================
    // RECORD STRUCTURE
    // ======================================================

    test("renders record information together", () => {
        render(<HealthRecords />);

        expect(
            screen.getByText("Apollo Hospital")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Dr. Sharma")
        ).toBeInTheDocument();

        expect(
            screen.getByText("05 Aug 2026")
        ).toBeInTheDocument();

        expect(
            screen.getAllByText("Completed")
        ).toHaveLength(2);
    });
});