import api from "./api";

export const testBackend = async () => {
    const response = await api.get("/test");
    return response.data;
};