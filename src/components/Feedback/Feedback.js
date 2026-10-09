import React, { useState } from "react";
import {
    FaStar,
    FaTimes,
} from "react-icons/fa";

import "./Feedback.css";
import { submitOrderFeedback } from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

const FeedbackPopup = ({ order, onClose }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }

        const orderId = order?.orderId || order?.order_id;
        if (!orderId) {
            setError("The order could not be identified.");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await submitOrderFeedback({
                order_id: String(orderId),
                rating,
                feedback,
            });
            try {
                localStorage.setItem(
                    `feedbackSubmitted_${orderId}`,
                    "true"
                );
            } catch (storageError) {
                console.error(
                    "Feedback was saved but local status could not be cached:",
                    storageError
                );
            }
            closePopup();
        } catch (submitError) {
            setError(getApiErrorMessage(
                submitError,
                "Unable to submit feedback. Please try again."
            ));
        } finally {
            setSubmitting(false);
        }
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
                    {error && <p role="alert">{error}</p>}

                </div>

                {/* ==========================
            BUTTONS
        ========================== */}

                <div className="feedback-buttons">

                    <button
                        type="button"
                        className="later-button"
                        disabled={submitting}
                        onClick={handleMaybeLater}
                    >
                        Maybe Later
                    </button>

                    <button
                        type="button"
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default FeedbackPopup;