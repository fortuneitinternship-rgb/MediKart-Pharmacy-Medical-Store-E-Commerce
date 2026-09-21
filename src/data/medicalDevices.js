import digitalThermometer from "../assets/medicalDevices/digital-thermometer.png";
import infraredThermometer from "../assets/medicalDevices/infrared-thermometer.png";
import bpMonitor from "../assets/medicalDevices/bp-monitor.png";
import pulseOximeter from "../assets/medicalDevices/pulse-oximeter.png";
import glucometer from "../assets/medicalDevices/glucometer.png";
import glucoseStrips from "../assets/medicalDevices/glucose-strips.png";
import nebulizer from "../assets/medicalDevices/nebulizer.png";
import steamVaporizer from "../assets/medicalDevices/steam-vaporizer.png";
import weighingScale from "../assets/medicalDevices/weighing-scale.png";
import bmiScale from "../assets/medicalDevices/bmi-scale.png";
import heatingPad from "../assets/medicalDevices/heating-pad.png";
import hotWaterBag from "../assets/medicalDevices/hot-water-bag.png";
import stethoscope from "../assets/medicalDevices/stethoscope.png";
import ecgMonitor from "../assets/medicalDevices/ecg-monitor.png";
import oxygenConcentrator from "../assets/medicalDevices/oxygen-concentrator.png";
import wheelchair from "../assets/medicalDevices/wheelchair.png";
import walkingStick from "../assets/medicalDevices/walking-stick.png";
import walker from "../assets/medicalDevices/walker.png";
import kneeSupport from "../assets/medicalDevices/knee-support.png";
import lumbarSupport from "../assets/medicalDevices/lumbar-support.png";
import cervicalCollar from "../assets/medicalDevices/cervical-collar.png";
import ankleSupport from "../assets/medicalDevices/ankle-support.png";
import wristBrace from "../assets/medicalDevices/wrist-brace.png";
import shoulderSupport from "../assets/medicalDevices/shoulder-support.png";
import elbowSupport from "../assets/medicalDevices/elbow-support.png";

