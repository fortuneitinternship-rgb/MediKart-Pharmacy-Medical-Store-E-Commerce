import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TrackOrder from "./TrackOrder";
import { getOrder, getOrderTracking, getOrders } from "../../api/ordersApi";

jest.mock("../../api/ordersApi", () => ({
    getOrder: jest.fn(),
    getOrderTracking: jest.fn(),
    getOrders: jest.fn(),
}));

const renderTrackingPage = () =>
    render(
        <MemoryRouter initialEntries={["/track"]}>
            <Routes>
                <Route path="/track" element={<TrackOrder />} />
            </Routes>
        </MemoryRouter>
    );

describe("Order tracking page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getOrders.mockResolvedValue([]);
        getOrder.mockResolvedValue({
            orderId: "MK1234567890",
            orderDate: "2026-01-01",
            paymentMethod: "Cash on Delivery",
            totalAmount: 100,
            items: [],
            address: null,
        });
        getOrderTracking.mockResolvedValue({
            status: "In Transit",
            tracking_id: "TRK123456789",
        });
    });

    test("loads tracking and order details from the API", async () => {
        renderTrackingPage();
        fireEvent.change(screen.getByPlaceholderText(/enter order id/i), {
            target: { value: "mk1234567890" },
        });
    });

    test("shows the API error instead of fabricated tracking data", async () => {
        getOrder.mockRejectedValue({
            response: { data: { detail: "Order not found" } },
        });
        renderTrackingPage();
        fireEvent.change(screen.getByPlaceholderText(/enter order id/i), {
            target: { value: "MK0000000000" },
        });
        fireEvent.click(screen.getByRole("button", { name: /track order/i }));
        expect(screen.queryByText(/TRK/)).not.toBeInTheDocument();
    });
});
