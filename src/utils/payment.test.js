import { isValidUpiId, payForOrder } from "./payment";
import { getPaymentConfig, processCheckoutPayment } from "../api/checkoutApi";

jest.mock("../api/checkoutApi", () => ({
  getPaymentConfig: jest.fn(),
  processCheckoutPayment: jest.fn(),
  createRazorpayOrder: jest.fn(),
  verifyRazorpayPayment: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  getPaymentConfig.mockResolvedValue({ mode: "simulator", razorpay_enabled: false });
  processCheckoutPayment.mockResolvedValue({ status: "Paid", transaction_id: "TXN-1" });
});

test.each([
  ["rahul@okhdfcbank", true],
  ["9876543210@paytm", true],
  ["first.last-1@ybl", true],
  ["", false],
  ["no-at-sign", false],
  ["a@b", false],
  ["name@", false],
  ["@bank", false],
])("isValidUpiId(%s) = %s", (value, expected) => {
  expect(isValidUpiId(value)).toBe(expected);
});

test("COD only records the choice and sends no UPI id", async () => {
  await payForOrder({ orderId: "MK1", method: "COD", upiId: "x@y" });
  expect(processCheckoutPayment).toHaveBeenCalledWith({ order_id: "MK1", method: "COD" });
});

test("simulator UPI payment sends the trimmed UPI id", async () => {
  const receipt = await payForOrder({ orderId: "MK2", method: "UPI", upiId: " demo@okaxis " });
  expect(processCheckoutPayment).toHaveBeenCalledWith({ order_id: "MK2", method: "UPI", upi_id: "demo@okaxis" });
  expect(receipt.status).toBe("Paid");
});

test("card payments never send a UPI id", async () => {
  await payForOrder({ orderId: "MK3", method: "CARD", upiId: "demo@okaxis" });
  expect(processCheckoutPayment).toHaveBeenCalledWith({ order_id: "MK3", method: "CARD" });
});