const medicalDevices = [
  {
    id: 300,
    name: "Digital Thermometer",
    brand: "Dr. Morepen",
    category: "Medical Devices",
    originalPrice: 220,
    price: 180,
    rating: 4.8,
    reviews: 1250,
    discount: 18,
    image: digitalThermometer,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Accurate digital thermometer for quick and reliable body temperature measurement."
  },

  {
    id: 301,
    name: "Infrared Thermometer",
    brand: "Omron",
    category: "Medical Devices",
    originalPrice: 1899,
    price: 1599,
    rating: 4.9,
    reviews: 980,
    discount: 16,
    image: infraredThermometer,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Non-contact infrared thermometer designed for quick and hygienic temperature measurement."
  },

  {
    id: 302,
    name: "Blood Pressure Monitor",
    brand: "Omron",
    category: "Medical Devices",
    originalPrice: 1999,
    price: 1660,
    rating: 4.9,
    reviews: 1540,
    discount: 17,
    image: bpMonitor,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Digital blood pressure monitor for convenient and accurate blood pressure monitoring at home."
  },

  {
    id: 303,
    name: "Pulse Oximeter",
    brand: "Dr. Trust",
    category: "Medical Devices",
    originalPrice: 1499,
    price: 1300,
    rating: 4.8,
    reviews: 1120,
    discount: 13,
    image: pulseOximeter,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Compact pulse oximeter for measuring blood oxygen saturation and pulse rate."
  },

  {
    id: 304,
    name: "Glucometer Kit",
    brand: "Accu-Chek",
    category: "Medical Devices",
    originalPrice: 1450,
    price: 1200,
    rating: 4.9,
    reviews: 1890,
    discount: 17,
    image: glucometer,
    packSize: "1 Kit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Blood glucose monitoring kit designed for convenient diabetes management at home."
  },

  {
    id: 305,
    name: "Blood Glucose Strips",
    brand: "Accu-Chek",
    category: "Medical Devices",
    originalPrice: 799,
    price: 680,
    rating: 4.8,
    reviews: 875,
    discount: 15,
    image: glucoseStrips,
    packSize: "50 Strips",
    expiry: "18 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Accurate blood glucose test strips for convenient blood sugar monitoring."
  },

  {
    id: 306,
    name: "Nebulizer Machine",
    brand: "Omron",
    category: "Medical Devices",
    originalPrice: 2999,
    price: 2499,
    rating: 4.8,
    reviews: 1340,
    discount: 17,
    image: nebulizer,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Portable nebulizer machine designed to deliver medication in the form of a fine mist."
  },

  {
    id: 307,
    name: "Steam Vaporizer",
    brand: "Dr. Morepen",
    category: "Medical Devices",
    originalPrice: 1199,
    price: 1000,
    rating: 4.7,
    reviews: 920,
    discount: 17,
    image: steamVaporizer,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Electric steam vaporizer suitable for convenient steam inhalation at home."
  },

  {
    id: 308,
    name: "Digital Weighing Scale",
    brand: "HealthSense",
    category: "Medical Devices",
    originalPrice: 499,
    price: 400,
    rating: 4.8,
    reviews: 1480,
    discount: 20,
    image: weighingScale,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Digital weighing scale with accurate weight measurement for everyday health monitoring."
  },

  {
    id: 309,
    name: "BMI Smart Scale",
    brand: "Dr. Trust",
    category: "Medical Devices",
    originalPrice: 1299,
    price: 1000,
    rating: 4.8,
    reviews: 760,
    discount: 23,
    image: bmiScale,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Smart body weighing scale designed to help monitor weight and BMI."
  },

  {
    id: 310,
    name: "Heating Pad",
    brand: "Dr. Trust",
    category: "Medical Devices",
    originalPrice: 1499,
    price: 1300,
    rating: 4.7,
    reviews: 1180,
    discount: 13,
    image: heatingPad,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Electric heating pad designed to provide soothing warmth for everyday comfort."
  },

  {
    id: 311,
    name: "Electric Hot Water Bag",
    brand: "Vissco",
    category: "Medical Devices",
    originalPrice: 699,
    price: 599,
    rating: 4.7,
    reviews: 950,
    discount: 14,
    image: hotWaterBag,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Rechargeable electric hot water bag that provides convenient warmth and comfort."
  },

  {
    id: 312,
    name: "Stethoscope",
    brand: "3M Littmann",
    category: "Medical Devices",
    originalPrice: 4499,
    price: 3999,
    rating: 4.9,
    reviews: 680,
    discount: 11,
    image: stethoscope,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Professional stethoscope designed for clear and reliable auscultation."
  },

  {
    id: 313,
    name: "Digital ECG Monitor",
    brand: "BPL",
    category: "Medical Devices",
    originalPrice: 7999,
    price: 6999,
    rating: 4.8,
    reviews: 540,
    discount: 13,
    image: ecgMonitor,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "3-5 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Digital ECG monitoring device designed for convenient heart rhythm monitoring."
  },

  {
    id: 314,
    name: "Oxygen Concentrator",
    brand: "Philips",
    category: "Medical Devices",
    originalPrice: 49999,
    price: 45999,
    rating: 4.9,
    reviews: 320,
    discount: 8,
    image: oxygenConcentrator,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "3-5 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Oxygen concentrator designed to provide a continuous supply of concentrated oxygen."
  },

  {
    id: 315,
    name: "Wheelchair",
    brand: "Karma",
    category: "Medical Devices",
    originalPrice: 1199,
    price: 1000,
    rating: 4.8,
    reviews: 890,
    discount: 17,
    image: wheelchair,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "3-5 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Comfortable and durable wheelchair designed for convenient mobility support."
  },

  {
    id: 316,
    name: "Walking Stick",
    brand: "Tynor",
    category: "Medical Devices",
    originalPrice: 999,
    price: 900,
    rating: 4.7,
    reviews: 760,
    discount: 10,
    image: walkingStick,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Lightweight walking stick designed to provide additional support while walking."
  },

  {
    id: 317,
    name: "Walking Walker",
    brand: "Vissco",
    category: "Medical Devices",
    originalPrice: 3499,
    price: 2999,
    rating: 4.8,
    reviews: 620,
    discount: 14,
    image: walker,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "3-5 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Strong and stable walking walker designed to provide mobility support."
  },

  {
    id: 318,
    name: "Knee Support",
    brand: "Tynor",
    category: "Medical Devices",
    originalPrice: 599,
    price: 499,
    rating: 4.8,
    reviews: 1420,
    discount: 17,
    image: kneeSupport,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Comfortable knee support designed to provide compression and support during daily activities."
  },

  {
    id: 319,
    name: "Lumbar Support Belt",
    brand: "Vissco",
    category: "Medical Devices",
    originalPrice: 999,
    price: 899,
    rating: 4.7,
    reviews: 1100,
    discount: 10,
    image: lumbarSupport,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Lumbar support belt designed to provide comfortable support to the lower back."
  },

  {
    id: 320,
    name: "Cervical Collar",
    brand: "Flamingo",
    category: "Medical Devices",
    originalPrice: 799,
    price: 699,
    rating: 4.7,
    reviews: 840,
    discount: 13,
    image: cervicalCollar,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Soft cervical collar designed to provide comfortable neck support."
  },

  {
    id: 321,
    name: "Ankle Support",
    brand: "Tynor",
    category: "Medical Devices",
    originalPrice: 549,
    price: 449,
    rating: 4.8,
    reviews: 930,
    discount: 18,
    image: ankleSupport,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Ankle support designed to provide comfortable compression and support during movement."
  },

  {
    id: 322,
    name: "Wrist Brace",
    brand: "Flamingo",
    category: "Medical Devices",
    originalPrice: 499,
    price: 399,
    rating: 4.7,
    reviews: 860,
    discount: 20,
    image: wristBrace,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Wrist brace designed to provide support and comfortable compression around the wrist."
  },

  {
    id: 323,
    name: "Shoulder Support",
    brand: "Vissco",
    category: "Medical Devices",
    originalPrice: 899,
    price: 799,
    rating: 4.8,
    reviews: 720,
    discount: 11,
    image: shoulderSupport,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Shoulder support designed to provide comfortable support and compression around the shoulder."
  },

  {
    id: 324,
    name: "Elbow Support",
    brand: "Tynor",
    category: "Medical Devices",
    originalPrice: 499,
    price: 399,
    rating: 4.7,
    reviews: 650,
    discount: 20,
    image: elbowSupport,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Elbow support designed to provide comfortable compression and support during daily activities."
  },

  {
    id: 325,
    name: "Portable Oxygen Cylinder",
    brand: "MediSafe",
    category: "Medical Devices",
    originalPrice: 8999,
    price: 7999,
    rating: 4.7,
    reviews: 410,
    discount: 11,
    image: oxygenConcentrator,
    packSize: "1 Unit",
    expiry: "24 Months",
    delivery: "3-5 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Portable oxygen equipment designed for convenient oxygen support and mobility."
  },

];


// ============================================================
// EXPORT
// ============================================================

export default medicalDevices;