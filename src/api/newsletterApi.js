import api from "../services/api";


export const subscribeNewsletter = async (email) => {
  try {
    const response = await api.post("/api/newsletter/subscribe", {
      email: email.trim(),
    });

    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      throw new Error(
        detail.map((item) => item.msg).join(", ")
      );
    }

    throw new Error(
      detail || "Unable to subscribe to the newsletter."
    );
  }
};