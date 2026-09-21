import React from "react";
import "./NoInternet.css";

function NoInternet() {
  return (
    <div className="error-page">
      <h1>📶</h1>

      <h2>No Internet Connection</h2>

      <p>
        Please check your network and try again.
      </p>

      <button
        className="error-btn"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}

export default NoInternet;