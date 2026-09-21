import React, { useState } from "react";
import "./ProductGallery.css";

// Import Images
import product1 from "../../assets/products/product1.png";
import product2 from "../../assets/products/product2.png";
import product3 from "../../assets/products/product3.png";
import product4 from "../../assets/products/product4.png";
import product5 from "../../assets/products/product5.png";
import product6 from "../../assets/products/product6.png";
import product7 from "../../assets/products/product7.png";
import product8 from "../../assets/products/product8.png";

const defaultImages = [product1, product2, product3, product4, product5, product6, product7, product8];

const ProductGallery = ({ images = [] }) => {
  const galleryImages = images.length ? images : defaultImages;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = galleryImages[selectedIndex] || galleryImages[0];

  return (
    <div className="gallery">
      <div className="main-image-container">
        <img
          src={selectedImage}
          alt="Product"
          className="main-image"
        />
      </div>

      {galleryImages.length > 1 && (
        <div className="thumbnails">
          {galleryImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index}`}
              className={`thumbnail ${selectedIndex === index ? "active" : ""}`}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;