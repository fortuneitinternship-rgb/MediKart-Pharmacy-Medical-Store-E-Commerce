import React, { useState } from "react";
import {
    FaHeartbeat,
    FaNotesMedical,
    FaCalendarAlt,
    FaTrash,
    FaPlus,
} from "react-icons/fa";
import "./HealthRecords.css";

const HealthRecords = () => {
    const [records, setRecords] = useState([
        {
            id: 1,
            title: "Blood Test",
            hospital: "Apollo Hospital",
            doctor: "Dr. Sharma",
            date: "05 Aug 2026",
            status: "Completed",
        },
        {
            id: 2,
            title: "Eye Checkup",
            hospital: "AIIMS",
            doctor: "Dr. Verma",
            date: "18 Jul 2026",
            status: "Completed",
        },
        {
            id: 3,
            title: "Diabetes Check",
            hospital: "Fortis Hospital",
            doctor: "Dr. Singh",
            date: "12 Jun 2026",
            status: "Pending",
        },
    ]);

    const deleteRecord = (id) => {
        const updated = records.filter((record) => record.id !== id);
        setRecords(updated);
        localStorage.setItem(
            "healthRecords",
            JSON.stringify(updated)
        );
    };

    return (
        <div className="health-page">
            <div className="health-header">
                <h2>Health Records</h2>

                <button className="add-record-btn">
                    <FaPlus />
                    Add Record
                </button>
            </div>

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
                                {record.date}
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
                            onClick={() => deleteRecord(record.id)}
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