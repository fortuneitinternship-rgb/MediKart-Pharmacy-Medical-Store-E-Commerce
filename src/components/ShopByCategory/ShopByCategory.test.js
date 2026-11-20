import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ShopByCategory from "./ShopByCategory";

describe("ShopByCategory Component", () => {
  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ShopByCategory {...props} />
      </MemoryRouter>
    );
  };

  // 1. Check heading
  test("renders Shop by Category heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /shop by category/i,
      })
    ).toBeInTheDocument();
  });

  // 2. Check View All link
  test("renders View All link", () => {
    renderComponent();

    const viewAll = screen.getByRole("link", {
      name: /view all/i,
    });

    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveAttribute("href", "/categories");
  });

  // 3. Check first 4 categories by default
  test("shows only 4 categories by default", () => {
    renderComponent();

    expect(
      screen.getByText("Medicines")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Vitamins & Supplements")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Personal Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Baby Care")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Medical Devices")
    ).not.toBeInTheDocument();
  });

  // 4. Check More Categories button
  test("does not show More Categories button by default", () => {
    renderComponent();

    expect(
      screen.queryByRole("button", {
        name: /more categories/i,
      })
    ).not.toBeInTheDocument();
  });

  // 5. Check More Categories button when prop is true
  test("shows More Categories button when showMoreButton is true", () => {
    renderComponent({
      showMoreButton: true,
    });

    expect(
      screen.getByRole("button", {
        name: /more categories/i,
      })
    ).toBeInTheDocument();
  });

  // 6. Check all categories after clicking More Categories
  test("shows all categories after clicking More Categories", () => {
    renderComponent({
      showMoreButton: true,
    });

    const moreButton = screen.getByRole("button", {
      name: /more categories/i,
    });

    fireEvent.click(moreButton);

    expect(
      screen.getByText("Medicines")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Vitamins & Supplements")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Personal Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Baby Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Medical Devices")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Healthcare")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Eye Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Premium Healthcare")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Hair Care")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Women's Health")
    ).toBeInTheDocument();
  });

  // 7. More Categories button disappears after clicking
  test("hides More Categories button after showing all categories", () => {
    renderComponent({
      showMoreButton: true,
    });

    const moreButton = screen.getByRole("button", {
      name: /more categories/i,
    });

    fireEvent.click(moreButton);

    expect(
      screen.queryByRole("button", {
        name: /more categories/i,
      })
    ).not.toBeInTheDocument();
  });

  // 8. Check all category images
  test("renders correct category images", () => {
    renderComponent({
      showMoreButton: true,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /more categories/i,
      })
    );

    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(10);

    expect(
      screen.getByAltText("Medicines")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Vitamins & Supplements")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Personal Care")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Baby Care")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Medical Devices")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Healthcare")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Eye Care")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Premium Healthcare")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Hair Care")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Women's Health")
    ).toBeInTheDocument();
  });

  // 9. Check Medicines link
  test("Medicines has correct link", () => {
    renderComponent();

    const medicinesLink = screen.getByRole("link", {
      name: /medicines/i,
    });

    expect(medicinesLink).toHaveAttribute(
      "href",
      "/shop/medicines"
    );
  });

  // 10. Check Vitamins link
  test("Vitamins has correct link", () => {
    renderComponent();

    const vitaminsLink = screen.getByRole("link", {
      name: /vitamins & supplements/i,
    });

    expect(vitaminsLink).toHaveAttribute(
      "href",
      "/shop/vitamins"
    );
  });

  // 11. Check Personal Care link
  test("Personal Care has correct link", () => {
    renderComponent();

    const personalCareLink = screen.getByRole("link", {
      name: /personal care/i,
    });

    expect(personalCareLink).toHaveAttribute(
      "href",
      "/shop/personal-care"
    );
  });

  // 12. Check category cards
  test("category cards should contain links", () => {
    renderComponent();

    const links = screen.getAllByRole("link");

    // 4 category links + View All
    expect(links).toHaveLength(5);
  });

  // 13. Check all 10 category links
  test("all categories have valid links", () => {
    renderComponent({
      showMoreButton: true,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /more categories/i,
      })
    );

    const links = screen.getAllByRole("link");

    // 10 categories + View All
    expect(links).toHaveLength(11);

    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });
  });
});