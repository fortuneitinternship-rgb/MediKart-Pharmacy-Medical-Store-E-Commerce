import api from "../services/api";


export const getFeaturedProducts = async () => {
  const response = await api.get("/api/products/featured");

  return response.data;
};


export const getTrendingProducts = async () => {
  const response = await api.get("/api/products/trending");

  return response.data;
};


export const getFlashSaleProducts = async () => {
  const response = await api.get("/api/products/flash-sale");

  return response.data;
};


export const getNewArrivals = async () => {
  const response = await api.get("/api/products/new-arrivals");

  return response.data;
};


export const getProductDetails = async (id) => {
  const response = await api.get(`/api/products/${id}`);

  return response.data;
};