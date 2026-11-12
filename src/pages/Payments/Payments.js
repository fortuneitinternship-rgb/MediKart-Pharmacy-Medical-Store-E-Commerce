import React, { useState } from "react";
import {
    FaCreditCard,
    FaUniversity,
    FaWallet,
    FaMoneyBillWave,
    FaPlus,
} from "react-icons/fa";
import "./Payments.css";

const initialPayments = [
    {
        id: 1,
        type: "Credit Card",
        holder: "Test Holder",
        number: "**** **** **** 0000",
        iconType: "card",
    },
    {
        id: 2,
        type: "UPI",
        holder: "test@upi",
        number: "",
        iconType: "upi",
    },
    {
        id: 3,
        type: "Net Banking",
        holder: "Test Bank",
        number: "",
        iconType: "bank",
    },
];

const getPaymentIcon = (iconType) => {
    switch (iconType) {
        case "card":
            return <FaCreditCard />;

        case "upi":
            return <FaWallet />;

        case "bank":
            return <FaUniversity />;

        default:
            return <FaCreditCard />;
    }
};

const Payments = () => {
    const [payments, setPayments] = useState(initialPayments);

    const removePayment = (id) => {
        const updated = payments.filter(
            (item) => item.id !== id
        );

        setPayments(updated);

        // Only plain serializable data is stored.
        localStorage.setItem(
            "payments",
            JSON.stringify(updated)
        );
    };

    return (
        <div className="payments-page">

            <div className="payments-header">
                <h2>Saved Payment Methods</h2>

                <button
                    className="add-btn"
                    type="button"
                >
                    <FaPlus />
                    Add Payment Method
                </button>
            </div>

            {payments.length === 0 ? (
                <div className="empty-payment">
                    <FaMoneyBillWave />

                    <h3>
                        No Payment Methods Found
                    </h3>
                </div>
            ) : (
                payments.map((item) => (
                    <div
                        className="payment-card"
                        key={item.id}
                    >

                        <div className="payment-icon">
                            {getPaymentIcon(item.iconType)}
                        </div>

                        <div className="payment-details">

                            <h3>
                                {item.type}
                            </h3>

                            <p>
                                {item.holder}
                            </p>

                            {item.number && (
                                <p>
                                    {item.number}
                                </p>
                            )}

                        </div>

                        <button
                            className="remove-btn"
                            type="button"
                            onClick={() =>
                                removePayment(item.id)
                            }
                        >
                            Remove
                        </button>

                    </div>
                ))
            )}

        </div>
    );
};

export default Payments;