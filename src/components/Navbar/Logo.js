import React from "react";
import logo from "../../assets/Medikart-logo.png";
import './Logo.css';
function Logo() {
  return (
    <div className="logo-container">
      <img src={logo} alt="Medikart Logo" className="logo" />
      <h2 className="brand-name">MediKart</h2>
    </div>
  );
}

export default Logo;