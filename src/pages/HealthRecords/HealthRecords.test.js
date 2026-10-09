import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import HealthRecords from "./HealthRecords";

import {
    getHealthRecords,
    addHealthRecord,
    deleteHealthRecord,
} from "../../api/submissionsApi";

import { getApiErrorMessage } from "../../services/api";

jest.mock("../../api/submissionsApi", () => ({
    getHealthRecords: jest.fn(),
    addHealthRecord: jest.fn(),
    deleteHealthRecord: jest.fn(),
}));

jest.mock("../../services/api", () => ({
    getApiErrorMessage: jest.fn(),
}));

describe("HealthRecords", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getHealthRecords.mockResolvedValue([]);

        addHealthRecord.mockResolvedValue({
            id: 1,
            title: "Test Record",
            hospital: "Test Clinic",
            doctor: "Test Doctor",
            record_date: "2026-10-07",
            status: "Completed",
        });

        deleteHealthRecord.mockResolvedValue({
            message: "Deleted successfully",
        });

        getApiErrorMessage.mockImplementation(
            (error, fallback) => fallback
        );
    });

    test("renders Health Records page", async () => {
        render(<HealthRecords />);

        // Exact heading prevents matching "No Health Records Found"
        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Health Records",
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getHealthRecords).toHaveBeenCalledTimes(1);
        });
    });

    test("shows empty records message", async () => {
        getHealthRecords.mockResolvedValue([]);

        render(<HealthRecords />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "No Health Records Found",
            })
        ).toBeInTheDocument();
    });

    test("opens and closes add record form", async () => {
        render(<HealthRecords />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Health Records Found",
        });

        const addButton = screen.getByRole("button", {
            name: /add record/i,
        });

        fireEvent.click(addButton);

        expect(
            screen.getByPlaceholderText("Record title")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Hospital or clinic")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Doctor")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Save Record",
            })
        ).toBeInTheDocument();

        fireEvent.click(addButton);

        expect(
            screen.queryByPlaceholderText("Record title")
        ).not.toBeInTheDocument();
    });

    test("allows entering record information", async () => {
        render(<HealthRecords />);

        await screen.findByText("No Health Records Found");

        fireEvent.click(
            screen.getByRole("button", {
                name: /add record/i,
            })
        );

        const titleInput =
            screen.getByPlaceholderText("Record title");

        const hospitalInput =
            screen.getByPlaceholderText("Hospital or clinic");

        const doctorInput =
            screen.getByPlaceholderText("Doctor");

        // Select the date input specifically.
        const dateInput =
            document.querySelector('input[type="date"]');

        expect(dateInput).toBeInTheDocument();

        fireEvent.change(titleInput, {
            target: {
                value: "Medical Checkup",
            },
        });

        fireEvent.change(hospitalInput, {
            target: {
                value: "Test Clinic",
            },
        });

        fireEvent.change(doctorInput, {
            target: {
                value: "Test Doctor",
            },
        });

        fireEvent.change(dateInput, {
            target: {
                value: "2026-10-07",
            },
        });

        expect(titleInput).toHaveValue("Medical Checkup");
        expect(hospitalInput).toHaveValue("Test Clinic");
        expect(doctorInput).toHaveValue("Test Doctor");
        expect(dateInput).toHaveValue("2026-10-07");
    });

    test("saves a health record successfully", async () => {
        const savedRecord = {
            id: 10,
            title: "Test Record",
            hospital: "Test Clinic",
            doctor: "Test Doctor",
            record_date: "2026-10-07",
            status: "Completed",
        };

        addHealthRecord.mockResolvedValue(savedRecord);

        render(<HealthRecords />);

        await screen.findByText("No Health Records Found");

        fireEvent.click(
            screen.getByRole("button", {
                name: /add record/i,
            })
        );

        fireEvent.change(
            screen.getByPlaceholderText("Record title"),
            {
                target: {
                    value: "Test Record",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Hospital or clinic"),
            {
                target: {
                    value: "Test Clinic",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Doctor"),
            {
                target: {
                    value: "Test Doctor",
                },
            }
        );

        const dateInput =
            document.querySelector('input[type="date"]');

        fireEvent.change(dateInput, {
            target: {
                value: "2026-10-07",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Record",
            })
        );

        await waitFor(() => {
            expect(addHealthRecord).toHaveBeenCalledTimes(1);
        });

        expect(addHealthRecord).toHaveBeenCalledWith({
            title: "Test Record",
            hospital: "Test Clinic",
            doctor: "Test Doctor",
            record_date: "2026-10-07",
            status: "Completed",
        });

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Test Record",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Completed")
        ).toBeInTheDocument();
    });

    test("displays existing health record", async () => {
        getHealthRecords.mockResolvedValue([
            {
                id: 5,
                title: "Test Record",
                hospital: "Test Clinic",
                doctor: "Test Doctor",
                record_date: "2026-10-07",
                status: "Completed",
            },
        ]);

        render(<HealthRecords />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Test Record",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Hospital:/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Doctor:/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText("Completed")
        ).toBeInTheDocument();
    });

    test("deletes a health record successfully", async () => {
        getHealthRecords.mockResolvedValue([
            {
                id: 5,
                title: "Test Record",
                hospital: "Test Clinic",
                doctor: "Test Doctor",
                record_date: "2026-10-07",
                status: "Completed",
            },
        ]);

        render(<HealthRecords />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Test Record",
            })
        ).toBeInTheDocument();

        const deleteButton = screen.getByRole("button", {
            name: /delete/i,
        });

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteHealthRecord).toHaveBeenCalledWith(5);
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("heading", {
                    level: 3,
                    name: "Test Record",
                })
            ).not.toBeInTheDocument();
        });

        expect(
            screen.getByRole("heading", {
                level: 3,
                name: "No Health Records Found",
            })
        ).toBeInTheDocument();
    });

    test("shows error when loading records fails", async () => {
        getHealthRecords.mockRejectedValue(
            new Error("Load error")
        );

        getApiErrorMessage.mockReturnValue(
            "Unable to load health records."
        );

        render(<HealthRecords />);

        const errorMessage =
            await screen.findByRole("alert");

        expect(errorMessage).toHaveTextContent(
            "Unable to load health records."
        );
    });

    test("shows error when saving record fails", async () => {
        addHealthRecord.mockRejectedValue(
            new Error("Save error")
        );

        getApiErrorMessage.mockReturnValue(
            "Unable to save this health record."
        );

        render(<HealthRecords />);

        await screen.findByText("No Health Records Found");

        fireEvent.click(
            screen.getByRole("button", {
                name: /add record/i,
            })
        );

        fireEvent.change(
            screen.getByPlaceholderText("Record title"),
            {
                target: {
                    value: "Test Record",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Hospital or clinic"),
            {
                target: {
                    value: "Test Clinic",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Doctor"),
            {
                target: {
                    value: "Test Doctor",
                },
            }
        );

        const dateInput =
            document.querySelector('input[type="date"]');

        fireEvent.change(dateInput, {
            target: {
                value: "2026-10-07",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Record",
            })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Unable to save this health record."
        );
    });

    test("shows error when deleting record fails", async () => {
        getHealthRecords.mockResolvedValue([
            {
                id: 5,
                title: "Test Record",
                hospital: "Test Clinic",
                doctor: "Test Doctor",
                record_date: "2026-10-07",
                status: "Completed",
            },
        ]);

        deleteHealthRecord.mockRejectedValue(
            new Error("Delete error")
        );

        getApiErrorMessage.mockReturnValue(
            "Unable to delete this health record."
        );

        render(<HealthRecords />);

        await screen.findByRole("heading", {
            level: 3,
            name: "Test Record",
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete/i,
            })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Unable to delete this health record."
        );
    });
});