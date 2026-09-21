import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Address from "./Address";

// ======================================================
// MOCK REACT ROUTER
// ======================================================

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ======================================================
// MOCK REACT-LEAFLET
// ======================================================

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),

  TileLayer: (props) => (
    <div data-testid="tile-layer" {...props} />
  ),

  Marker: ({ position }) => (
    <div
      data-testid="map-marker"
      data-position={JSON.stringify(position)}
    />
  ),

  useMap: () => ({
    flyTo: jest.fn(),
  }),

  useMapEvents: () => ({}),
}));

// ======================================================
// MOCK LEAFLET
// ======================================================

jest.mock("leaflet", () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
      },
      mergeOptions: jest.fn(),
    },
  },
}));

// ======================================================
// TEST SETUP
// ======================================================

describe("Address Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.clear();

    global.alert = jest.fn();

    global.fetch = jest.fn();

    Object.defineProperty(window, "navigator", {
      writable: true,
      value: {
        ...window.navigator,
        geolocation: {
          getCurrentPosition: jest.fn(),
        },
      },
    });
  });

  // ======================================================
  // BASIC RENDERING
  // ======================================================

  test("renders the address page", () => {
    render(<Address />);

    expect(
      screen.getByText("Choose Your Location")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Search for area, street, city..."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /search/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /use my current location/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /save address/i,
      })
    ).toBeInTheDocument();
  });

  // ======================================================
  // MAP RENDERING
  // ======================================================

  test("renders the map", () => {
    render(<Address />);

    expect(
      screen.getByTestId("map-container")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("tile-layer")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("map-marker")
    ).toBeInTheDocument();
  });

  // ======================================================
  // SEARCH INPUT
  // ======================================================

  test("updates search input", () => {
    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    expect(input).toHaveValue("Delhi");
  });

  // ======================================================
  // EMPTY SEARCH
  // ======================================================

  test("shows alert when searching with empty input", async () => {
    render(<Address />);

    const searchButton = screen.getByRole("button", {
      name: /search/i,
    });

    fireEvent.click(searchButton);

    expect(global.alert).toHaveBeenCalledWith(
      "Please enter an address."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  // ======================================================
  // SUCCESSFUL ADDRESS SEARCH
  // ======================================================

  test("searches address successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [
        {
          lat: "28.6139",
          lon: "77.2090",
          display_name: "Delhi, India",
        },
      ],
    });

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Delhi, India")
      ).toBeInTheDocument();
    });
  });

  // ======================================================
  // ADDRESS NOT FOUND
  // ======================================================

  test("shows alert when address is not found", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [],
    });

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Invalid Location",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      })
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Location not found. Please try another address."
      );
    });
  });

  // ======================================================
  // SEARCH API ERROR
  // ======================================================

  test("handles search API error", async () => {
    global.fetch.mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      })
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Unable to find this location. Please try again."
      );
    });
  });

  // ======================================================
  // ENTER KEY SEARCH
  // ======================================================

  test("searches address when Enter is pressed", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [
        {
          lat: "28.6139",
          lon: "77.2090",
          display_name: "Delhi, India",
        },
      ],
    });

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  // ======================================================
  // CURRENT LOCATION SUCCESS
  // ======================================================

  test("gets current location successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        display_name: "Current Location",
      }),
    });

    navigator.geolocation.getCurrentPosition.mockImplementationOnce(
      (success) => {
        success({
          coords: {
            latitude: 28.6139,
            longitude: 77.2090,
          },
        });
      }
    );

    render(<Address />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /use my current location/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Current Location")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText(
        "Search for area, street, city..."
      )
    ).toHaveValue("Current Location");
  });

  // ======================================================
  // GEOLOCATION ERROR
  // ======================================================

  test("handles geolocation error", async () => {
    navigator.geolocation.getCurrentPosition.mockImplementationOnce(
      (success, error) => {
        error({
          message: "Permission denied",
        });
      }
    );

    render(<Address />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /use my current location/i,
      })
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Unable to get your location. Please allow location permission."
      );
    });
  });

  // ======================================================
  // REVERSE GEOCODING ERROR
  // ======================================================

  test("handles current location reverse geocoding error", async () => {
    global.fetch.mockRejectedValueOnce(
      new Error("Reverse geocoding failed")
    );

    navigator.geolocation.getCurrentPosition.mockImplementationOnce(
      (success) => {
        success({
          coords: {
            latitude: 28.6139,
            longitude: 77.2090,
          },
        });
      }
    );

    render(<Address />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /use my current location/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(global.alert).not.toHaveBeenCalled();
  });

  // ======================================================
  // SAVE WITHOUT ADDRESS
  // ======================================================

  test("shows alert when saving without an address", () => {
    render(<Address />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /save address/i,
      })
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Please select a location first."
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ======================================================
  // SAVE ADDRESS
  // ======================================================

  test("saves selected address successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [
        {
          lat: "28.6139",
          lon: "77.2090",
          display_name: "Delhi, India",
        },
      ],
    });

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Delhi, India")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save address/i,
      })
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Address saved successfully!"
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/account"
    );

    const saved = JSON.parse(
      localStorage.getItem("selectedAddress")
    );

    expect(saved).toEqual({
      address: "Delhi, India",
      latitude: 28.6139,
      longitude: 77.209,
    });
  });

  // ======================================================
  // LOAD SAVED ADDRESS
  // ======================================================

  test("loads saved address from localStorage", async () => {
    const savedAddress = {
      address: "Saved Location",
      latitude: 28.6139,
      longitude: 77.209,
    };

    localStorage.setItem(
      "selectedAddress",
      JSON.stringify(savedAddress)
    );

    render(<Address />);

    await waitFor(() => {
      expect(
        screen.getByText("Saved Address")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Latitude: 28.613900/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Longitude: 77.209000/)
    ).toBeInTheDocument();
  });

  // ======================================================
  // SAVED ADDRESS UPDATES POSITION
  // ======================================================

  test("loads saved coordinates into the map marker", async () => {
    const savedAddress = {
      address: "Saved Location",
      latitude: 28.6139,
      longitude: 77.209,
    };

    localStorage.setItem(
      "selectedAddress",
      JSON.stringify(savedAddress)
    );

    render(<Address />);

    await waitFor(() => {
      const marker = screen.getByTestId(
        "map-marker"
      );

      expect(marker).toHaveAttribute(
        "data-position",
        JSON.stringify([28.6139, 77.209])
      );
    });
  });

  // ======================================================
  // BACK BUTTON
  // ======================================================

  test("navigates back when back button is clicked", () => {
    render(<Address />);

    const buttons = screen.getAllByRole("button");

    const backButton = buttons[0];

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // ======================================================
  // SAVE BUTTON DISPLAYS SAVED CARD
  // ======================================================

  test("displays saved address card after saving", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [
        {
          lat: "28.6139",
          lon: "77.2090",
          display_name: "Delhi, India",
        },
      ],
    });

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Delhi, India")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save address/i,
      })
    );

    expect(
      screen.getByText("Saved Address")
    ).toBeInTheDocument();
  });

  // ======================================================
  // DEFAULT SELECTED LOCATION MESSAGE
  // ======================================================

  test("shows default selected location message initially", () => {
    render(<Address />);

    expect(
      screen.getByText(
        "Search for an address or tap on the map to select a location."
      )
    ).toBeInTheDocument();
  });

  // ======================================================
  // SEARCH BUTTON LOADING STATE
  // ======================================================

  test("shows loading state while searching", async () => {
    let resolveFetch;

    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(<Address />);

    const input = screen.getByPlaceholderText(
      "Search for area, street, city..."
    );

    fireEvent.change(input, {
      target: {
        value: "Delhi",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: "...",
      })
    ).toBeDisabled();

    resolveFetch({
      json: async () => [
        {
          lat: "28.6139",
          lon: "77.2090",
          display_name: "Delhi, India",
        },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /search/i,
        })
      ).not.toBeDisabled();
    });
  });

  // ======================================================
  // LOCATION LOADING STATE
  // ======================================================

  test("shows location loading state", () => {
    navigator.geolocation.getCurrentPosition.mockImplementationOnce(
      () => { }
    );

    render(<Address />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /use my current location/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /getting location/i,
      })
    ).toBeDisabled();
  });
});