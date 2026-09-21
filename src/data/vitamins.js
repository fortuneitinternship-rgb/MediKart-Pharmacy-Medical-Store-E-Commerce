import revitalH from "../assets/vitamins/revital-h.png";
import limcee from "../assets/vitamins/limcee.png";
import zincovit from "../assets/vitamins/zincovit.png";
import shelcal from "../assets/vitamins/shelcal.png";
import evion400 from "../assets/vitamins/evion400.png";
import becosules from "../assets/vitamins/becosules.png";
import neurobion from "../assets/vitamins/neurobion.png";
import vitaminD3 from "../assets/vitamins/vitamin-d3.png";
import calcimax from "../assets/vitamins/calcimax.png";
import supradyn from "../assets/vitamins/supradyn.png";
import atoz from "../assets/vitamins/atoz.png";
import hkMultivitamin from "../assets/vitamins/hk-multivitamin.png";
import vitaminB from "../assets/vitamins/vitamin-b.png";
import vitaminK2 from "../assets/vitamins/vitamin-k2.png";
import vitaminE from "../assets/vitamins/vitamin-e.png";
import fishOil from "../assets/vitamins/fish-oil.png";
import biotin from "../assets/vitamins/biotin.png";
import ironFolic from "../assets/vitamins/iron-folic.png";
import calciumMagnesium from "../assets/vitamins/calcium-magnesium.png";
import vitaminCGummies from "../assets/vitamins/vitamin-c-gummies.png";
import hairGummies from "../assets/vitamins/hair-gummies.png";
import vitaminA from "../assets/vitamins/vitamin-a.png";
import vitaminB12 from "../assets/vitamins/vitamin-b12.png";
import multivitaminSyrup from "../assets/vitamins/multivitamin-syrup.png";
import immunityBooster from "../assets/vitamins/immunity-booster.png";

