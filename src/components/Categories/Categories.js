import React from "react";
import { Link } from "react-router-dom";
import "./Categories.css";

// Category Images
import medicines from "../../assets/categories/medicines.jpg";
import healthcare from "../../assets/categories/healthcare.png";
import vitamins from "../../assets/categories/vitamins.png";
import personalcare from "../../assets/categories/personalcare.png";
import babycare from "../../assets/categories/babycare.png";
import medicaldevices from "../../assets/categories/medicaldevices.png";
import eyecare from "../../assets/categories/eye-care.png";
import premiumHealthcare from "../../assets/categories/premium-healthcare.png";
import haircare from "../../assets/categories/hair-care.png";
import womencare from "../../assets/categories/womencare.png";

const categories = [
  {
    id: 1,
    name: "Medicines",
    image: medicines,
    link: "/shop/medicines",
  },
  {
    id: 2,
    name: "Healthcare",
    image: healthcare,
    link: "/shop/healthcare",
  },
  {
    id: 3,
    name: "Vitamins & Supplements",
    image: vitamins,
    link: "/shop/vitamins",
  },
  {
    id: 4,
    name: "Personal Care",
    image: personalcare,
    link: "/shop/personal-care",
  },
  {
    id: 5,
    name: "Baby Care",
    image: babycare,
    link: "/shop/baby-care",
  },
  {
    id: 6,
    name: "Medical Devices",
    image: medicaldevices,
    link: "/shop/medical-devices",
  },
  {
    id: 7,
    name: "Eye Care",
    image: eyecare,
    link: "/shop/eye-care",
  },
  {
    id: 8,
    name: "Premium Healthcare",
    image: premiumHealthcare,
    link: "/shop/premium-healthcare",
  },
  {
    id: 9,
    name: "Hair Care",
    image: haircare,
    link: "/shop/hair-care",
  },
  {
    id: 10,
    name: "Women's Health",
    image: womencare,
    link: "/shop/womencare",
  },
];

const Categories = () => {
  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Shop by Category</h1>

        <p>
          Choose a category to explore healthcare products.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.link}
            className="category-card"
          >
            <div className="category-image">
              <img
                src={category.image}
                alt={category.name}
              />
            </div>

            <h3>{category.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;