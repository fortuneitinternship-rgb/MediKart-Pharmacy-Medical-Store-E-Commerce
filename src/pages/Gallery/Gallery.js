import React from "react";
import "./Gallery.css";

import img1 from "../../assets/categories/medicines.jpg";
import img2 from "../../assets/categories/healthcare.png";
import img3 from "../../assets/categories/personalcare.png";
import img4 from "../../assets/categories/medicaldevices.png";
import img5 from "../../assets/categories/babycare.png";
import img6 from "../../assets/categories/eye-care.png";
import img7 from "../../assets/categories/hair-care.png";
import img8 from "../../assets/categories/premium-healthcare.png";
const galleryImages = [
    {
        id: 1,
        image: img1,
        title: "Medicines",
    },
    {
        id: 2,
        image: img2,
        title: "Healthcare",
    },
    {
        id: 3,
        image: img3,
        title: "Personal Care",
    },
    {
        id: 4,
        image: img4,
        title: "Medical Devices",
    },
    {
        id: 5,
        image: img5,
        title: "Baby Care",
    },
    {
        id: 6,
        image: img6,
        title: "Eye Care",
    },
    {
        id: 7,
        image: img7,
        title: "Hair Care",
    },
    {
        id: 8,
        image: img8,
        title: "Premium Healthcare",
    },
];

function Gallery() {
    return (
        <div className="gallery-container">

            <div className="gallery-header">
                <h1>MEDIKART Gallery</h1>

                <p>
                    Explore our premium healthcare products and services.
                </p>
            </div>

            <div className="gallery-grid">

                {galleryImages.map((item) => (

                    <div
                        className="gallery-card"
                        key={item.id}
                    >

                        <img
                            src={item.image}
                            alt={item.title}
                        />

                        <div className="gallery-overlay">
                            <h3>{item.title}</h3>
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Gallery;