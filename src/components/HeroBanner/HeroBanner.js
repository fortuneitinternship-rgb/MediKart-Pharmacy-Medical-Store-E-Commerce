import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroBanner.css";

import banner1 from "../../assets/images/Mediction.png";
import banner2 from "../../assets/images/Mediction1.png";
import banner3 from "../../assets/images/Mediction2.png";
import banner4 from "../../assets/images/Mediction3.png";

const banners = [ banner1, banner2, banner3, banner4];

function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleShopNow = () => {
    navigate("/shop");
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section
      className="hero-banner"
      style={{
        backgroundImage: `url(${banners[currentSlide]})`,
      }}
    >
      <div className="banner-overlay">
        <div className="banner-content">
          <span className="offer-badge">
            Up To 25% OFF on Medicines
          </span>

          <h1>Your Trusted Online Pharmacy</h1>

          <p>
            Order medicines, healthcare products,
            wellness essentials, personal care items,
            and medical equipment from MediKart.
          </p>

          <div className="features">
            <span>✔ Genuine Medicines</span>
            <span>✔ Fast Delivery</span>
            <span>✔ Secure Payments</span>
            <span>✔ 24/7 Support</span>
          </div>

          <button className="shop-btn" onClick={handleShopNow} >Shop Now
          </button>
        </div>
      </div>

      <button
        className="slider-arrow left-arrow"
        onClick={handlePrevSlide}
      >
        ❮
      </button>

      <button
        className="slider-arrow right-arrow"
        onClick={handleNextSlide}
      >
        ❯
      </button>

      <div className="dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={
              currentSlide === index
                ? "dot active"
                : "dot"
            }
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;