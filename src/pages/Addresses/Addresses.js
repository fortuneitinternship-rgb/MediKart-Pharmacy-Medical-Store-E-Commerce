import React, { useEffect, useState } from "react";
import {
    FaHome,
    FaPlus,
    FaTrash,
    FaMapMarkerAlt,
} from "react-icons/fa";
import "./Addresses.css";
import {
    addAddress,
    deleteAddress,
    getAddresses,
} from "../../api/addressApi";
import { getApiErrorMessage } from "../../services/api";

const Addresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address_line1: "",
        city: "",
        state: "",
        pincode: "",
        address_type: "Home",
    });

    useEffect(() => {
        getAddresses()
            .then(setAddresses)
            .catch((loadError) => {
                setError(getApiErrorMessage(
                    loadError,
                    "Sign in to manage your saved addresses."
                ));
            });
    }, []);

    const saveAddress = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const saved = await addAddress(form);
            setAddresses((current) => [...current, saved]);
            setShowForm(false);
            setForm({
                full_name: "",
                phone: "",
                address_line1: "",
                city: "",
                state: "",
                pincode: "",
                address_type: "Home",
            });
        } catch (saveError) {
            setError(getApiErrorMessage(saveError, "Unable to save this address."));
        } finally {
            setSaving(false);
        }
    };

    const removeAddress = async (id) => {
        setError("");
        try {
            await deleteAddress(id);
            setAddresses((current) =>
                current.filter((item) => item.id !== id)
            );
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "Unable to delete this address."));
        }
    };

    return (
        <div className="addresses-page">

            <div className="address-header">
                <h2>Saved Addresses</h2>

                <button
                    className="add-address-btn"
                    type="button"
                    onClick={() => setShowForm((visible) => !visible)}
                >
                    <FaPlus />
                    Add Address
                </button>
            </div>

            {error && <p role="alert">{error}</p>}

            {showForm && (
                <form className="saved-address-form" onSubmit={saveAddress}>
                    <input
                        required
                        minLength="2"
                        placeholder="Full name"
                        value={form.full_name}
                        onChange={(event) =>
                            setForm({ ...form, full_name: event.target.value })
                        }
                    />
                    <input
                        required
                        minLength="10"
                        maxLength="15"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(event) =>
                            setForm({ ...form, phone: event.target.value })
                        }
                    />
                    <input
                        required
                        minLength="3"
                        placeholder="Address"
                        value={form.address_line1}
                        onChange={(event) =>
                            setForm({ ...form, address_line1: event.target.value })
                        }
                    />
                    <input
                        required
                        minLength="2"
                        placeholder="City"
                        value={form.city}
                        onChange={(event) =>
                            setForm({ ...form, city: event.target.value })
                        }
                    />
                    <input
                        required
                        minLength="2"
                        placeholder="State"
                        value={form.state}
                        onChange={(event) =>
                            setForm({ ...form, state: event.target.value })
                        }
                    />
                    <input
                        required
                        minLength="4"
                        maxLength="10"
                        placeholder="PIN code"
                        value={form.pincode}
                        onChange={(event) =>
                            setForm({ ...form, pincode: event.target.value })
                        }
                    />
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Address"}
                    </button>
                </form>
            )}

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
                            <h3>{item.address_type}</h3>

                            <p>
                                <strong>{item.full_name}</strong>
                            </p>

                            <p>{item.phone}</p>

                            <p>
                                {[
                                    item.address_line1,
                                    item.address_line2,
                                    item.city,
                                    item.state,
                                    item.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
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