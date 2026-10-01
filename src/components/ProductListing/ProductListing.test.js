import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductListing from "./ProductListing";

jest.mock("../ProductCard/ProductCard", () => ({ product }) => (
  <div>{product.name}</div>
));

jest.mock("../../data/products", () => [
  {
    id: 1,
    name: "Dolo 650",
    category: "Medicine",
    price: 30,
    rating: 4.7,
    image: "/images/dolo.jpg",
  },
  {
    id: 2,
    name: "Crocin",
    category: "Medicine",
    price: 45,
    rating: 4.5,
    image: "/images/crocin.jpg",
  },
  {
    id: 3,
    name: "Revital",
    category: "Vitamin",
    price: 350,
    rating: 4.8,
    image: "/images/revital.jpg",
  },
  {
    id: 4,
    name: "Vitamin C",
    category: "Vitamin",
    price: 250,
    rating: 4.6,
    image: "/images/vitaminc.jpg",
  },
  {
    id: 5,
    name: "BP Monitor",
    category: "Equipment",
    price: 1999,
    rating: 4.9,
    image: "/images/bpmonitor.jpg",
  },
  {
    id: 6,
    name: "Glucometer",
    category: "Equipment",
    price: 1299,
    rating: 4.4,
    image: "/images/glucometer.jpg",
  },
]);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("ProductListing", () => {
  test("shows loading initially", () => {
    render(<ProductListing />);

    expect(
      screen.getByText(/Loading Products/i)
    ).toBeInTheDocument();
  });

  test("renders products after loading", async () => {
    render(<ProductListing />);

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(await screen.findByText("Dolo 650")).toBeInTheDocument();
    expect(screen.getByText("Crocin")).toBeInTheDocument();
  });

  test("search filters products", async () => {
    render(<ProductListing />);

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    const input = screen.getByPlaceholderText(
      /Search products or categories/i
    );

    fireEvent.change(input, {
      target: { value: "Crocin" },
    });

    expect(screen.getByText("Crocin")).toBeInTheDocument();

    expect(
      screen.queryByText("Dolo 650")
    ).not.toBeInTheDocument();
  });

  test("clear search restores products", async () => {
    render(<ProductListing />);

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    const input = screen.getByPlaceholderText(
      /Search products or categories/i
    );

    fireEvent.change(input, {
      target: { value: "Crocin" },
    });

    // eslint-disable-next-line testing-library/no-node-access
    const clearButton = document.querySelector("svg");

    fireEvent.click(clearButton);

    expect(input.value).toBe("Crocin");

    expect(screen.getByText("Crocin")).toBeInTheDocument();
  });

  test("loads more products when Load More is clicked", async () => {
    render(<ProductListing />);

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    const button = await screen.findByRole("button", {
      name: /load more/i,
    });

    fireEvent.click(button);

    expect(
      await screen.findByText("BP Monitor")
    ).toBeInTheDocument();
  });

  test("shows no products found for invalid search", async () => {
    render(<ProductListing />);

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    const input = screen.getByPlaceholderText(
      /Search products or categories/i
    );

    fireEvent.change(input, {
      target: { value: "abcdefxyz" },
    });

    expect(
      screen.getByText(/No Products Found/i)
    ).toBeInTheDocument();
  });
});