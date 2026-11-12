/**
 * COMPREHENSIVE PRODUCTS DATABASE
 * Contains all products from all categories
 * 
 * Categories Included:
 * - Medicines (50 products, ID: 1-50)
 * - Vitamins & Supplements (50 products, ID: 1-50)
 * - Hair Care (50 products, ID: 1101-1150)
 * - Healthcare (50 products, ID: 1-50)
 * - Medical Devices (50 products, ID: 1-50)
 * - Personal Care (50 products, ID: 1-50)
 * - Premium Healthcare (50 products, ID: 1501-1550)
 * - Women's Health (50 products, ID: 1401-1450)
 * - Baby Care (50+ products, ID: 1-100)
 * - Eye Care (50 products, ID: 1001-1050)
 * 
 * Total: 450+ products
 */

import medicinesData from "./medicines";
import vitaminsData from "./vitamins";
import hairCareData from "./HairCare";
import healthcareData from "./healthcare";
import medicalDevicesData from "./medicalDevices";
import personalCareData from "./personalCare";
import premiumHealthcareData from "./premium-healthcare";
import womensHealthData from "./womensHealth";
import babyCareData from "./babyCare";
import eyeCareData from "./eye-care";
import womensHealthDara from "./womensHealth";
import premiumHealthcareData from "./premiumHealthcare";

/**
 * Master products array combining all categories
 * Used for:
 * - Main shop page showing all products
 * - Search functionality across all products
 * - Product discovery
 */
const products = [
  ...medicinesData,
  ...vitaminsData,
  ...hairCareData,
  ...healthcareData,
  ...medicalDevicesData,
  ...personalCareData,
  ...premiumHealthcareData,
  ...womensHealthData,
  ...babyCareData,
  ...eyeCareData,
  ...premiumHealthcareData,
];

/**
 * STRUCTURE OF EACH PRODUCT OBJECT:
 * 
 * {
 *   id: number,                    // Unique identifier
 *   name: string,                  // Product name
 *   brand: string,                 // Brand/manufacturer
 *   category: string,              // Category name
 *   price: number,                 // Current selling price (₹)
 *   rating: number,                // Rating (0-5)
 *   image: string,                 // Image path
 *   [originalPrice]: number,       // Original price (optional, for discount)
 *   [discount]: number,            // Discount percentage (optional)
 *   [reviews]: number,             // Number of reviews (optional)
 *   [packSize]: string,            // Package size (optional)
 *   [expiry]: string,              // Expiry period (optional)
 *   [delivery]: string,            // Delivery time (optional)
 *   [returnPolicy]: string,        // Return policy (optional)
 *   [stock]: boolean,              // Stock availability (optional)
 *   [description]: string          // Product description (optional)
 * }
 */

/**
 * CATEGORY DETAILS:
 * 
 * 1. MEDICINES (IDs: 1-50)
 *    - Price Range: ₹28 - ₹250
 *    - Products: Dolo 650, Crocin, Paracetamol, Antibiotics, etc.
 *    - Rating: 4.5 - 4.8
 * 
 * 2. VITAMINS & SUPPLEMENTS (IDs: 1-50)
 *    - Price Range: ₹30 - ₹1150
 *    - Products: Revital, Limcee, Zincovit, Shelcal, etc.
 *    - Rating: 4.7 - 4.9
 * 
 * 3. HAIR CARE (IDs: 1101-1150)
 *    - Price Range: ₹249 - ₹1999
 *    - Products: Shampoo, Hair Oil, Conditioner, etc.
 *    - Rating: 4.6 - 5.0
 * 
 * 4. HEALTHCARE (IDs: 1-50)
 *    - Price Range: ₹40 - ₹999
 *    - Products: Hand Sanitizer, Antiseptic, Cotton, Gauze, etc.
 *    - Rating: 4.5 - 4.9
 * 
 * 5. MEDICAL DEVICES (IDs: 1-50)
 *    - Price Range: ₹99 - ₹2999
 *    - Products: Thermometer, BP Monitor, Glucose Meter, etc.
 *    - Rating: 4.6 - 4.9
 * 
 * 6. PERSONAL CARE (IDs: 1-50)
 *    - Price Range: ₹40 - ₹399
 *    - Products: Soap, Shampoo, Face Wash, Sunscreen, etc.
 *    - Rating: 4.6 - 4.9
 * 
 * 7. PREMIUM HEALTHCARE (IDs: 1501-1550)
 *    - Price Range: ₹699 - ₹5999
 *    - Products: Premium devices, wellness kits, etc.
 *    - Rating: 4.8 - 5.0
 * 
 * 8. Women's Health (IDs: 1401-1450)
 *    - Price Range: ₹199 - ₹4999
 *    - Products: CBC, Blood Sugar, HbA1c, Wellness Packages, etc.
 *    - Rating: 4.7 - 5.0
 * 
 * 9. BABY CARE (IDs: 1-100+)
 *    - Price Range: ₹65 - ₹999
 *    - Products: Baby Soap, Lotion, Diapers, Feeding Bottles, etc.
 *    - Rating: 4.6 - 4.9
 * 
 * 10. EYE CARE (IDs: 1001-1050)
 *     - Price Range: ₹120 - ₹1499
 *     - Products: Eye Drops, Glasses, Eye Masks, etc.
 *     - Rating: 4.4 - 5.0
 */

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {array} Products in that category
 */
export const getProductsByCategory = (category) => {
  return products.filter(
    (product) =>
      product.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Search products by keyword
 * @param {string} keyword - Search term
 * @returns {array} Matching products
 */
export const searchProducts = (keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerKeyword) ||
      product.brand.toLowerCase().includes(lowerKeyword) ||
      product.category.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {object} Product object or null
 */
export const getProductById = (id) => {
  return products.find((product) => product.id === id) || null;
};

/**
 * Get products sorted by price
 * @param {string} order - 'asc' for low to high, 'desc' for high to low
 * @returns {array} Sorted products
 */
export const sortByPrice = (order = "asc") => {
  const sorted = [...products];
  return order === "asc"
    ? sorted.sort((a, b) => a.price - b.price)
    : sorted.sort((a, b) => b.price - a.price);
};

/**
 * Get products sorted by rating
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} Sorted products
 */
export const sortByRating = (order = "desc") => {
  const sorted = [...products];
  return order === "asc"
    ? sorted.sort((a, b) => a.rating - b.rating)
    : sorted.sort((a, b) => b.rating - a.rating);
};

/**
 * Get top-rated products
 * @param {number} limit - Number of products to return
 * @returns {array} Top-rated products
 */
export const getTopRatedProducts = (limit = 10) => {
  return [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

/**
 * Get products within price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {array} Products in price range
 */
export const getProductsByPriceRange = (minPrice, maxPrice) => {
  return products.filter(
    (product) =>
      product.price >= minPrice && product.price <= maxPrice
  );
};

/**
 * Get all unique categories
 * @returns {array} Array of category names
 */
export const getAllCategories = () => {
  const categories = new Set(products.map((p) => p.category));
  return Array.from(categories).sort();
};

/**
 * Get product count by category
 * @returns {object} Object with category names and product counts
 */
export const getProductCountByCategory = () => {
  const counts = {};
  products.forEach((product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
  });
  return counts;
};

/**
 * Get trending/featured products
 * Products with rating >= 4.8
 * @returns {array} Trending products
 */
export const getTrendingProducts = () => {
  return products.filter((product) => product.rating >= 4.8);
};

export default products;
