import React, { useEffect, useState } from "react";
import {
    FaFileMedical,
    FaUpload,
    FaTrash,
    FaCheckCircle,
} from "react-icons/fa";

import "./UploadPrescription.css";
import {
    getPrescriptions,
    uploadPrescription,
} from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

const UploadPrescription = () => {
    const [file, setFile] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getPrescriptions()
            .then(setPrescriptions)
            .catch((loadError) => {
                setError(getApiErrorMessage(
                    loadError,
                    "Sign in to view and upload prescriptions."
                ));
            });
    }, []);

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError("Choose a PDF, JPEG, or PNG file.");
                setFile(null);
            } else if (selectedFile.size > 10 * 1024 * 1024) {
                setError("Prescription file must be 10 MB or smaller.");
                setFile(null);
            } else {
                setError("");
                setFile(selectedFile);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const submitPrescription = async () => {
        if (!file) {
            window.alert("Please upload a prescription.");
            return;
        }

        setIsUploading(true);
        setError("");
        try {
            const savedPrescription = await uploadPrescription(file);
            setPrescriptions((current) => [savedPrescription, ...current]);
            setFile(null);
            window.alert("Prescription saved successfully.");
        } catch (uploadError) {
            setError(getApiErrorMessage(
                uploadError,
                "Unable to upload prescription. Please try again."
            ));
        } finally {
            setIsUploading(false);
        }
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
                {error && <p role="alert">{error}</p>}

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
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload Prescription"}
                </button>

                {prescriptions.length > 0 && (
                    <div className="uploaded-prescriptions">
                        <h3>Uploaded prescriptions</h3>
                        {prescriptions.map((prescription) => (
                            <p key={prescription.id}>
                                {prescription.filename}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPrescription;