import React, { useState } from "react";
import Footer from "../../components/Footer/Footer";
import {
    FaGift,
    FaTag,
    FaCopy,
    FaPercent,
} from "react-icons/fa";
import "./Offers.css";

const Offers = () => {
    const [offers] = useState([
        {
            id: 1,
            title: "Flat 20% OFF",
            code: "MEDI20",
            description: "Get 20% OFF on medicines above ₹999.",
            expiry: "31 Dec 2026",
        },
        {
            id: 2,
            title: "Free Delivery",
            code: "FREEDEL",
            description: "Free delivery on orders above ₹499.",
            expiry: "30 Sep 2026",
        },
        {
            id: 3,
            title: "₹200 Cashback",
            code: "CASH200",
            description: "Get ₹200 cashback using UPI payments.",
            expiry: "15 Oct 2026",
        },
        {
            id: 4,
            title: "Buy 1 Get 1 Free",
            code: "B1G1",
            description: "Applicable on selected healthcare products.",
            expiry: "20 Nov 2026",
        },
    ]);

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Coupon Code "${code}" Copied!`);
    };

    return (
        <div className="offers-page">
            <div className="offers-header">
                <h2>
                    <FaGift />
                    MEDIKART Offers & Coupons
                </h2>

                <p>Save more on every order.</p>
            </div>

            <div className="offers-grid">
                {offers.map((offer) => (
                    <div className="offer-card" key={offer.id}>

                        <div className="offer-icon">
                            <FaPercent />
                        </div>

                        <h3>{offer.title}</h3>

                        <p>{offer.description}</p>

                        <div className="coupon-box">
                            <FaTag />
                            <span>{offer.code}</span>
                        </div>

                        <small>Valid Till: {offer.expiry}</small>

                        <button
                            className="copy-btn"
                            onClick={() => copyCode(offer.code)}
                        >
                            <FaCopy />
                            Copy Code
                        </button>

                    </div>
                ))}
            </div><Footer/>
        </div>
    );
};

export default Offers;