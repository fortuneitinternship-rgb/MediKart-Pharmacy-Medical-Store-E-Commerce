import React from "react";
import {
    render,
    screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import "@testing-library/jest-dom";

import UploadPrescription from "./UploadPrescription";

describe("UploadPrescription", () => {
    beforeEach(() => {
        jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --------------------------------------------------
    // RENDERING TESTS
    // --------------------------------------------------

    test("renders Upload Prescription page", () => {
        render(<UploadPrescription />);

        expect(
            document.querySelector(".upload-page")
        ).toBeInTheDocument();
    });

    test("renders upload card", () => {
        render(<UploadPrescription />);

        expect(
            document.querySelector(".upload-card")
        ).toBeInTheDocument();
    });

    test("renders heading", () => {
        render(<UploadPrescription />);

        expect(
            screen.getByRole("heading", {
                name: /upload prescription/i,
            })
        ).toBeInTheDocument();
    });

    test("renders prescription description", () => {
        render(<UploadPrescription />);

        expect(
            screen.getByText(
                /upload your doctor's prescription to order medicines easily/i
            )
        ).toBeInTheDocument();
    });

    test("renders Choose Prescription text", () => {
        render(<UploadPrescription />);

        expect(
            screen.getByText("Choose Prescription")
        ).toBeInTheDocument();
    });

    test("renders file input", () => {
        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        expect(input).toBeInTheDocument();
    });

    test("file input has correct accepted file types", () => {
        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        expect(input).toHaveAttribute(
            "accept",
            ".jpg,.jpeg,.png,.pdf"
        );
    });

    test("renders Upload Prescription button", () => {
        render(<UploadPrescription />);

        expect(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // INITIAL STATE TESTS
    // --------------------------------------------------

    test("does not show selected file initially", () => {
        render(<UploadPrescription />);

        expect(
            document.querySelector(".selected-file")
        ).not.toBeInTheDocument();
    });

    test("does not show delete button initially", () => {
        render(<UploadPrescription />);

        expect(
            document.querySelector(".delete-file")
        ).not.toBeInTheDocument();
    });

    // --------------------------------------------------
    // FILE UPLOAD TESTS
    // --------------------------------------------------

    test("allows user to select a PDF file", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["test prescription"],
            "test-prescription.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        expect(
            screen.getByText("test-prescription.pdf")
        ).toBeInTheDocument();
    });

    test("allows user to select an image file", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["test image"],
            "test-prescription.png",
            {
                type: "image/png",
            }
        );

        await user.upload(input, file);

        expect(
            screen.getByText("test-prescription.png")
        ).toBeInTheDocument();
    });

    test("displays selected file section", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["test content"],
            "test-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        expect(
            document.querySelector(".selected-file")
        ).toBeInTheDocument();
    });

    test("displays selected file name", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "sample-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        expect(
            screen.getByText("sample-file.pdf")
        ).toBeInTheDocument();
    });

    test("displays file size", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "sample-file.pdf",
            {
                type: "application/pdf",
            }
        );

        Object.defineProperty(file, "size", {
            value: 2048,
            configurable: true,
        });

        await user.upload(input, file);

        expect(
            screen.getByText("2.00 KB")
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // DELETE FILE TESTS
    // --------------------------------------------------

    test("shows delete button after file selection", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "sample-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        expect(
            document.querySelector(".delete-file")
        ).toBeInTheDocument();
    });

    test("removes selected file", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "sample-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        expect(
            screen.getByText("sample-file.pdf")
        ).toBeInTheDocument();

        const deleteButton =
            document.querySelector(".delete-file");

        await user.click(deleteButton);

        expect(
            screen.queryByText("sample-file.pdf")
        ).not.toBeInTheDocument();

        expect(
            document.querySelector(".selected-file")
        ).not.toBeInTheDocument();
    });

    test("delete button removes file information", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "remove-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        const deleteButton =
            document.querySelector(".delete-file");

        await user.click(deleteButton);

        expect(
            document.querySelector(".delete-file")
        ).not.toBeInTheDocument();
    });

    // --------------------------------------------------
    // ALERT TESTS
    // --------------------------------------------------

    test("shows alert when uploading without a file", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const uploadButton =
            screen.getByRole("button", {
                name: /upload prescription/i,
            });

        await user.click(uploadButton);

        expect(window.alert).toHaveBeenCalledWith(
            "Please upload a prescription."
        );
    });

    test("shows success alert after uploading a file", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "test-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        const uploadButton =
            screen.getByRole("button", {
                name: /upload prescription/i,
            });

        await user.click(uploadButton);

        expect(window.alert).toHaveBeenCalledWith(
            "Prescription uploaded successfully!"
        );
    });

    test("does not show error alert after successful upload", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const file = new File(
            ["content"],
            "test-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, file);

        await user.click(
            screen.getByRole("button", {
                name: /upload prescription/i,
            })
        );

        expect(window.alert).not.toHaveBeenCalledWith(
            "Please upload a prescription."
        );
    });

    // --------------------------------------------------
    // MULTIPLE FILE TEST
    // --------------------------------------------------

    test("uses the first selected file", async () => {
        const user = userEvent.setup();

        render(<UploadPrescription />);

        const input = document.querySelector(
            'input[type="file"]'
        );

        const firstFile = new File(
            ["first"],
            "first-file.pdf",
            {
                type: "application/pdf",
            }
        );

        const secondFile = new File(
            ["second"],
            "second-file.pdf",
            {
                type: "application/pdf",
            }
        );

        await user.upload(input, [
            firstFile,
            secondFile,
        ]);

        expect(
            screen.getByText("first-file.pdf")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("second-file.pdf")
        ).not.toBeInTheDocument();
    });

    // --------------------------------------------------
    // CSS CLASS TESTS
    // --------------------------------------------------

    test("renders required CSS classes", () => {
        render(<UploadPrescription />);

        expect(
            document.querySelector(".upload-page")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".upload-card")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".upload-box")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".submit-btn")
        ).toBeInTheDocument();
    });

    test("file input is inside upload box", () => {
        render(<UploadPrescription />);

        const uploadBox =
            document.querySelector(".upload-box");

        const input =
            uploadBox.querySelector('input[type="file"]');

        expect(input).toBeInTheDocument();
    });
});