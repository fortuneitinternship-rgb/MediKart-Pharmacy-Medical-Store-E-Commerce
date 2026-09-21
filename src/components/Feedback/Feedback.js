import React, { useState } from "react";
import {
    FaStar,
    FaTimes,
} from "react-icons/fa";

import "./Feedback.css";

const FeedbackPopup = ({ order, onClose }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    // ==============================
    // SAFE CLOSE FUNCTION
    // ==============================

    const closePopup = () => {
        if (typeof onClose === "function") {
            onClose();
        }
    };

    // ==============================
    // MAYBE LATER
    // ==============================

    const handleMaybeLater = () => {
        // Do NOT save submitted status.
        // Therefore popup can appear again next time.

        closePopup();
    };

    // ==============================
    // SUBMIT FEEDBACK
    // ==============================

    const handleSubmit = () => {
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }

        const oldFeedback =
            JSON.parse(
                localStorage.getItem("feedbacks")
            ) || [];

        const newFeedback = {
            id: Date.now(),

            orderId:
                order?.orderId || "N/A",

            rating: rating,

            feedback: feedback,

            date: new Date().toLocaleString(),
        };

        // Save feedback
        localStorage.setItem(
            "feedbacks",
            JSON.stringify([
                ...oldFeedback,
                newFeedback,
            ])
        );

        // Mark feedback as submitted
        if (order?.orderId) {
            localStorage.setItem(
                `feedbackSubmitted_${order.orderId}`,
                "true"
            );
        }

        // CLOSE POPUP
        closePopup();
    };

    return (
        <div className="feedback-overlay">

            <div className="feedback-popup">

                {/* ==========================
            CLOSE X
        ========================== */}

                <button
                    type="button"
                    className="feedback-close"
                    onClick={handleMaybeLater}
                    aria-label="Close"
                >
                    <FaTimes />
                </button>

                {/* ==========================
            HEADER
        ========================== */}

                <div className="feedback-header">

                    <div className="feedback-icon">
                        ⭐
                    </div>

                    <h2>
                        How was your order?
                    </h2>

                    <p>
                        Order #
                        {order?.orderId || "N/A"}
                    </p>

                    <span>
                        Your feedback helps us
                        improve MEDIKART.
                    </span>

                </div>

                {/* ==========================
            RATING
        ========================== */}

                <div className="rating-section">

                    <h3>
                        Rate your experience
                    </h3>

                    <div className="feedback-stars">

                        {[1, 2, 3, 4, 5].map(
                            (star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={
                                        star <= rating
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        setRating(star)
                                    }
                                >
                                    <FaStar />
                                </button>
                            )
                        )}

                    </div>

                    <p className="rating-text">

                        {rating === 0 &&
                            "Tap a star to rate"}

                        {rating === 1 &&
                            "Very Poor"}

                        {rating === 2 &&
                            "Poor"}

                        {rating === 3 &&
                            "Average"}

                        {rating === 4 &&
                            "Good"}

                        {rating === 5 &&
                            "Excellent"}

                    </p>

                </div>

                {/* ==========================
            REVIEW
        ========================== */}

                <div className="review-section">

                    <h3>
                        Write a review
                        <span>
                            {" "} (Optional)
                        </span>
                    </h3>

                    <textarea
                        value={feedback}
                        onChange={(e) =>
                            setFeedback(e.target.value)
                        }
                        placeholder="Tell us about your order experience..."
                        maxLength={500}
                    />

                    <div className="character-count">
                        {feedback.length}/500
                    </div>

                </div>

                {/* ==========================
            BUTTONS
        ========================== */}

                <div className="feedback-buttons">

                    <button
                        type="button"
                        className="later-button"
                        onClick={handleMaybeLater}
                    >
                        Maybe Later
                    </button>

                    <button
                        type="button"
                        className="submit-button"
                        onClick={handleSubmit}
                    >
                        Submit Feedback
                    </button>

                </div>

            </div>

        </div>
    );
};

export default FeedbackPopup;