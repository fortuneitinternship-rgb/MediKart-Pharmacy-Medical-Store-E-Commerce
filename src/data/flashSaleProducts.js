import Dolo650 from "../assets/FlashSale/Debo650.jpg";
import hair1 from "../assets/hairCare/hair1.png";
import digitalThermometer from "../assets/medicalDevices/digital-thermometer.png";
import listerine from "../assets/personalCare/listerine.png";
import VisionCapsules from "../assets/EyeCare/eye20.png";
import womens19 from "../assets/womensHealth/womens19.png";
import colgate from "../assets/personalCare/colgate.png";
import BabyGiftKit from "../assets/BabyCare/baby-gift-kit.png";

const flashSaleProducts = [
    {
        id: 350,
        name: "Dolo 650",
        title: "Dolo 650",
        brand: "Micro Labs",
        category: "Medicines",

        image: Dolo650,

        originalPrice: 32.12,
        price: 24.09,
        discountedPrice: 24.09,

        rating: 4.8,
        reviews: 1250,
        discount: 25,

        packSize: "15 Tablets",
        expiry: "24 Months",

        delivery: "2-3 Business Days",

        returnPolicy: "7 Days Return Eligible",

        stock: true,

        description:
            "Dolo 650 is commonly used for the temporary relief of fever and mild to moderate pain."
    },
    {
        id: 200,
        name: "Anti Hair Fall Shampoo",
        brand: "Dove",
        category: "Hair Care",
        originalPrice: 349,
        price: 299,
        rating: 4.8,
        reviews: 1245,
        discount: 14,
        image: hair1,
        packSize: "340ml",
        expiry: "24 Months",
        delivery: "2-3 Business Days",
        returnPolicy: "7 Days Return Eligible",
        stock: true,
        description:
            "Anti hair fall shampoo that gently cleanses the scalp and helps strengthen hair."
    },

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
        id: 148,
        name: "Listerine Mouthwash",
        brand: "Listerine",
        category: "Personal Care",
        originalPrice: 300,
        price: 260,
        rating: 4.8,
        reviews: 2450,
        discount: 13,
        image: listerine,
        packSize: "250ml",
        expiry: "24 Months",
        delivery: "2-3 Business Days",
        returnPolicy: "7 Days Return Eligible",
        stock: true,
        description: "Mouthwash that helps freshen breath and support everyday oral hygiene.",
    },

    {
        id: 169,
        name: "Vision Support Capsules",
        brand: "VisionCare",
        category: "Eye Care",
        originalPrice: 650,
        price: 520,
        rating: 4.8,
        reviews: 1680,
        discount: 20,
        image: VisionCapsules,
        packSize: "60 Capsules",
        expiry: "24 Months",
        delivery: "2-3 Business Days",
        returnPolicy: "7 Days Return Eligible",
        stock: true,
        description: "Advanced eye nutrition capsules with lutein."
    },

    {
        id: 1519,
        name: "Women's Digestive Health Probiotic",
        brand: "Wellbeing Nutrition",
        category: "Women's Health",
        originalPrice: 899,
        price: 699,
        rating: 4.7,
        reviews: 510,
        discount: 22,
        image: womens19,
        packSize: "30 Capsules",
        expiry: "24 Months",
        delivery: "2-3 Business Days",
        returnPolicy: "7 Days Return Eligible",
        stock: true,
        description:
            "Probiotic supplement supports digestive health and gut balance.",
    },

    {
        id: 144,
        name: "Colgate Toothpaste",
        brand: "Colgate",
        category: "Personal Care",
        originalPrice: 130,
        price: 110,
        rating: 4.8,
        reviews: 4250,
        discount: 15,
        image: colgate,
        packSize: "200g",
        expiry: "24 Months",
        delivery: "2-3 Business Days",
        returnPolicy: "7 Days Return Eligible",
        stock: true,
        description: "Daily toothpaste designed to clean teeth and support everyday oral hygiene.",
    },

    {
        id: 120,
        name: "Baby Gift Care Kit",
        brand: "Johnson's",
        category: "Baby Care",
        originalPrice: 999,
        price: 799,
        rating: 4.9,
        reviews: 1640,
        discount: 20,
        image: BabyGiftKit,
        packSize: "1 Kit",
        expiry: "24 Months",
        delivery: "2-3 Business Days",
        returnPolicy: "7 Days Return Eligible",
        stock: true,
        description: "Complete baby care gift kit containing essential baby products.",
    },
];

export default flashSaleProducts;