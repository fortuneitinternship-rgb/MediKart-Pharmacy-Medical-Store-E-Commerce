
// ============================================================
// MEDIKART - ALL PRODUCTS
// ============================================================

// Medicines
import medicines from "../data/medicines.js";

// Healthcare
import healthcare from "../data/healthcare.js";

// Vitamins & Supplements
import vitamins from "../data/vitamins.js";

// Personal Care
import personalCare from "../data/personalCare.js";

// Baby Care
import babyCare from "../data/babyCare.js";

// Medical Devices
import medicalDevices from "../data/medicalDevices.js";

// Eye Care
import eyeCare from "../data/eye-care.js";

// Hair Care
import hairCare from "../data/HairCare.js";

// Women's Health
import womenCare from "../data/womensHealth.js";

// Premium Healthcare
import premiumHealthcare from "../data/premium-healthcare.js";

// ============================================================
// NORMALIZE PRODUCT DATA
// Supports arrays and objects containing products/data arrays.
// ============================================================

const getProducts = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

// ============================================================
// CATEGORY PRODUCTS
// ============================================================

export const categoryProducts = {
  medicines: getProducts(medicines),
  healthcare: getProducts(healthcare),
  vitamins: getProducts(vitamins),
  "personal-care": getProducts(personalCare),
  "baby-care": getProducts(babyCare),
  "medical-devices": getProducts(medicalDevices),
  "eye-care": getProducts(eyeCare),
  "hair-care": getProducts(hairCare),
  "women-care": getProducts(womenCare),
  "premium-healthcare": getProducts(premiumHealthcare),
};

// ============================================================
// COMBINE ALL PRODUCTS
//
// IMPORTANT:
// Do not remove products based on names or images.
// Different products may share the same image or name.
// Preserve all records from the source category arrays.
// ============================================================

const products = Object.values(categoryProducts).flat();

// ============================================================
// PRODUCT COUNT
// ============================================================

export const totalProducts = products.length;

export const categoryProductCounts = Object.fromEntries(
  Object.entries(categoryProducts).map(([category, items]) => [
    category,
    items.length,
  ])
);

// ============================================================
// DEBUG
// ============================================================

console.log("========== MEDIKART PRODUCT CATALOG ==========");

console.table(categoryProductCounts);

console.log("Total Products:", totalProducts);

console.log("All Products:", products);

console.log("==============================================");

// ============================================================
// EXPORT
// ============================================================

export default products;
