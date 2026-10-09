import React, { useEffect, useState } from "react";
import "./Reviews.css";
import { getReviews, submitReview } from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getReviews()
            .then(setReviews)
            .catch((loadError) => {
                setError(getApiErrorMessage(loadError, "Unable to load reviews."));
            });
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.name ||
            !form.product ||
            !form.review
        ) {
            alert("Please fill all fields");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const savedReview = await submitReview({
                ...form,
                rating: Number(form.rating),
            });
            setReviews((current) => [savedReview, ...current]);
            setForm({ name: "", product: "", rating: "5", review: "" });
        } catch (submitError) {
            setError(getApiErrorMessage(submitError, "Unable to submit your review."));
        } finally {
            setSubmitting(false);
        }
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
                {error && <p role="alert">{error}</p>}

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

                <button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
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