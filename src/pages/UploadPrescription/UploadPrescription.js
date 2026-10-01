import React, { useState } from "react";
import {
    FaFileMedical,
    FaUpload,
    FaTrash,
    FaCheckCircle,
} from "react-icons/fa";

import "./UploadPrescription.css";

const UploadPrescription = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0) {
            setFile(selectedFiles[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const submitPrescription = () => {
        if (!file) {
            window.alert("Please upload a prescription.");
            return;
        }

        window.alert("Prescription uploaded successfully!");
    };

    return (
        <div className="upload-page">
            <div className="upload-card">
                <FaFileMedical className="upload-icon" />

                <h2>Upload Prescription</h2>

                <p>
                    Upload your doctor's prescription to order
                    medicines easily from MEDIKART.
                </p>

                <label className="upload-box">
                    <FaUpload />
                    <span>Choose Prescription</span>

                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                    />
                </label>

                {file && (
                    <div className="selected-file">
                        <FaCheckCircle className="success-icon" />

                        <div>
                            <h4>{file.name}</h4>

                            <p>
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>

                        <button
                            type="button"
                            className="delete-file"
                            aria-label="Delete selected file"
                            onClick={removeFile}
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    className="submit-btn"
                    onClick={submitPrescription}
                >
                    Upload Prescription
                </button>
            </div>
        </div>
    );
};

export default UploadPrescription;