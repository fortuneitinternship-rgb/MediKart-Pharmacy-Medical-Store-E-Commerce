import React from "react";
import { Link } from "react-router-dom";
import "./Error500.css";

function Error500() {
  return (
    <div className="error-page">
      <h1>500</h1>
      <h2>Internal Server Error</h2>

      <p>
        Something went wrong on our server.
      </p>

      <Link to="/" className="error-btn">
        Go Home
      </Link>
    </div>
  );
}

export default Error500;
