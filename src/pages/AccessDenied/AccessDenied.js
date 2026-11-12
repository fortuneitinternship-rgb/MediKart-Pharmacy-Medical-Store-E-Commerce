import React from "react";
import { Link } from "react-router-dom";
import "./AccessDenied.css";

function AccessDenied() {
  return (
    <div className="error-page">
      <h1>403</h1>

      <h2>Access Denied</h2>

      <p>
        You don't have permission to view this page.
      </p>

      <Link to="/" className="error-btn">
        Home
      </Link>
    </div>
  );
}

export default AccessDenied;