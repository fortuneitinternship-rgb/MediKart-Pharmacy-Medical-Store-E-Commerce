import React, { useState } from "react";
import "./FAQ.css";

const faqData = [
    {
        question: "How do I place an order?",
        answer:
            "Browse products, add them to your cart, proceed to checkout, enter your delivery details, and complete the payment."
    },
    {
        question: "What payment methods do you accept?",
        answer:
            "We accept UPI, Credit Cards, Debit Cards, Net Banking, Wallets, and Cash on Delivery (where available)."
    },
    {
        question: "How can I track my order?",
        answer:
            "Go to the Track Order page and enter your Order ID to check your order status."
    },
    {
        question: "Can I cancel my order?",
        answer:
            "Yes. Orders can be cancelled before they are shipped."
    },
    {
        question: "Do you sell genuine medicines?",
        answer:
            "Yes. All medicines are sourced from licensed pharmacies and trusted manufacturers."
    },
    {
        question: "How long does delivery take?",
        answer:
            "Most orders are delivered within 2–5 business days depending on your location."
    },
    {
        question: "Can I return products?",
        answer:
            "Eligible products can be returned within the return policy period."
    },
    {
        question: "How do I contact customer support?",
        answer:
            "You can contact us through the Contact page or email support@medikart.com."
    }
];

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-container">

            <div className="faq-header">
                <h1>Frequently Asked Questions</h1>

                <p>
                    Find answers to the most common questions about MEDIKART.
                </p>
            </div>

            <div className="faq-list">

                {faqData.map((faq, index) => (

                    <div
                        key={index}
                        className="faq-item"
                    >

                        <button
                            className="faq-question"
                            onClick={() => toggleFAQ(index)}
                        >
                            {faq.question}

                            <span>
                                {activeIndex === index ? "−" : "+"}
                            </span>
                        </button>

                        {activeIndex === index && (
                            <div className="faq-answer">
                                {faq.answer}
                            </div>
                        )}

                    </div>

                ))}

            </div>

        </div>
    );
}

export default FAQ;