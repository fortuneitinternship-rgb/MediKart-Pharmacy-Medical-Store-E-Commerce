import React, { useEffect, useState } from "react";
import {
    FaHeartbeat,
    FaNotesMedical,
    FaCalendarAlt,
    FaTrash,
    FaPlus,
} from "react-icons/fa";
import "./HealthRecords.css";
import {
    addHealthRecord,
    deleteHealthRecord,
    getHealthRecords,
} from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

const HealthRecords = () => {
    const [records, setRecords] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        hospital: "",
        doctor: "",
        record_date: "",
        status: "Completed",
    });

    useEffect(() => {
        getHealthRecords()
            .then(setRecords)
            .catch((loadError) => {
                setError(getApiErrorMessage(
                    loadError,
                    "Sign in to view your health records."
                ));
            });
    }, []);

    const saveRecord = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const record = await addHealthRecord(form);
            setRecords((current) => [record, ...current]);
            setForm({
                title: "",
                hospital: "",
                doctor: "",
                record_date: "",
                status: "Completed",
            });
            setShowForm(false);
        } catch (saveError) {
            setError(getApiErrorMessage(saveError, "Unable to save this health record."));
        } finally {
            setSaving(false);
        }
    };

    const removeRecord = async (id) => {
        setError("");
        try {
            await deleteHealthRecord(id);
            setRecords((current) =>
                current.filter((record) => record.id !== id)
            );
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "Unable to delete this health record."));
        }
    };

    return (
        <div className="health-page">
            <div className="health-header">
                <h2>Health Records</h2>

                <button
                    className="add-record-btn"
                    type="button"
                    onClick={() => setShowForm((visible) => !visible)}
                >
                    <FaPlus />
                    Add Record
                </button>
            </div>

            {error && <p role="alert">{error}</p>}

            {showForm && (
                <form className="health-record-form" onSubmit={saveRecord}>
                    <input
                        required
                        placeholder="Record title"
                        value={form.title}
                        onChange={(event) =>
                            setForm({ ...form, title: event.target.value })
                        }
                    />
                    <input
                        required
                        placeholder="Hospital or clinic"
                        value={form.hospital}
                        onChange={(event) =>
                            setForm({ ...form, hospital: event.target.value })
                        }
                    />
                    <input
                        required
                        placeholder="Doctor"
                        value={form.doctor}
                        onChange={(event) =>
                            setForm({ ...form, doctor: event.target.value })
                        }
                    />
                    <input
                        required
                        type="date"
                        value={form.record_date}
                        onChange={(event) =>
                            setForm({ ...form, record_date: event.target.value })
                        }
                    />
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Record"}
                    </button>
                </form>
            )}

            {records.length === 0 ? (
                <div className="empty-record">
                    <FaHeartbeat />
                    <h3>No Health Records Found</h3>
                </div>
            ) : (
                records.map((record) => (
                    <div className="record-card" key={record.id}>
                        <div className="record-icon">
                            <FaNotesMedical />
                        </div>

                        <div className="record-details">
                            <h3>{record.title}</h3>

                            <p>
                                <strong>Hospital:</strong> {record.hospital}
                            </p>

                            <p>
                                <strong>Doctor:</strong> {record.doctor}
                            </p>

                            <p>
                                <FaCalendarAlt />
                                {" "}
                                {new Date(record.record_date).toLocaleDateString("en-IN")}
                            </p>

                            <span
                                className={
                                    record.status === "Completed"
                                        ? "status completed"
                                        : "status pending"
                                }
                            >
                                {record.status}
                            </span>
                        </div>

                        <button
                            className="delete-record-btn"
                            onClick={() => removeRecord(record.id)}
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

export default HealthRecords;