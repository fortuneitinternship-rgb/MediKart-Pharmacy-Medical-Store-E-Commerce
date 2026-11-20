import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import MobileMenu from "./MobileMenu";
import Login from "../Login/Login";

function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="navbar">

        <Logo />

        {/* Desktop */}
        <div className="navbar-desktop">
          <NavLinks />
          <SearchBar />
          <UserActions onLoginClick={() => setShowLogin(true)} />
        </div>

        {/* Mobile */}
        <div className="navbar-mobile">

          <button
            className="search-btn-mobile"
            onClick={() => setShowSearch(true)}
            aria-label="Search"
          >
            <FiSearch />
          </button>

          <MobileMenu />

        </div>

      </nav>

      {/* Login Popup */}
      {showLogin && (
        <div
          className="popup-overlay"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-popup"
              onClick={() => setShowLogin(false)}
            >
              ✕
            </button>

            <Login
              onLoginSuccess={() => setShowLogin(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Search Popup */}
      {showSearch && (
        <>
          <div
            className="search-overlay"
            onClick={() => setShowSearch(false)}
          ></div>

          <div className="search-popup">
            <button
              className="close-search"
              onClick={() => setShowSearch(false)}
            >
              ✕
            </button>

            <SearchBar />
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;