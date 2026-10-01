import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import FeaturedProducts from "./FeaturedProducts";


// Mock CSS
jest.mock("./FeaturedProducts.css", () => ({}));


// Mock product images
jest.mock("../assets/vitamins/immunity-booster.png", () => "image1");
jest.mock("../assets/vitamins/vitamin-d3.png", () => "image2");
jest.mock("../assets/hairCare/hair7.png", () => "image3");
jest.mock("../assets/EyeCare/eye17.png", () => "image4");


// Mock react-toastify
jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("react-toastify/dist/ReactToastify.css", () => ({}));


describe("FeaturedProducts Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });


  test("renders Featured Products heading", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Featured Products")
    ).toBeInTheDocument();
  });


  test("renders featured products section", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        "Discover our most popular healthcare products"
      )
    ).toBeInTheDocument();
  });


  test("renders product cards", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const productCards =
      document.querySelectorAll(".product-card");

    expect(productCards.length).toBe(4);
  });


  test("renders product images", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const images =
      document.querySelectorAll(".product-image");

    expect(images.length).toBe(4);
  });


  test("renders View Details buttons", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const viewButtons =
      screen.getAllByText("View Details");

    expect(viewButtons.length).toBe(4);
  });


  test("renders Add to Cart buttons", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const cartButtons =
      screen.getAllByText("Add to Cart");

    expect(cartButtons.length).toBe(4);
  });


  test("View Details buttons contain product links", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const links =
      screen.getAllByText("View Details");

    expect(links.length).toBe(4);

    links.forEach((link) => {
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href");
    });
  });


  test("adds item to localStorage when Add to Cart is clicked", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0]).toHaveProperty("quantity", 1);
  });


  test("dispatches cartUpdated event when item is added", () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.any(Event)
    );
  });


  test("changes button text after adding item", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);

    expect(
      screen.getByText("✓ Added")
    ).toBeInTheDocument();
  });


  test("adds another item when another cart button is clicked", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(2);
  });


  test("increases quantity when same item is added again", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);

    const addedButton =
      screen.getByText("✓ Added");

    fireEvent.click(addedButton);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart[0]).toHaveProperty("quantity", 2);
  });


  test("uses existing cart from localStorage", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          id: "existing",
          quantity: 1,
        },
      ])
    );

    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart.length).toBe(2);
  });


  test("shows Add to Cart buttons initially", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    expect(
      screen.getAllByText("Add to Cart").length
    ).toBe(4);
  });


  test("resets Added button after timeout", async () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const buttons =
      screen.getAllByText("Add to Cart");

    fireEvent.click(buttons[0]);

    expect(
      screen.getByText("✓ Added")
    ).toBeInTheDocument();

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(
        screen.getAllByText("Add to Cart").length
      ).toBe(4);
    });

    jest.useRealTimers();
  });


  test("renders the products grid", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    expect(
      document.querySelector(".products-grid")
    ).toBeInTheDocument();
  });


  test("renders button group for each card", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const groups =
      document.querySelectorAll(".button-group");

    expect(groups.length).toBe(4);
  });


  test("renders product information sections", () => {
    render(
      <MemoryRouter>
        <FeaturedProducts />
      </MemoryRouter>
    );

    const infoSections =
      document.querySelectorAll(".product-info");

    expect(infoSections.length).toBe(4);
  });
});