const vitamins = [
  {
    id: 1,
    name: "Revital H Capsules",
    brand: "Sun Pharma",
    category: "Vitamins",
    price: 300,
    originalPrice: 420,
    discount: 14,
    rating: 4.9,
    reviews: 2450,
    image: revitalH,
    packSize: "30 Capsules",
    expiry: "24 Months",
    stock: 50,
    description:
      "A daily multivitamin and mineral supplement designed to provide nutritional support.",
  },

  {
    id: 2,
    name: "Limcee Vitamin C",
    brand: "Abbott",
    category: "Vitamins",
    price: 25,
    originalPrice: 35,
    discount: 14,
    rating: 4.8,
    reviews: 1890,
    image: limcee,
    packSize: "15 Tablets",
    expiry: "24 Months",
    stock: 80,
    description:
      "Vitamin C supplement available in convenient tablet form for daily nutritional support.",
  },

  {
    id: 3,
    name: "Zincovit Tablets",
    brand: "Apex",
    category: "Vitamins",
    price: 110,
    originalPrice: 200,
    discount: 16,
    rating: 4.8,
    reviews: 1650,
    image: zincovit,
    packSize: "15 Tablets",
    expiry: "24 Months",
    stock: 45,
    description:
      "A combination of vitamins and minerals intended for daily nutritional supplementation.",
  },

  {
    id: 4,
    name: "Shelcal 500",
    brand: "Torrent",
    category: "Vitamins",
    price: 145,
    originalPrice: 170,
    discount: 15,
    rating: 4.7,
    reviews: 1320,
    image: shelcal,
    packSize: "15 Tablets",
    expiry: "24 Months",
    stock: 60,
    description:
      "Calcium and vitamin D nutritional supplement in tablet form.",
  },

  {
    id: 5,
    name: "Evion 400",
    brand: "Merck",
    category: "Vitamins",
    price: 165,
    originalPrice: 195,
    discount: 15,
    rating: 4.8,
    reviews: 1780,
    image: evion400,
    packSize: "20 Capsules",
    expiry: "24 Months",
    stock: 55,
    description:
      "Vitamin E supplement provided in capsule form for nutritional support.",
  },

  {
    id: 6,
    name: "Becosules Capsules",
    brand: "Pfizer",
    category: "Vitamins",
    price: 58,
    originalPrice: 70,
    discount: 17,
    rating: 4.6,
    reviews: 980,
    image: becosules,
    packSize: "20 Capsules",
    expiry: "24 Months",
    stock: 70,
    description:
      "B-complex vitamin supplement intended to support daily nutritional needs.",
  },

  {
    id: 7,
    name: "Neurobion Forte",
    brand: "P&G",
    category: "Vitamins",
    price: 42,
    originalPrice: 50,
    discount: 16,
    rating: 4.7,
    reviews: 1450,
    image: neurobion,
    packSize: "30 Tablets",
    expiry: "24 Months",
    stock: 65,
    description:
      "B-vitamin supplement containing a combination of B-group vitamins.",
  },

  {
    id: 8,
    name: "Vitamin D3 60000 IU",
    brand: "Uprise",
    category: "Vitamins",
    price: 120,
    originalPrice: 145,
    discount: 17,
    rating: 4.8,
    reviews: 2100,
    image: vitaminD3,
    packSize: "8 Capsules",
    expiry: "24 Months",
    stock: 40,
    description:
      "Vitamin D3 supplement supplied in capsule form.",
  },

  {
    id: 9,
    name: "Calcimax Tablets",
    brand: "Meyer",
    category: "Vitamins",
    price: 210,
    originalPrice: 250,
    discount: 16,
    rating: 4.7,
    reviews: 870,
    image: calcimax,
    packSize: "30 Tablets",
    expiry: "24 Months",
    stock: 48,
    description:
      "Calcium-based nutritional supplement in tablet form.",
  },

  {
    id: 10,
    name: "Supradyn Daily",
    brand: "Bayer",
    category: "Vitamins",
    price: 290,
    originalPrice: 340,
    discount: 15,
    rating: 4.9,
    reviews: 2350,
    image: supradyn,
    packSize: "15 Tablets",
    expiry: "24 Months",
    stock: 52,
    description:
      "Daily multivitamin and mineral nutritional supplement.",
  },

  {
    id: 11,
    name: "A to Z NS Tablets",
    brand: "Alkem",
    category: "Vitamins",
    price: 185,
    originalPrice: 220,
    discount: 16,
    rating: 4.6,
    reviews: 920,
    image: atoz,
    packSize: "15 Tablets",
    expiry: "24 Months",
    stock: 45,
    description:
      "Multivitamin and mineral nutritional supplement.",
  },

  {
    id: 12,
    name: "HealthKart Multivitamin",
    brand: "HealthKart",
    category: "Vitamins",
    price: 599,
    originalPrice: 799,
    discount: 25,
    rating: 4.8,
    reviews: 3100,
    image: hkMultivitamin,
    packSize: "60 Tablets",
    expiry: "24 Months",
    stock: 35,
    description:
      "Daily multivitamin supplement containing a combination of vitamins and minerals.",
  },

  {
    id: 13,
    name: "Vitamin B Complex",
    brand: "Cipla",
    category: "Vitamins",
    price: 120,
    originalPrice: 145,
    discount: 17,
    rating: 4.5,
    reviews: 760,
    image: vitaminB,
    packSize: "20 Tablets",
    expiry: "24 Months",
    stock: 60,
    description:
      "Vitamin B complex supplement provided in tablet form.",
  },

  {
    id: 14,
    name: "Vitamin K2",
    brand: "Now Foods",
    category: "Vitamins",
    price: 899,
    originalPrice: 1099,
    discount: 18,
    rating: 4.8,
    reviews: 650,
    image: vitaminK2,
    packSize: "60 Capsules",
    expiry: "24 Months",
    stock: 25,
    description:
      "Vitamin K2 dietary supplement in capsule form.",
  },

  {
    id: 15,
    name: "Vitamin E Capsules",
    brand: "Evion",
    category: "Vitamins",
    price: 170,
    originalPrice: 200,
    discount: 15,
    rating: 4.7,
    reviews: 1140,
    image: vitaminE,
    packSize: "20 Capsules",
    expiry: "24 Months",
    stock: 55,
    description:
      "Vitamin E nutritional supplement in capsule form.",
  },

  {
    id: 16,
    name: "Omega-3 Fish Oil",
    brand: "HK Vitals",
    category: "Vitamins",
    price: 699,
    originalPrice: 899,
    discount: 22,
    rating: 4.8,
    reviews: 2850,
    image: fishOil,
    packSize: "60 Capsules",
    expiry: "24 Months",
    stock: 32,
    description:
      "Omega-3 fish oil dietary supplement.",
  },

  {
    id: 17,
    name: "Biotin Tablets",
    brand: "Carbamide Forte",
    category: "Vitamins",
    price: 450,
    originalPrice: 599,
    discount: 25,
    rating: 4.7,
    reviews: 1920,
    image: biotin,
    packSize: "60 Tablets",
    expiry: "24 Months",
    stock: 38,
    description:
      "Biotin dietary supplement in tablet form.",
  },

  {
    id: 18,
    name: "Iron & Folic Acid",
    brand: "Cipla",
    category: "Vitamins",
    price: 95,
    originalPrice: 115,
    discount: 17,
    rating: 4.6,
    reviews: 710,
    image: ironFolic,
    packSize: "30 Tablets",
    expiry: "24 Months",
    stock: 65,
    description:
      "Iron and folic acid nutritional supplement.",
  },

  {
    id: 19,
    name: "Calcium + Magnesium",
    brand: "HK Vitals",
    category: "Vitamins",
    price: 540,
    originalPrice: 699,
    discount: 23,
    rating: 4.8,
    reviews: 1240,
    image: calciumMagnesium,
    packSize: "60 Tablets",
    expiry: "24 Months",
    stock: 30,
    description:
      "Calcium and magnesium dietary supplement.",
  },

  {
    id: 20,
    name: "Vitamin C Gummies",
    brand: "Power Gummies",
    category: "Vitamins",
    price: 699,
    originalPrice: 899,
    discount: 22,
    rating: 4.9,
    reviews: 2700,
    image: vitaminCGummies,
    packSize: "60 Gummies",
    expiry: "18 Months",
    stock: 42,
    description:
      "Vitamin C nutritional supplement in gummy form.",
  },

  {
    id: 21,
    name: "Hair Skin Nails Gummies",
    brand: "Power Gummies",
    category: "Vitamins",
    price: 799,
    originalPrice: 999,
    discount: 20,
    rating: 4.8,
    reviews: 1980,
    image: hairGummies,
    packSize: "60 Gummies",
    expiry: "18 Months",
    stock: 35,
    description:
      "Gummy nutritional supplement containing vitamins and nutrients.",
  },

  {
    id: 22,
    name: "Vitamin A Capsules",
    brand: "Abbott",
    category: "Vitamins",
    price: 140,
    originalPrice: 165,
    discount: 15,
    rating: 4.5,
    reviews: 540,
    image: vitaminA,
    packSize: "30 Capsules",
    expiry: "24 Months",
    stock: 50,
    description:
      "Vitamin A dietary supplement in capsule form.",
  },

  {
    id: 23,
    name: "Vitamin B12 Tablets",
    brand: "Cipla",
    category: "Vitamins",
    price: 180,
    originalPrice: 220,
    discount: 18,
    rating: 4.7,
    reviews: 1350,
    image: vitaminB12,
    packSize: "30 Tablets",
    expiry: "24 Months",
    stock: 55,
    description:
      "Vitamin B12 nutritional supplement in tablet form.",
  },

  {
    id: 24,
    name: "Multivitamin Syrup",
    brand: "Dexorange",
    category: "Vitamins",
    price: 220,
    originalPrice: 260,
    discount: 15,
    rating: 4.6,
    reviews: 680,
    image: multivitaminSyrup,
    packSize: "200 ml",
    expiry: "24 Months",
    stock: 45,
    description:
      "Multivitamin nutritional supplement in syrup form.",
  },

  {
    id: 25,
    name: "Immunity Booster Tablets",
    brand: "Himalaya",
    category: "Vitamins",
    price: 275,
    originalPrice: 325,
    discount: 15,
    rating: 4.8,
    reviews: 1540,
    image: immunityBooster,
    packSize: "60 Tablets",
    expiry: "24 Months",
    stock: 40,
    description:
      "Nutritional supplement designed for daily wellness support.",
  },
  
];

export default vitamins;