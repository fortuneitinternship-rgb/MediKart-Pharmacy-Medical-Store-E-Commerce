import api from "../services/api";

export const addAddress = async (addressData) => {
  const response = await api.post("/api/addresses", addressData);
  return response.data;
};

export const getAddresses = async () => {
  const response = await api.get("/api/addresses");
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/api/addresses/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/api/addresses/${id}`);
  return response.data;
};