import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Addresses from "./Addresses";

import {
    addAddress,
    deleteAddress,
    getAddresses,
} from "../../api/addressApi";

import { getApiErrorMessage } from "../../services/api";

jest.mock("../../api/addressApi", () => ({
    addAddress: jest.fn(),
    deleteAddress: jest.fn(),
    getAddresses: jest.fn(),
}));

jest.mock("../../services/api", () => ({
    getApiErrorMessage: jest.fn(),
}));

describe("Addresses Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getAddresses.mockResolvedValue([]);
        addAddress.mockResolvedValue({
            id: 1,
            full_name: "Test",
            phone: "0000000000",
            address_line1: "Test Address",
            city: "Test City",
            state: "Test State",
            pincode: "0000",
            address_type: "Home",
        });

        deleteAddress.mockResolvedValue({});
        getApiErrorMessage.mockImplementation(
            (_, fallback) => fallback
        );
    });

    test("renders Saved Addresses heading", async () => {
        render(<Addresses />);

        expect(
            screen.getByRole("heading", { name: /saved addresses/i })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getAddresses).toHaveBeenCalledTimes(1);
        });
    });

    test("shows empty address message when no addresses exist", async () => {
        getAddresses.mockResolvedValue([]);

        render(<Addresses />);

        expect(
            await screen.findByText("No Address Found")
        ).toBeInTheDocument();
    });

    test("opens and closes the address form", async () => {
        render(<Addresses />);

        const addButton = screen.getByRole("button", {
            name: /add address/i,
        });

        fireEvent.click(addButton);

        expect(
            screen.getByPlaceholderText("Full name")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Phone")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Address")
        ).toBeInTheDocument();

        fireEvent.click(addButton);

        expect(
            screen.queryByPlaceholderText("Full name")
        ).not.toBeInTheDocument();
    });

    test("renders all address form fields", async () => {
        render(<Addresses />);

        fireEvent.click(
            screen.getByRole("button", { name: /add address/i })
        );

        expect(screen.getByPlaceholderText("Full name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Phone")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("State")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("PIN code")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /save address/i })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getAddresses).toHaveBeenCalled();
        });
    });

    test("updates address form fields", () => {
        render(<Addresses />);

        fireEvent.click(
            screen.getByRole("button", { name: /add address/i })
        );

        const fullName = screen.getByPlaceholderText("Full name");
        const phone = screen.getByPlaceholderText("Phone");
        const address = screen.getByPlaceholderText("Address");
        const city = screen.getByPlaceholderText("City");
        const state = screen.getByPlaceholderText("State");
        const pincode = screen.getByPlaceholderText("PIN code");

        fireEvent.change(fullName, {
            target: { value: "Test" },
        });

        fireEvent.change(phone, {
            target: { value: "0000000000" },
        });

        fireEvent.change(address, {
            target: { value: "Test Address" },
        });

        fireEvent.change(city, {
            target: { value: "Test City" },
        });

        fireEvent.change(state, {
            target: { value: "Test State" },
        });

        fireEvent.change(pincode, {
            target: { value: "0000" },
        });

        expect(fullName).toHaveValue("Test");
        expect(phone).toHaveValue("0000000000");
        expect(address).toHaveValue("Test Address");
        expect(city).toHaveValue("Test City");
        expect(state).toHaveValue("Test State");
        expect(pincode).toHaveValue("0000");
    });

    test("saves address successfully", async () => {
        const savedAddress = {
            id: 1,
            full_name: "Test",
            phone: "0000000000",
            address_line1: "Test Address",
            city: "Test City",
            state: "Test State",
            pincode: "0000",
            address_type: "Home",
        };

        addAddress.mockResolvedValue(savedAddress);

        render(<Addresses />);

        fireEvent.click(
            screen.getByRole("button", { name: /add address/i })
        );

        fireEvent.change(screen.getByPlaceholderText("Full name"), {
            target: { value: "Test" },
        });

        fireEvent.change(screen.getByPlaceholderText("Phone"), {
            target: { value: "0000000000" },
        });

        fireEvent.change(screen.getByPlaceholderText("Address"), {
            target: { value: "Test Address" },
        });

        fireEvent.change(screen.getByPlaceholderText("City"), {
            target: { value: "Test City" },
        });

        fireEvent.change(screen.getByPlaceholderText("State"), {
            target: { value: "Test State" },
        });

        fireEvent.change(screen.getByPlaceholderText("PIN code"), {
            target: { value: "0000" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /save address/i })
        );

        await waitFor(() => {
            expect(addAddress).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(
                screen.queryByPlaceholderText("Full name")
            ).not.toBeInTheDocument();
        });
    });

    test("shows Saving state while address is being saved", async () => {
        let resolveSave;

        addAddress.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSave = resolve;
                })
        );

        render(<Addresses />);

        fireEvent.click(
            screen.getByRole("button", { name: /add address/i })
        );

        fireEvent.change(screen.getByPlaceholderText("Full name"), {
            target: { value: "Test" },
        });

        fireEvent.change(screen.getByPlaceholderText("Phone"), {
            target: { value: "0000000000" },
        });

        fireEvent.change(screen.getByPlaceholderText("Address"), {
            target: { value: "Test Address" },
        });

        fireEvent.change(screen.getByPlaceholderText("City"), {
            target: { value: "Test City" },
        });

        fireEvent.change(screen.getByPlaceholderText("State"), {
            target: { value: "Test State" },
        });

        fireEvent.change(screen.getByPlaceholderText("PIN code"), {
            target: { value: "0000" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /save address/i })
        );

        expect(
            await screen.findByRole("button", { name: /saving/i })
        ).toBeDisabled();

        resolveSave({
            id: 1,
            full_name: "Test",
            phone: "0000000000",
            address_line1: "Test Address",
            city: "Test City",
            state: "Test State",
            pincode: "0000",
            address_type: "Home",
        });

        await waitFor(() => {
            expect(
                screen.queryByText("Saving...")
            ).not.toBeInTheDocument();
        });
    });

    test("displays saved addresses", async () => {
        getAddresses.mockResolvedValue([
            {
                id: 1,
                full_name: "Test",
                phone: "0000000000",
                address_line1: "Test Address",
                city: "Test City",
                state: "Test State",
                pincode: "0000",
                address_type: "Home",
            },
        ]);

        render(<Addresses />);

        await waitFor(() => {
            expect(screen.getByText("Home")).toBeInTheDocument();
            expect(screen.getByText("Test")).toBeInTheDocument();
            expect(screen.getByText("0000000000")).toBeInTheDocument();
        });
    });

    test("deletes an address successfully", async () => {
        getAddresses.mockResolvedValue([
            {
                id: 1,
                full_name: "Test",
                phone: "0000000000",
                address_line1: "Test Address",
                city: "Test City",
                state: "Test State",
                pincode: "0000",
                address_type: "Home",
            },
        ]);

        render(<Addresses />);

        await waitFor(() => {
            expect(screen.getByText("Home")).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", { name: /delete/i })
        );

        await waitFor(() => {
            expect(deleteAddress).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(
                screen.getByText("No Address Found")
            ).toBeInTheDocument();
        });
    });

    test("shows loading error when addresses cannot be loaded", async () => {
        getAddresses.mockRejectedValue(new Error("Load failed"));

        getApiErrorMessage.mockReturnValue(
            "Unable to load addresses."
        );

        render(<Addresses />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Unable to load addresses.");

        expect(getApiErrorMessage).toHaveBeenCalled();
    });

    test("shows save error when address cannot be saved", async () => {
        addAddress.mockRejectedValue(new Error("Save failed"));

        getApiErrorMessage.mockReturnValue(
            "Unable to save this address."
        );

        render(<Addresses />);

        fireEvent.click(
            screen.getByRole("button", { name: /add address/i })
        );

        fireEvent.change(screen.getByPlaceholderText("Full name"), {
            target: { value: "Test" },
        });

        fireEvent.change(screen.getByPlaceholderText("Phone"), {
            target: { value: "0000000000" },
        });

        fireEvent.change(screen.getByPlaceholderText("Address"), {
            target: { value: "Test Address" },
        });

        fireEvent.change(screen.getByPlaceholderText("City"), {
            target: { value: "Test City" },
        });

        fireEvent.change(screen.getByPlaceholderText("State"), {
            target: { value: "Test State" },
        });

        fireEvent.change(screen.getByPlaceholderText("PIN code"), {
            target: { value: "0000" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /save address/i })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Unable to save this address.");
    });

    test("shows delete error when address cannot be deleted", async () => {
        getAddresses.mockResolvedValue([
            {
                id: 1,
                full_name: "Test",
                phone: "0000000000",
                address_line1: "Test Address",
                city: "Test City",
                state: "Test State",
                pincode: "0000",
                address_type: "Home",
            },
        ]);

        deleteAddress.mockRejectedValue(new Error("Delete failed"));

        getApiErrorMessage.mockReturnValue(
            "Unable to delete this address."
        );

        render(<Addresses />);

        await waitFor(() => {
            expect(screen.getByText("Home")).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", { name: /delete/i })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Unable to delete this address.");
    });
});