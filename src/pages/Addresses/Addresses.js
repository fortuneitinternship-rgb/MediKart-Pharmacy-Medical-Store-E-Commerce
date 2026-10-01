import React, { useState } from "react";
import {
    FaHome,
    FaPlus,
    FaTrash,
    FaMapMarkerAlt,
} from "react-icons/fa";
import "./Addresses.css";

const Addresses = () => {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: "Home",
            person: "Satender Kashyap",
            phone: "+91 9876543210",
            address:
                "House No. 123, ABC Colony, New Delhi, Delhi - 110001",
        },
        {
            id: 2,
            name: "Office",
            person: "Satender Kashyap",
            phone: "+91 9876543210",
            address:
                "Medikart Pvt. Ltd., Sector 62, Noida, Uttar Pradesh - 201309",
        },
    ]);

    const removeAddress = (id) => {
        const updated = addresses.filter((item) => item.id !== id);
        setAddresses(updated);
        localStorage.setItem("addresses", JSON.stringify(updated));
    };

    return (
        <div className="addresses-page">

            <div className="address-header">
                <h2>Saved Addresses</h2>

                <button className="add-address-btn">
                    <FaPlus />
                    Add Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="empty-address">
                    <FaMapMarkerAlt />
                    <h3>No Address Found</h3>
                </div>
            ) : (
                addresses.map((item) => (
                    <div className="address-card" key={item.id}>

                        <div className="address-icon">
                            <FaHome />
                        </div>

                        <div className="address-details">
                            <h3>{item.name}</h3>

                            <p>
                                <strong>{item.person}</strong>
                            </p>

                            <p>{item.phone}</p>

                            <p>{item.address}</p>
                        </div>

                        <button
                            className="delete-btn"
                            onClick={() => removeAddress(item.id)}
                        >
                            <FaTrash />
                            Delete
                        </button>

                    </div>
                ))
            )}
        </div>
    );
};

export default Addresses;