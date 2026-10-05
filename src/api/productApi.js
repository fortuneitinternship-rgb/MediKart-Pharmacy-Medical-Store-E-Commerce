import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000";


export const getFeaturedProducts = async () => {
  const response = await axios.get(
    `${API_URL}/api/products/featured`
  );

  return response.data;
};


export const getTrendingProducts = async () => {
  const response = await axios.get(
    `${API_URL}/api/products/trending`
  );

  return response.data;
};


export const getFlashSaleProducts = async () => {
  const response = await axios.get(
    `${API_URL}/api/products/flash-sale`
  );

  return response.data;
};


export const getNewArrivals = async () => {
  const response = await axios.get(
    `${API_URL}/api/products/new-arrivals`
  );

  return response.data;
};


export const getProductDetails = async (id) => {
  const response = await axios.get(
    `${API_URL}/api/products/${id}`
  );

  return response.data;
};