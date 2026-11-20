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

// Lab Tests
import labTests from "../data/womensHealth.js";

// Premium Healthcare
import premiumHealthcare from "../data/premium-healthcare.js";

// Wellness

// ============================================================
// COMBINE ALL PRODUCTS
// ============================================================

const catalogProducts = [
  ...medicines,
  ...healthcare,
  ...vitamins,
  ...personalCare,
  ...babyCare,
  ...medicalDevices,
  ...eyeCare,
  ...hairCare,
  ...labTests,
  ...premiumHealthcare,
];

const normalizeProductValue = (value) =>
  String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();

const productNames = new Set();
const productImages = new Set();
const products = catalogProducts.filter((product) => {
  const name = normalizeProductValue(product.name);
  const image = normalizeProductValue(product.image);
  if (
    !name ||
    productNames.has(name) ||
    (image && productImages.has(image))
  ) {
    return false;
  }
  productNames.add(name);
  if (image) {
    productImages.add(image);
  }
  return true;
});

// ============================================================
// EXPORT
// ============================================================

export default products;