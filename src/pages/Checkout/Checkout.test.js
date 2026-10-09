import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Checkout from "./Checkout";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

describe("Checkout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

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

  const renderCheckout = (cart = []) => {
    localStorage.setItem("cart", JSON.stringify(cart));

    return render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );
  };

  const minimalCart = [
    {
      id: 1,
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

    expect(
      screen.getByTestId("quantity-1")
    ).toHaveTextContent("2");

    fireEvent.click(
      screen.getByTestId("decrease-1")
    );

    expect(
      screen.getByTestId("quantity-1")
    ).toHaveTextContent("1");
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

    expect(
      JSON.parse(localStorage.getItem("cart"))
    ).toEqual([]);
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

  test("selects card payment method", async () => {
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

    expect(
      screen.getByPlaceholderText("Card Number")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("MM/YY")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("CVV")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Card Holder Name"
      )
    ).toBeInTheDocument();
  });

  test("selects net banking payment method", async () => {
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

    expect(
      screen.getByRole("combobox")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Select Bank",
      })
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

    jest.useFakeTimers();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    expect(
      screen.getByText("Placing Your Order...")
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Order Placed Successfully!"
        )
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("order-id")
    ).toHaveTextContent(/^MK\d{10}$/);

    expect(
      localStorage.getItem("cart")
    ).toBeNull();

    expect(
      localStorage.getItem("orders")
    ).not.toBeNull();
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

    jest.useFakeTimers();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("order-id")
      ).toBeInTheDocument();
    });

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

    jest.useFakeTimers();

    fireEvent.click(
      screen.getByTestId("place-order")
    );

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("order-id")
      ).toBeInTheDocument();
    });

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