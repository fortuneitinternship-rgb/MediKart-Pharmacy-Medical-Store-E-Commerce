import axios from "axios";

export const getApiErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
        return detail
            .map((item) => item.msg || String(item))
            .join(", ");
    }
    if (typeof detail === "string") {
        return detail;
    }
    return fallback;
};

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

export const getStoredAccessToken = () => {
    return [
        localStorage.getItem("access_token"),
        localStorage.getItem("accessToken"),
        localStorage.getItem("token"),
    ]
        .map((token) => token?.replace(/^\s*Bearer\s+/i, "").trim())
        .find(Boolean) || "";
};

export const clearAuthSession = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
};

api.interceptors.request.use(
    (config) => {
        const token = getStoredAccessToken();

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = "Bearer " + token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthSession();
        }

        return Promise.reject(error);
    }
);

export default api;
