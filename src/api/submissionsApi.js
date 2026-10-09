import api from "../services/api";

export const submitContactMessage = async (message) => {
    const response = await api.post("/api/contact/messages", message);
    return response.data;
};

export const getReviews = async () => {
    const response = await api.get("/api/reviews");
    return response.data;
};

export const submitReview = async (review) => {
    const response = await api.post("/api/reviews", review);
    return response.data;
};

export const submitOrderFeedback = async (feedback) => {
    const response = await api.post("/api/feedback", feedback);
    return response.data;
};

export const uploadPrescription = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/prescriptions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getPrescriptions = async () => {
    const response = await api.get("/api/prescriptions");
    return response.data;
};

export const getHealthRecords = async () => {
    const response = await api.get("/api/health-records");
    return response.data;
};

export const addHealthRecord = async (record) => {
    const response = await api.post("/api/health-records", record);
    return response.data;
};

export const deleteHealthRecord = async (recordId) => {
    const response = await api.delete(`/api/health-records/${recordId}`);
    return response.data;
};
