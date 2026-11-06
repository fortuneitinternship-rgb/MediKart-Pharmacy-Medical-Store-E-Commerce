import React, { useState } from "react";
import "./ProductGallery.css";
import {
  fallbackProductImage,
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";

const ProductGallery = ({ images = [], productName, category }) => {
  const galleryImages = images.length
    ? images.map((image) => getProductImage(image, productName, category))
    : [
        getProductImage(null, productName, category) ||
          fallbackProductImage,
      ];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = galleryImages[selectedIndex] || galleryImages[0];

  return (
    <div className="gallery">
      <div className="main-image-container">
        <img
          src={selectedImage}
          alt={productName || "Product"}
          className="main-image"
          onError={(event) =>
            handleProductImageError(event, productName, category)
          }
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
              onError={(event) =>
                handleProductImageError(event, productName, category)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;