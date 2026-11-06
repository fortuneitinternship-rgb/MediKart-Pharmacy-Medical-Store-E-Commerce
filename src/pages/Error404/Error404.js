import React from "react";
import { Link } from "react-router-dom";
import "./Error404.css";

function Error404() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>
        Sorry, the page you are looking for doesn't exist.
      </p>

      <Link to="/" className="error-btn">
        Back to Home
      </Link>
    </div>
  );
}

export default Error404;