import React from "react";
import {FaPlus,FaMinus,FaTrash,FaStar,} from "react-icons/fa";

import styles from "./CartItem.module.css";

const CartItem = ({ item, onIncrease, onDecrease, onRemove,}) => {
  return (
    <div className={styles.card}>
      {/* Product Image */}
      <div className={styles.imageBox}>
        <img src={item.image} alt={item.name} className={styles.image} />
      </div>

      {/* Product Details */}
      <div className={styles.details}>
        <h2 className={styles.name}> {item.name} </h2>

        {item.category && (
          <p className={styles.category}> {item.category} </p>
        )}

        <div className={styles.rating}>
          <FaStar className={styles.star} />
          <span>{item.rating || 4.8}</span>
        </div>

        <h3 className={styles.price}> ₹{Number(item.price ?? item.discountedPrice ?? 0).toLocaleString()} </h3>

        {/* Quantity */}
        <div className={styles.quantity}>
          <button
            onClick={() => onDecrease(item.id)}
            disabled = {(Number(item.quantity) || 1) === 1}
            className={styles.qtyBtn}
          >
            <FaMinus />
          </button>

          <span className={styles.qty}> {item.quantity || 1} </span>

          <button onClick={() => onIncrease(item.id)} className={styles.qtyBtn} >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className={styles.right}>
        <h2 className={styles.total}>
          ₹ {((Number(item.price ?? item.discountedPrice) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
        </h2>

        <button className={styles.removeBtn} onClick={() => onRemove(item.id)}> <FaTrash /> Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;