// Import all category data files
import medicines from "../data/medicines";
import vitamins from "../data/vitamins";
import personalCare from "../data/personalCare";
import babyCare from "../data/babyCare";
import medicalDevices from "../data/medicalDevices";
import healthcare from "../data/healthcare";
import eyeCare from "../data/eye-care";
import premiumHealthcare from "../data/premium-healthcare";
import hairCare from "../data/HairCare";
import womensHealth from "../data/womensHealth";

// Map category slugs to their corresponding data and display names
export const categoryDataMap = {
  medicines: {
    data: medicines,
    name: "Medicines"
  },
  vitamins: {
    data: vitamins,
    name: "Vitamins & Supplements"
  },
  "personal-care": {
    data: personalCare,
    name: "Personal Care"
  },
  "baby-care": {
    data: babyCare,
    name: "Baby Care"
  },
  "medical-devices": {
    data: medicalDevices,
    name: "Medical Devices"
  },
  healthcare: {
    data: healthcare,
    name: "Healthcare"
  },
  "eye-care": {
    data: eyeCare,
    name: "Eye Care"
  },
  "premium-healthcare": {
    data: premiumHealthcare,
    name: "Premium Healthcare"
  },
  "hair-care": {
    data: hairCare,
    name: "Hair Care"
  },
  "women-care": {
    data: womensHealth,
    name: "Women's Health"
  }
};

export const getCategoryData = (categorySlug) => {
  return categoryDataMap[categorySlug] || null;
};

export const getCategoryProducts = (categorySlug) => {
  const category = categoryDataMap[categorySlug];
  return category ? category.data : [];
};

export const getCategoryName = (categorySlug) => {
  const category = categoryDataMap[categorySlug];
  return category ? category.name : "Products";
};
