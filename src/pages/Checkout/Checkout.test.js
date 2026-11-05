import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Checkout from "./Checkout";
import {
  createCheckoutOrder,
  getCheckoutCart,
  processCheckoutPayment,
  saveCheckoutAddress,
  validateCheckoutCoupon,
} from "../../api/checkoutApi";
import {
  removeCartItem,
  updateCartItem,
} from "../../api/cartApi";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

jest.mock("../../api/checkoutApi", () => ({
  createCheckoutOrder: jest.fn(),
  getCheckoutCart: jest.fn(),
  processCheckoutPayment: jest.fn(),
  saveCheckoutAddress: jest.fn(),
  validateCheckoutCoupon: jest.fn(),
}));

jest.mock("../../api/cartApi", () => ({
  removeCartItem: jest.fn(),
  updateCartItem: jest.fn(),
}));

describe("Checkout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    getCheckoutCart.mockResolvedValue({ items: [] });
    saveCheckoutAddress.mockResolvedValue({});
    createCheckoutOrder.mockResolvedValue({
      order: { order_id: "MK202501010001" },
    });
    processCheckoutPayment.mockResolvedValue({
      transaction_id: "TXN-TEST123",
      amount: 100,
      method: "COD",
      status: "Pending",
    });
    validateCheckoutCoupon.mockResolvedValue({
      code: "SAVE20",
      discount_amount: 20,
      order_amount: 100,
      total_after_discount: 80,
    });
    removeCartItem.mockResolvedValue({});
    updateCartItem.mockResolvedValue({});

    global.alert = jest.fn();

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: jest.fn(),
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderCheckout = (cart = [], state = null) => {
    localStorage.setItem("cart", JSON.stringify(cart));
    getCheckoutCart.mockResolvedValue({ items: cart });

    return render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/checkout",
            state,
          },
        ]}
      >
        <Checkout />
      </MemoryRouter>
    );
  };

  const minimalCart = [
    {
      id: 1,
      product_id: 1,
      name: "Test Product",
      price: 100,
      quantity: 1,
    },
  ];

  const goToAddressStep = async () => {
    renderCheckout(minimalCart);

    await waitFor(() => {
      expect(
        screen.getByTestId("proceed-address")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId("proceed-address")
    );

    expect(
      await screen.findByRole("heading", {
        name: /delivery address/i,
      })
    ).toBeInTheDocument();
  };

  const fillAddress = () => {
    fireEvent.change(
      screen.getByLabelText("Full Name"),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Mobile Number"),
      {
        target: {
          value: "0000000000",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Complete Address"),
      {
        target: {
          value: "Test Address",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("City"),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("State"),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Pincode"),
      {
        target: {
          value: "000000",
        },
      }
    );
  };

  test("renders empty cart screen when cart is empty", async () => {
    renderCheckout([]);

    expect(
      await screen.findByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Add products before checkout."
      )
    ).toBeInTheDocument();
  });

  test("navigates to shop from empty cart", async () => {
    renderCheckout([]);

    const button = await screen.findByRole(
      "button",
      {
        name: /continue shopping/i,
      }
    );

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/shop"
    );
  });

  test("shows a cart load error and retries the database request", async () => {
    getCheckoutCart
      .mockRejectedValueOnce({
        message: "Request failed",
        response: {
          status: 503,
          data: { detail: "Database unavailable" },
        },
      })
      .mockResolvedValueOnce({ items: minimalCart });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Database unavailable"
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", { name: /your order/i })
    ).toBeInTheDocument();
  });

  test("renders checkout order step", async () => {
    renderCheckout(minimalCart);

    expect(
      await screen.findByRole("heading", {
        name: /your order/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("cart-item-count")
    ).toHaveTextContent("1 Item");

    expect(
      screen.getByTestId("checkout-product-1")
    ).toBeInTheDocument();
  });

  test("increases and decreases item quantity", async () => {
    renderCheckout(minimalCart);

    await screen.findByTestId("quantity-1");

    expect(
      screen.getByTestId("quantity-1")
    ).toHaveTextContent("1");

    fireEvent.click(
      screen.getByTestId("increase-1")
    );

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(1, 2);
      expect(screen.getByTestId("quantity-1")).toHaveTextContent("2");
    });

    fireEvent.click(
      screen.getByTestId("decrease-1")
    );

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(1, 1);
      expect(screen.getByTestId("quantity-1")).toHaveTextContent("1");
    });
  });

  test("does not decrease quantity below one", async () => {
    renderCheckout(minimalCart);

    await screen.findByTestId("quantity-1");

    const decreaseButton =
      screen.getByTestId("decrease-1");

    expect(decreaseButton).toBeDisabled();

    expect(
      screen.getByTestId("quantity-1")
    ).toHaveTextContent("1");
  });

  test("removes item from cart", async () => {
    renderCheckout(minimalCart);

    await screen.findByTestId("remove-1");

    fireEvent.click(
      screen.getByTestId("remove-1")
    );

    await waitFor(() => {
      expect(
        screen.getByText("Your Cart is Empty")
      ).toBeInTheDocument();
    });

    expect(removeCartItem).toHaveBeenCalledWith(1);
  });

  test("moves from order step to address step", async () => {
    await goToAddressStep();

    expect(
      screen.getByLabelText("Full Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Mobile Number")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Complete Address")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("City")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("State")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Pincode")
    ).toBeInTheDocument();
  });

  test("validates empty address", async () => {
    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Please enter your name."
    );
  });

  test("validates phone number", async () => {
    await goToAddressStep();

    fireEvent.change(
      screen.getByLabelText("Full Name"),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Mobile Number"),
      {
        target: {
          value: "123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Please enter a valid 10-digit phone number."
    );
  });

  test("validates pincode", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.change(
      screen.getByLabelText("Pincode"),
      {
        target: {
          value: "123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Please enter a valid 6-digit pincode."
    );
  });

  test("continues to payment with valid address", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: /payment method/i,
      })
    ).toBeInTheDocument();

    expect(
      localStorage.getItem("deliveryAddress")
    ).toBeTruthy();
  });

  test("changes delivery distance", async () => {
    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^medium/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^long/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^short/i,
      })
    );
  });

  test("selects card payment without collecting raw card data", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: /payment method/i,
      })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("radio", {
        name: /credit \/ debit card/i,
      })
    );

    expect(screen.queryByPlaceholderText("Card Number")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("CVV")).not.toBeInTheDocument();
    expect(
      screen.getByText(/development payment simulation/i)
    ).toBeInTheDocument();
  });

  test("selects net banking without asking for payment credentials", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByRole("heading", {
      name: /payment method/i,
    });

    fireEvent.click(
      screen.getByRole("radio", {
        name: /net banking/i,
      })
    );

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(
      screen.getByText(/do not enter real payment details/i)
    ).toBeInTheDocument();
  });

  test("cash on delivery is selected by default", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByRole("heading", {
      name: /payment method/i,
    });

    expect(
      screen.getByRole("radio", {
        name: /cash on delivery/i,
      })
    ).toBeChecked();
  });

  test("goes back from payment to address", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByRole("heading", {
      name: /payment method/i,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /delivery address/i,
      })
    ).toBeInTheDocument();
  });

  test("selects location using browser geolocation", async () => {
    await goToAddressStep();

    navigator.geolocation.getCurrentPosition.mockImplementation(
      (success) => {
        success({
          coords: {
            latitude: 10.123456,
            longitude: 20.654321,
          },
        });
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /choose on map/i,
      })
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Your current location has been selected."
      );
    });

    const map = await screen.findByTitle("Selected delivery location");
    expect(map.getAttribute("src")).toContain(
      "marker=10.123456%2C20.654321"
    );
  });

  test("handles geolocation error", async () => {
    await goToAddressStep();

    navigator.geolocation.getCurrentPosition.mockImplementation(
      (_, error) => {
        error(new Error("Location error"));
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /choose on map/i,
      })
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Unable to get your location. Please allow location access or fill the address manually."
      );
    });
  });

  test("places order successfully", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByRole("heading", {
      name: /payment method/i,
    });

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    expect(
      await screen.findByText("Order Placed Successfully!")
    ).toBeInTheDocument();

    expect(screen.getByTestId("order-id")).toHaveTextContent(
      "MK202501010001"
    );

    expect(createCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ product_id: 1, quantity: 1 }],
        payment_method: "COD",
      })
    );
    expect(processCheckoutPayment).toHaveBeenCalledWith({
      order_id: "MK202501010001",
      method: "COD",
    });
    expect(screen.getByTestId("payment-status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("receipt-amount")).toHaveTextContent("₹100.00");
    expect(removeCartItem).not.toHaveBeenCalled();
    expect(localStorage.getItem("buyNow")).toBeNull();
  });

  test("validates a coupon and includes it in order totals and API request", async () => {
    await goToAddressStep();
    fillAddress();
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i })
    );
    await screen.findByRole("heading", { name: /payment method/i });

    fireEvent.change(screen.getByLabelText("Coupon code"), {
      target: { value: "save20" },
    });
    fireEvent.click(screen.getByTestId("apply-coupon"));

    expect(await screen.findByRole("status")).toHaveTextContent("SAVE20 applied");
    expect(validateCheckoutCoupon).toHaveBeenCalledWith("SAVE20", 100);
    expect(screen.getByTestId("payable-amount")).toHaveTextContent("80.00");

    fireEvent.click(screen.getByTestId("place-order"));
    await screen.findByTestId("payment-receipt");

    expect(createCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({ coupon_code: "SAVE20" })
    );
  });

  test("reports an invalid coupon without applying a discount", async () => {
    validateCheckoutCoupon.mockRejectedValueOnce({
      response: { data: { detail: "Coupon has expired." } },
    });
    await goToAddressStep();
    fillAddress();
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i })
    );
    await screen.findByRole("heading", { name: /payment method/i });
    fireEvent.change(screen.getByLabelText("Coupon code"), {
      target: { value: "OLD" },
    });
    fireEvent.click(screen.getByTestId("apply-coupon"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Coupon has expired."
    );
    expect(screen.getByTestId("payable-amount")).toHaveTextContent("100.00");
  });

  test("retries payment without creating a duplicate order", async () => {
    processCheckoutPayment
      .mockRejectedValueOnce({
        response: { data: { detail: "Payment service unavailable." } },
      })
      .mockResolvedValueOnce({
        transaction_id: "TXN-RETRY",
        amount: 100,
        method: "CARD",
        status: "Simulated",
      });

    await goToAddressStep();
    fillAddress();
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i })
    );
    await screen.findByRole("heading", { name: /payment method/i });
    fireEvent.click(screen.getByRole("radio", { name: /credit \/ debit card/i }));
    fireEvent.click(screen.getByTestId("place-order"));

    expect(await screen.findByText("Payment service unavailable.")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("retry-payment"));

    expect(await screen.findByTestId("transaction-id")).toHaveTextContent(
      "TXN-RETRY"
    );
    expect(createCheckoutOrder).toHaveBeenCalledTimes(1);
    expect(processCheckoutPayment).toHaveBeenCalledTimes(2);
  });

  test("checks out the selected Buy Now item without loading or clearing the cart", async () => {
    const buyNowItems = [
      {
        product_id: 7,
        name: "Buy Now Product",
        image: "/buy-now.png",
        price: 250,
        quantity: 2,
      },
    ];

    renderCheckout([], { buyNowItems });

    expect(
      await screen.findByText("Buy Now Product")
    ).toBeInTheDocument();
    expect(getCheckoutCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("proceed-address"));
    fillAddress();
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i })
    );
    await screen.findByRole("heading", { name: /payment method/i });
    fireEvent.click(screen.getByTestId("place-order"));

    await screen.findByTestId("order-id");

    expect(createCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ product_id: 7, quantity: 2 }],
        remove_from_cart: false,
      })
    );
  });

  test("view order button navigates to order details", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByRole("heading", {
      name: /payment method/i,
    });

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    await screen.findByTestId("order-id");

    const generatedOrderId =
      screen.getByTestId("order-id")
        .textContent;

    fireEvent.click(
      screen.getByTestId("view-order")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      `/orders/${generatedOrderId}`
    );
  });

  test("continue shopping button navigates to shop after order", async () => {
    await goToAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByRole("heading", {
      name: /payment method/i,
    });

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    await screen.findByTestId("order-id");

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue shopping/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/shop"
    );
  });
});