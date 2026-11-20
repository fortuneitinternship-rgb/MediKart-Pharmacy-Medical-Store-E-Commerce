import React, {useState} from "react";
import { Link } from "react-router-dom";
import "./ShopByCategory.css";

import medicines from "../../assets/categories/medicines.jpg";
import healthcare from "../../assets/categories/healthcare.png";
import vitamins from "../../assets/categories/vitamins.png";
import personalcare from "../../assets/categories/personalcare.png";
import babycare from "../../assets/categories/babycare.png";
import medicaldevices from "../../assets/categories/medicaldevices.png";
import eyecare from "../../assets/categories/eye-care.png";
import PremiumHealthcare from "../../assets/categories/premium-healthcare.png";
import HairCare from "../../assets/categories/hair-care.png";
import womencare from "../../assets/categories/womencare.png";

const categories = [
  {
    id: 1,
    name: "Medicines",
    image: medicines,
    link: "/shop/medicines"
  },
  {
    id: 2,
    name: "Vitamins & Supplements",
    image: vitamins,
    link: "/shop/vitamins"
  },
  {
    id: 3,
    name: "Personal Care",
    image: personalcare,
    link: "/shop/personal-care"
  },
  {
    id: 4,
    name: "Baby Care",
    image: babycare,
    link: "/shop/baby-care"
  },
  {
    id: 5,
    name: "Medical Devices",
    image: medicaldevices,
    link: "/shop/medical-devices"
  },
  {
    id: 6,
    name: "Healthcare",
    image: healthcare,
    link: "/shop/healthcare"
  },
  {
    id: 7,
    name: "Eye Care",
    image: eyecare,
    link: "/shop/eye-care"
  },
  {
    id: 8,
    name: "Premium Healthcare",
    image: PremiumHealthcare,
    link: "/shop/premium-healthcare"
  },
  {
    id: 9,
    name: "Hair Care",
    image: HairCare,
    link: "/shop/hair-care"
  },
  {
    id: 10,
    name: "Women's Health",
    image: womencare,
    link: "/shop/women-care"
  }
];


function ShopByCategory({ showMoreButton = false }) {

  const [showAll, setShowAll] = useState(false);
  
  const displayedCategories = showAll ? categories : categories.slice(0, 4);


  return (
    <section className="shop-category">
      <div className="category-header">
        <h2>Shop by Category</h2>
        <Link to="/categories">View All</Link>
      </div>

      <div className="category-grid">
        {displayedCategories.map((category) => (
          <Link
            to={category.link}
            className="category-card"
            key={category.id}
          >
            <div className="category-image">
              <img src={category.image} alt={category.name} />
            </div>
            <h3>{category.name}</h3>
          </Link>
        ))}
      </div>
      {showMoreButton && !showAll && (
        <div className="more-button-container">
          <button
            className="more-btn"
            onClick={() => setShowAll(true)}
          >
            More Categories
          </button>
        </div>
      )}
    </section>
  );
}


export default ShopByCategory;