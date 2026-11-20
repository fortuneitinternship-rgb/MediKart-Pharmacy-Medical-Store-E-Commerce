import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";

import UploadPrescription from "./UploadPrescription";

import {
    getPrescriptions,
    uploadPrescription,
} from "../../api/submissionsApi";

import { getApiErrorMessage } from "../../services/api";

jest.mock("../../api/submissionsApi", () => ({
    getPrescriptions: jest.fn(),
    uploadPrescription: jest.fn(),
}));

jest.mock("../../services/api", () => ({
    getApiErrorMessage: jest.fn(),
}));

describe("UploadPrescription Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getPrescriptions.mockResolvedValue([]);

        getApiErrorMessage.mockImplementation(
            (error, fallback) => fallback
        );
    });

    test("renders upload prescription page", async () => {
        render(<UploadPrescription />);

        expect(
            screen.getByRole("heading", {
                name: /upload prescription/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/choose prescription/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getPrescriptions).toHaveBeenCalledTimes(1);
        });
    });

    test("loads prescriptions successfully", async () => {
        getPrescriptions.mockResolvedValue([
            {
                id: 1,
                filename: "prescription.pdf",
            },
        ]);

        render(<UploadPrescription />);

        await waitFor(() => {
            expect(
                screen.getByText("prescription.pdf")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByRole("heading", {
                name: /uploaded prescriptions/i,
            })
        ).toBeInTheDocument();
    });

    test("shows error when prescriptions cannot be loaded", async () => {
        getPrescriptions.mockRejectedValue(
            new Error("API error")
        );

        render(<UploadPrescription />);

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Sign in to view and upload prescriptions."
            );
        });

        expect(getApiErrorMessage).toHaveBeenCalled();
    });

    test("shows alert when upload is clicked without a file", () => {
        const alertMock = jest
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        render(<UploadPrescription />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        );

        expect(alertMock).toHaveBeenCalledWith(
            "Please upload a prescription."
        );

        expect(uploadPrescription).not.toHaveBeenCalled();

        alertMock.mockRestore();
    });

    test("accepts a valid PDF file", () => {
        render(<UploadPrescription />);

        const file = new File(
            ["test content"],
            "test.pdf",
            {
                type: "application/pdf",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        expect(
            screen.getByText("test.pdf")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /delete selected file/i,
            })
        ).toBeInTheDocument();
    });

    test("accepts a valid JPEG file", () => {
        render(<UploadPrescription />);

        const file = new File(
            ["test image"],
            "test.jpg",
            {
                type: "image/jpeg",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        expect(
            screen.getByText("test.jpg")
        ).toBeInTheDocument();
    });

    test("accepts a valid PNG file", () => {
        render(<UploadPrescription />);

        const file = new File(
            ["test image"],
            "test.png",
            {
                type: "image/png",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        expect(
            screen.getByText("test.png")
        ).toBeInTheDocument();
    });

    test("rejects an invalid file type", () => {
        render(<UploadPrescription />);

        const file = new File(
            ["test"],
            "test.txt",
            {
                type: "text/plain",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Choose a PDF, JPEG, or PNG file."
        );

        expect(
            screen.queryByText("test.txt")
        ).not.toBeInTheDocument();
    });

    test("rejects a file larger than 10 MB", () => {
        render(<UploadPrescription />);

        const largeFile = new File(
            ["test"],
            "large.pdf",
            {
                type: "application/pdf",
            }
        );

        Object.defineProperty(largeFile, "size", {
            value: 11 * 1024 * 1024,
        });

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [largeFile],
            },
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Prescription file must be 10 MB or smaller."
        );

        expect(
            screen.queryByText("large.pdf")
        ).not.toBeInTheDocument();
    });

    test("removes selected file", () => {
        render(<UploadPrescription />);

        const file = new File(
            ["test"],
            "test.pdf",
            {
                type: "application/pdf",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        expect(
            screen.getByText("test.pdf")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete selected file/i,
            })
        );

        expect(
            screen.queryByText("test.pdf")
        ).not.toBeInTheDocument();
    });

    test("uploads prescription successfully", async () => {
        const alertMock = jest
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        uploadPrescription.mockResolvedValue({
            id: 2,
            filename: "test.pdf",
        });

        render(<UploadPrescription />);

        const file = new File(
            ["test content"],
            "test.pdf",
            {
                type: "application/pdf",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        );

        await waitFor(() => {
            expect(uploadPrescription).toHaveBeenCalledTimes(1);
        });

        expect(uploadPrescription).toHaveBeenCalledWith(file);

        await waitFor(() => {
            expect(
                screen.getByText("test.pdf")
            ).toBeInTheDocument();
        });

        expect(alertMock).toHaveBeenCalledWith(
            "Prescription saved successfully."
        );

        alertMock.mockRestore();
    });

    test("shows uploading state while upload is in progress", async () => {
        let resolveUpload;

        uploadPrescription.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveUpload = resolve;
                })
        );

        render(<UploadPrescription />);

        const file = new File(
            ["test"],
            "test.pdf",
            {
                type: "application/pdf",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /uploading/i,
            })
        ).toBeDisabled();

        resolveUpload({
            id: 3,
            filename: "test.pdf",
        });

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /upload prescription/i,
                })
            ).not.toBeDisabled();
        });
    });

    test("shows error when upload fails", async () => {
        uploadPrescription.mockRejectedValue(
            new Error("Upload failed")
        );

        render(<UploadPrescription />);

        const file = new File(
            ["test"],
            "test.pdf",
            {
                type: "application/pdf",
            }
        );

        const input = screen.getByLabelText(
            /choose prescription/i
        );

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        );

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Unable to upload prescription. Please try again."
            );
        });

        expect(getApiErrorMessage).toHaveBeenCalled();
    });
});
