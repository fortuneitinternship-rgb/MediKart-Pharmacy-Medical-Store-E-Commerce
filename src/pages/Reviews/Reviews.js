import React, { useState } from "react";
import "./Reviews.css";

const initialReviews = [
    {
        id: 1,
        name: "Rahul Sharma",
        rating: 5,
        product: "Paracetamol Tablets",
        review:
            "Excellent quality and very fast delivery. Highly recommended!",
    },
    {
        id: 2,
        name: "Priya Verma",
        rating: 4,
        product: "Vitamin D Capsules",
        review:
            "Good product and genuine medicines. Packaging was excellent.",
    },
    {
        id: 3,
        name: "Amit Kumar",
        rating: 5,
        product: "Blood Pressure Monitor",
        review:
            "Very accurate readings and easy to use.",
    },
    {
        id: 4,
        name: "Sneha Patel",
        rating: 5,
        product: "Face Wash",
        review:
            "Original product at an affordable price.",
    },
];

function Reviews() {
    const [reviews, setReviews] = useState(initialReviews);

    const [form, setForm] = useState({
        name: "",
        product: "",
        rating: "5",
        review: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !form.name ||
            !form.product ||
            !form.review
        ) {
            alert("Please fill all fields");
            return;
        }

        setReviews([
            {
                id: Date.now(),
                ...form,
            },
            ...reviews,
        ]);

        setForm({
            name: "",
            product: "",
            rating: "5",
            review: "",
        });

        alert("Review Added Successfully!");
    };

    return (
        <div className="reviews-page">

            <div className="reviews-header">
                <h1>Customer Reviews</h1>
                <p>
                    See what our customers say about
                    MEDIKART.
                </p>
            </div>

            <form
                className="review-form"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    placeholder="Your Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    placeholder="Product Name"
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                />

                <select
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                >
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>

                <textarea
                    rows="5"
                    placeholder="Write your review..."
                    name="review"
                    value={form.review}
                    onChange={handleChange}
                />

                <button type="submit">
                    Submit Review
                </button>

            </form>

            <div className="reviews-grid">

                {reviews.map((item) => (

                    <div
                        className="review-card"
                        key={item.id}
                    >

                        <h3>{item.name}</h3>

                        <p className="product">
                            {item.product}
                        </p>

                        <div className="stars">
                            {"⭐".repeat(item.rating)}
                        </div>

                        <p>{item.review}</p>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Reviews;