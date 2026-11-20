import React, { useState } from "react";
import {
    FaSearch,
    FaShoppingBag,
    FaPills,
    FaTruck,
    FaCreditCard,
    FaUser,
    FaChevronDown,
    FaPhoneAlt,
    FaEnvelope,
    FaComments,
} from "react-icons/fa";

import "./Help.css";

const Help = () => {
    const [search, setSearch] = useState("");
    const [openFaq, setOpenFaq] = useState(null);

    const categories = [
        {
            icon: <FaShoppingBag />,
            title: "Orders",
            text: "Track, cancel or manage your orders",
        },
        {
            icon: <FaPills />,
            title: "Medicines",
            text: "Get help with medicines and prescriptions",
        },
        {
            icon: <FaTruck />,
            title: "Delivery",
            text: "Check delivery status and information",
        },
        {
            icon: <FaCreditCard />,
            title: "Payments",
            text: "Payment and refund related queries",
        },
        {
            icon: <FaUser />,
            title: "Account",
            text: "Manage your Medikart account",
        },
    ];

    const faqs = [
        {
            question: "How can I place an order?",
            answer:
                "Browse medicines or healthcare products, add the required products to your cart and click Checkout. Enter your delivery details and select your preferred payment method.",
        },
        {
            question: "How can I track my order?",
            answer:
                "Go to your Orders section and select the order you want to track. You can view the current order status and delivery information there.",
        },
        {
            question: "Can I cancel my order?",
            answer:
                "Yes, you can cancel an eligible order from the Orders section before it reaches the shipping stage.",
        },
        {
            question: "How long does delivery take?",
            answer:
                "Delivery time depends on your location and the selected delivery option. You can see the estimated delivery date during checkout.",
        },
        {
            question: "How can I reset my password?",
            answer:
                "On the Login page, click Forgot Password and follow the instructions to reset your password.",
        },
        {
            question: "What payment methods are available?",
            answer:
                "Medikart can support multiple payment methods such as UPI, cards, net banking and Cash on Delivery, depending on availability.",
        },
        {
            question: "How can I contact Medikart support?",
            answer:
                "You can contact our support team through phone, email or live chat using the contact options available on this page.",
        },
    ];

    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase())
    );

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="help-page">
            {/* Header */}
            <section className="help-header">
                <h1>How can we help you?</h1>
                <p>
                    Find answers to your questions or get in touch with Medikart Support.
                </p>

                <div className="help-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </section>

            {/* Help Categories */}
            <section className="help-container">
                <h2>How can we help?</h2>

                <div className="help-categories">
                    {categories.map((category, index) => (
                        <div className="help-category-card" key={index}>
                            <div className="help-category-icon">
                                {category.icon}
                            </div>

                            <div>
                                <h3>{category.title}</h3>
                                <p>{category.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>

                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <div className="faq-item" key={index}>
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>

                                    <FaChevronDown
                                        className={openFaq === index ? "faq-arrow open" : "faq-arrow"}
                                    />
                                </button>

                                {openFaq === index && (
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-faq">
                            <p>No results found for "{search}"</p>
                        </div>
                    )}
                </div>

                {/* Contact Support */}
                <section className="contact-support">
                    <h2>Still need help?</h2>
                    <p>
                        Our support team is ready to help you with your Medikart
                        experience.
                    </p>

                    <div className="support-options">
                        <div className="support-card">
                            <div className="support-icon">
                                <FaPhoneAlt />
                            </div>

                            <h3>Call Us</h3>
                            <p>Mon - Sat, 9 AM - 8 PM</p>

                            <a href="tel:+91 98765 43210">
                                +91 98765 43210
                            </a>
                        </div>

                        <div className="support-card">
                            <div className="support-icon">
                                <FaEnvelope />
                            </div>

                            <h3>Email Us</h3>
                            <p>We usually reply within 24 hours</p>

                            <a href="mailto:support@medikart.com">
                                support@medikart.com
                            </a>
                        </div>

                        <div className="support-card">
                            <div className="support-icon">
                                <FaComments />
                            </div>

                            <h3>Live Chat</h3>
                            <p>Chat with our support team</p>

                            <button
                                className="chat-button"
                                onClick={() => alert("Live chat coming soon!")}
                            >
                                Start Chat
                            </button>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
};

export default Help;