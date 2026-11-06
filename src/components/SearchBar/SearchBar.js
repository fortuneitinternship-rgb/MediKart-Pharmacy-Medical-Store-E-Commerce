import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaHistory, FaTimes } from "react-icons/fa";
import "./SearchBar.module.css";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(history);
  }, []);

  // Hide history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Save search on Enter
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const value = searchTerm.trim();

      if (!value) return;

      let updatedHistory = searchHistory.filter(
        (item) => item.toLowerCase() !== value.toLowerCase()
      );

      updatedHistory.unshift(value);

      if (updatedHistory.length > 10) {
        updatedHistory = updatedHistory.slice(0, 10);
      }

      setSearchHistory(updatedHistory);

      localStorage.setItem(
        "searchHistory",
        JSON.stringify(updatedHistory)
      );

      setShowHistory(false);
    }
  };

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          onFocus={() => setShowHistory(true)}
        />

        {searchTerm && (
          <button
            className="clear-btn"
            onClick={() => setSearchTerm("")}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {showHistory && searchHistory.length > 0 && (
        <div className="history-dropdown">
          <div className="history-header">
            <span>Recent Searches</span>

            <button onClick={clearHistory}>
              Clear
            </button>
          </div>

          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => {
                setSearchTerm(item);
                setShowHistory(false);
              }}
            >
              <FaHistory className="history-icon" />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;