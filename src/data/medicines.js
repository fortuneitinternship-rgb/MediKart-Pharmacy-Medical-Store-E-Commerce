// medicines.js

import dolo650 from "../assets/medicines/Debo650.jpg";
import crocin from "../assets/medicines/crocin.jpg";
import paracetamol from "../assets/medicines/paracetamol.jpg";
import azithral from "../assets/medicines/azithral.png";
import amoxycillin from "../assets/medicines/amoxycillin.png";
import pantocid from "../assets/medicines/pantocid.png";
import omez from "../assets/medicines/omez.png";
import limcee from "../assets/medicines/limcee.jpg";
import revital from "../assets/medicines/revital.png";
import benadryl from "../assets/medicines/benadryl.png";
import cetirizine from "../assets/medicines/cetirizine.png";
import electral from "../assets/medicines/electral.png";
import volini from "../assets/medicines/volini.png";
import digene from "../assets/medicines/digene.png";
import gelusil from "../assets/medicines/gelusil.png";
import allegra from "../assets/medicines/allegra.png";
import sinarest from "../assets/medicines/sinarest.png";
import calpol from "../assets/medicines/calpol.png";
import disprin from "../assets/medicines/disprin.png";
import zincovit from "../assets/medicines/zincovit.png";

const medicines = [
  {
    id: 350,
    name: "Dolo 650 Tablet",
    brand: "Micro Labs",
    category: "Medicines",
    originalPrice: 45,
    price: 35,
    rating: 4.8,
    reviews: 2540,
    discount: 22,
    image: dolo650,
    packSize: "15 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Dolo 650 Tablet is used to reduce fever and provide relief from mild to moderate pain like headache and body pain.",
  },

  {
    id: 351,
    name: "Crocin Advance",
    brand: "GSK",
    category: "Medicines",
    originalPrice: 40,
    price: 32,
    rating: 4.7,
    reviews: 1850,
    discount: 20,
    image: crocin,
    packSize: "20 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Crocin Advance provides quick relief from fever, headache and body pain.",
  },

  {
    id: 352,
    name: "Paracetamol 500mg",
    brand: "Cipla",
    category: "Medicines",
    originalPrice: 35,
    price: 28,
    rating: 4.6,
    reviews: 1420,
    discount: 20,
    image: paracetamol,
    packSize: "10 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Paracetamol 500mg helps reduce fever and provides relief from mild pain.",
  },

  {
    id: 353,
    name: "Azithral 500",
    brand: "Alembic",
    category: "Medicines",
    originalPrice: 140,
    price: 115,
    rating: 4.7,
    reviews: 980,
    discount: 18,
    image: azithral,
    packSize: "3 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Azithral 500 is an antibiotic medicine used for treating bacterial infections.",
  },

  {
    id: 354,
    name: "Amoxycillin 500mg",
    brand: "Mankind",
    category: "Medicines",
    originalPrice: 120,
    price: 95,
    rating: 4.5,
    reviews: 860,
    discount: 21,
    image: amoxycillin,
    packSize: "10 Capsules",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Amoxycillin 500mg is an antibiotic used to treat bacterial infections.",
  },

  {
    id: 355,
    name: "Pantocid 40",
    brand: "Sun Pharma",
    category: "Medicines",
    originalPrice: 170,
    price: 145,
    rating: 4.8,
    reviews: 1200,
    discount: 15,
    image: pantocid,
    packSize: "15 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Pantocid 40 helps in treating acidity, heartburn and stomach-related problems.",
  },

  {
    id: 356,
    name: "Omez 20",
    brand: "Dr. Reddy's",
    category: "Medicines",
    originalPrice: 150,
    price: 120,
    rating: 4.6,
    reviews: 1100,
    discount: 20,
    image: omez,
    packSize: "20 Capsules",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Omez 20 is used for relief from acidity, acid reflux and stomach ulcers.",
  },

  {
    id: 357,
    name: "Limcee Vitamin C",
    brand: "Abbott",
    category: "Medicines",
    originalPrice: 38,
    price: 30,
    rating: 4.8,
    reviews: 1650,
    discount: 21,
    image: limcee,
    packSize: "15 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Limcee Vitamin C supports immunity and helps maintain overall health.",
  },

  {
    id: 358,
    name: "Revital H",
    brand: "Sun Pharma",
    category: "Medicines",
    originalPrice: 420,
    price: 360,
    rating: 4.9,
    reviews: 2450,
    discount: 14,
    image: revital,
    packSize: "30 Capsules",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Revital H is a multivitamin supplement that supports energy and immunity.",
  },

  {
    id: 359,
    name: "Benadryl Syrup",
    brand: "Johnson & Johnson",
    category: "Medicines",
    originalPrice: 140,
    price: 110,
    rating: 4.7,
    reviews: 1300,
    discount: 21,
    image: benadryl,
    packSize: "100ml Syrup",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Benadryl Syrup helps relieve cough and throat irritation.",
  },

  {
    id: 360,
    name: "Cetirizine 10mg",
    brand: "Cipla",
    category: "Medicines",
    originalPrice: 52,
    price: 42,
    rating: 4.5,
    reviews: 980,
    discount: 19,
    image: cetirizine,
    packSize: "10 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Cetirizine is used to relieve allergy symptoms such as sneezing, runny nose, watery eyes and itching.",
  },

  {
    id: 361,
    name: "Electral ORS",
    brand: "FDC",
    category: "Medicines",
    originalPrice: 30,
    price: 25,
    rating: 4.8,
    reviews: 1620,
    discount: 17,
    image: electral,
    packSize: "21g Sachet",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Electral ORS helps restore fluids and electrolytes lost due to dehydration.",
  },

  {
    id: 362,
    name: "Volini Spray",
    brand: "Sun Pharma",
    category: "Medicines",
    originalPrice: 275,
    price: 220,
    rating: 4.8,
    reviews: 2140,
    discount: 20,
    image: volini,
    packSize: "100g",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Volini Spray provides quick relief from muscle pain and joint pain.",
  },

  {
    id: 363,
    name: "Digene Gel",
    brand: "Abbott",
    category: "Medicines",
    originalPrice: 225,
    price: 180,
    rating: 4.6,
    reviews: 1180,
    discount: 20,
    image: digene,
    packSize: "450ml",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Digene Gel provides relief from acidity and indigestion.",
  },

  {
    id: 364,
    name: "Gelusil Tablet",
    brand: "Pfizer",
    category: "Medicines",
    originalPrice: 105,
    price: 85,
    rating: 4.5,
    reviews: 890,
    discount: 19,
    image: gelusil,
    packSize: "15 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Gelusil Tablets provide fast relief from acidity.",
  },

  {
    id: 365,
    name: "Allegra 120",
    brand: "Sanofi",
    category: "Medicines",
    originalPrice: 305,
    price: 245,
    rating: 4.8,
    reviews: 1730,
    discount: 20,
    image: allegra,
    packSize: "10 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Allegra 120 relieves allergy symptoms.",
  },

  {
    id: 366,
    name: "Sinarest Tablet",
    brand: "Centaur",
    category: "Medicines",
    originalPrice: 120,
    price: 95,
    rating: 4.6,
    reviews: 1050,
    discount: 21,
    image: sinarest,
    packSize: "15 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Sinarest Tablet relieves common cold symptoms.",
  },

  {
    id: 367,
    name: "Calpol 650",
    brand: "GSK",
    category: "Medicines",
    originalPrice: 48,
    price: 38,
    rating: 4.7,
    reviews: 2080,
    discount: 21,
    image: calpol,
    packSize: "15 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Calpol 650 reduces fever and body pain.",
  },

  {
    id: 368,
    name: "Disprin",
    brand: "Reckitt",
    category: "Medicines",
    originalPrice: 28,
    price: 22,
    rating: 4.4,
    reviews: 760,
    discount: 21,
    image: disprin,
    packSize: "10 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Disprin provides quick relief from headache and fever.",
  },

  {
    id: 369,
    name: "Zincovit",
    brand: "Apex",
    category: "Medicines",
    originalPrice: 240,
    price: 190,
    rating: 4.9,
    reviews: 2450,
    discount: 21,
    image: zincovit,
    packSize: "30 Tablets",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Zincovit is a multivitamin supplement that supports immunity and overall health.",
  },
];

export default medicines;