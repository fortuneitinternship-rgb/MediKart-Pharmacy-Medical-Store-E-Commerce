import React from "react";
import { Link } from "react-router-dom";
import styles from "./EmptyState.module.css";

const EmptyState = ({ image, title, description, buttonText, buttonLink = "/products",}) => {
  return (
    <div className={styles.emptyState}>
      <img
        src={image}
        alt={title}
        className={styles.image}
      />

      <h2 className={styles.title}>{title}</h2>

      <p className={styles.description}>
        {description}
      </p>

      <Link to={buttonLink} className={styles.button}>
        {buttonText}
      </Link>
    </div>
  );
};

export default EmptyState;