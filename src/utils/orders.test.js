import { normalizeApiOrder, syncOrdersFromServer } from "./orders";
import { getOrders } from "../api/ordersApi";
import { getStoredAccessToken } from "../services/api";

jest.mock("../api/ordersApi", () => ({ getOrders: jest.fn() }));
jest.mock("../services/api", () => ({ getStoredAccessToken: jest.fn() }));

const apiOrder = {
  id: 7,
  order_id: "MK2026112300001",
  customer_name: "Demo User",
  phone: "9876543210",
  address: "12 MG Road",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500001",
  payment_method: "UPI",
  payment_status: "Paid",
  delivery_type: "express",
  delivery_charge: 49,
  product_amount: 100,
  discount: 10,
  tax_amount: 0,
  total_amount: 139,
  status: "Order Confirmed",
  created_at: "2026-11-23T06:58:44",
  items: [{ id: 1, product_id: 3, product_name: "Paracetamol", quantity: 2, price: 50, total: 100, image: "/a.jpg" }],
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("normalizeApiOrder maps API fields to the order-page shape", () => {
  const order = normalizeApiOrder(apiOrder);
  expect(order).toMatchObject({
    id: "MK2026112300001",
    orderId: "MK2026112300001",
    dbId: 7,
    totalAmount: 139,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    deliveryType: "Express Delivery",
  });
  expect(order.items[0]).toMatchObject({ name: "Paracetamol", quantity: 2, price: 50 });
  expect(order.address).toMatchObject({ city: "Hyderabad", pincode: "500001" });
  expect(order.date.endsWith("Z")).toBe(true);
});

test("syncOrdersFromServer caches server orders for the order pages", async () => {
  getStoredAccessToken.mockReturnValue("token");
  getOrders.mockResolvedValue([apiOrder]);
  const events = jest.fn();
  window.addEventListener("ordersUpdated", events);

  const result = await syncOrdersFromServer();

  expect(result).toHaveLength(1);
  expect(JSON.parse(localStorage.getItem("orders"))[0].orderId).toBe("MK2026112300001");
  expect(events).toHaveBeenCalled();
  window.removeEventListener("ordersUpdated", events);
});

test("syncOrdersFromServer does nothing for guests and never throws", async () => {
  getStoredAccessToken.mockReturnValue("");
  expect(await syncOrdersFromServer()).toBeNull();
  expect(getOrders).not.toHaveBeenCalled();

  getStoredAccessToken.mockReturnValue("token");
  getOrders.mockRejectedValue(new Error("offline"));
  jest.spyOn(console, "error").mockImplementation(() => {});
  expect(await syncOrdersFromServer()).toBeNull();
  expect(localStorage.getItem("orders")).toBeNull();
});
