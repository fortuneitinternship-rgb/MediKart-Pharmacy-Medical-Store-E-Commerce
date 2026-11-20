import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "./SearchBar";

describe("SearchBar Component", () => {
  let searchTerm;
  let setSearchTerm;

  beforeEach(() => {
    searchTerm = "";
    setSearchTerm = jest.fn();

    localStorage.clear();
  });

  test("renders search input", () => {
    render(
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    );

    expect(
      screen.getByPlaceholderText("Search medicines...")
    ).toBeInTheDocument();
  });

  test("calls setSearchTerm when typing", () => {
    render(
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    );

    const input = screen.getByPlaceholderText("Search medicines...");

    fireEvent.change(input, {
      target: { value: "Crocin" },
    });

    expect(setSearchTerm).toHaveBeenCalledWith("Crocin");
  });

  test("shows clear button when searchTerm exists", () => {
    render(
      <SearchBar
        searchTerm="Dolo"
        setSearchTerm={setSearchTerm}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("clears input when clear button is clicked", () => {
    render(
      <SearchBar
        searchTerm="Crocin"
        setSearchTerm={setSearchTerm}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(setSearchTerm).toHaveBeenCalledWith("");
  });

  test("saves search history on Enter key", () => {
    render(
      <SearchBar
        searchTerm="Paracetamol"
        setSearchTerm={setSearchTerm}
      />
    );

    const input = screen.getByPlaceholderText("Search medicines...");

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    const history = JSON.parse(
      localStorage.getItem("searchHistory")
    );

    expect(history).toContain("Paracetamol");
  });

  test("loads search history from localStorage", () => {
    localStorage.setItem(
      "searchHistory",
      JSON.stringify(["Crocin", "Dolo"])
    );

    render(
      <SearchBar
        searchTerm=""
        setSearchTerm={setSearchTerm}
      />
    );

    const input = screen.getByPlaceholderText("Search medicines...");

    fireEvent.focus(input);

    expect(screen.getByText("Crocin")).toBeInTheDocument();
    expect(screen.getByText("Dolo")).toBeInTheDocument();
  });

  test("selects history item on click", () => {
    localStorage.setItem(
      "searchHistory",
      JSON.stringify(["Vitamin C"])
    );

    render(
      <SearchBar
        searchTerm=""
        setSearchTerm={setSearchTerm}
      />
    );

    fireEvent.focus(
      screen.getByPlaceholderText("Search medicines...")
    );

    fireEvent.click(screen.getByText("Vitamin C"));

    expect(setSearchTerm).toHaveBeenCalledWith("Vitamin C");
  });

  test("clears search history", () => {
    localStorage.setItem(
      "searchHistory",
      JSON.stringify(["Crocin"])
    );

    render(
      <SearchBar
        searchTerm=""
        setSearchTerm={setSearchTerm}
      />
    );

    fireEvent.focus(
      screen.getByPlaceholderText("Search medicines...")
    );

    fireEvent.click(screen.getByText("Clear"));

    expect(localStorage.getItem("searchHistory")).toBeNull();
  });

  test("does not save empty search", () => {
    render(
      <SearchBar
        searchTerm="   "
        setSearchTerm={setSearchTerm}
      />
    );

    const input = screen.getByPlaceholderText("Search medicines...");

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    expect(localStorage.getItem("searchHistory")).toBeNull();
  });
});