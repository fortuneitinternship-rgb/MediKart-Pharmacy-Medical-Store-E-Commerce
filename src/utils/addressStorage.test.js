import {
  saveAddress,
  getAddress,
  removeAddress,
  getDefaultAddress,
} from "./addressStorage";

describe("addressStorage Utility", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("returns null when no address is saved", () => {
    expect(getAddress()).toBeNull();
  });

  test("saves address to localStorage", () => {
    const address = {
      name: "John Doe",
      mobile: "9876543210",
      address: "123 Main Street",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
      lat: 17.385,
      lng: 78.4867,
    };

    saveAddress(address);

    expect(getAddress()).toEqual(address);
  });

  test("removes address from localStorage", () => {
    const address = {
      name: "John Doe",
      mobile: "9876543210",
      address: "123 Main Street",
    };

    saveAddress(address);

    removeAddress();

    expect(getAddress()).toBeNull();
  });

  test("returns default address", () => {
    const defaultAddress = getDefaultAddress();

    expect(defaultAddress).toEqual({
      name: "Satender Kashyap",
      mobile: "+91 98765 43210",
      address: "Select your delivery location",
      city: "",
      state: "",
      pincode: "",
      lat: null,
      lng: null,
    });
  });

  test("dispatches addressUpdated event when saving address", () => {
    const eventListener = jest.fn();

    window.addEventListener(
      "addressUpdated",
      eventListener
    );

    saveAddress({
      name: "John Doe",
      mobile: "9876543210",
      address: "123 Main Street",
    });

    expect(eventListener).toHaveBeenCalled();

    window.removeEventListener(
      "addressUpdated",
      eventListener
    );
  });

  test("dispatches addressUpdated event when removing address", () => {
    const eventListener = jest.fn();

    window.addEventListener(
      "addressUpdated",
      eventListener
    );

    removeAddress();

    expect(eventListener).toHaveBeenCalled();

    window.removeEventListener(
      "addressUpdated",
      eventListener
    );
  });

  test("getAddress returns the saved address object", () => {
    const address = {
      name: "Alice",
      mobile: "9999999999",
      address: "456 Park Road",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    };

    localStorage.setItem(
      "deliveryAddress",
      JSON.stringify(address)
    );

    expect(getAddress()).toEqual(address);
  });
});