-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: medikart
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `address_type` varchar(30) NOT NULL,
  `is_default` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `address_line2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_addresses_id` (`id`),
  KEY `ix_addresses_user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,1,'Satender Kashyap','1234567890','Plot No.86 Street No.1 A.S. nager East Anand bagh, near saraswathi Temple','City','Telangana','500047',NULL,'Home',0,'2026-11-10 10:36:41','India',NULL);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `description` text NOT NULL,
  `content` text NOT NULL,
  `is_published` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_blog_posts_slug` (`slug`),
  KEY `ix_blog_posts_category` (`category`),
  KEY `ix_blog_posts_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `card_holder_name` varchar(100) NOT NULL,
  `last4` varchar(4) NOT NULL,
  `expiry_month` int NOT NULL,
  `expiry_year` int NOT NULL,
  `card_type` varchar(30) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_cards_id` (`id`),
  KEY `ix_cards_user_id` (`user_id`),
  CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cards`
--

LOCK TABLES `cards` WRITE;
/*!40000 ALTER TABLE `cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_product` (`cart_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `ix_cart_items_id` (`id`),
  KEY `ix_cart_items_user_id` (`user_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_carts_user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (5,'Medicines','Over-the-counter and prescription medicines',NULL,1,'2026-10-22 14:58:39'),(6,'Vitamins','Vitamins and daily supplements',NULL,1,'2026-10-22 14:58:39'),(7,'Personal Care','Everyday hygiene and personal care',NULL,1,'2026-10-22 14:58:39'),(8,'Baby Care','Safe products for babies and kids',NULL,1,'2026-10-22 14:58:39'),(9,'Medical Devices','Home health monitoring devices',NULL,1,'2026-10-22 14:58:39'),(10,'Healthcare','General healthcare essentials',NULL,1,'2026-10-22 14:58:39'),(11,'Eye Care','Eye drops, lenses and eye health',NULL,1,'2026-10-22 14:58:39'),(12,'Hair Care','Hair and scalp care',NULL,1,'2026-10-22 14:58:39'),(13,'Women\'s Health','Women\'s wellness products',NULL,1,'2026-10-22 14:58:39'),(14,'Premium Healthcare',NULL,NULL,1,'2026-11-02 16:22:50');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comparisons`
--

DROP TABLE IF EXISTS `comparisons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comparisons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_comparison_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `ix_comparisons_id` (`id`),
  CONSTRAINT `comparisons_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `comparisons_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comparisons`
--

LOCK TABLES `comparisons` WRITE;
/*!40000 ALTER TABLE `comparisons` DISABLE KEYS */;
/*!40000 ALTER TABLE `comparisons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_contact_messages_email` (`email`),
  KEY `ix_contact_messages_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Test Name','test@example.com','0000000000','Test message','2026-10-07 06:09:51'),(2,'Test Name','test@example.com','0000000000','Test message','2026-10-07 07:11:33');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` float NOT NULL,
  `minimum_order_amount` float NOT NULL,
  `maximum_discount` float DEFAULT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `usage_count` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_coupons_code` (`code`),
  KEY `ix_coupons_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_otps`
--

DROP TABLE IF EXISTS `email_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp_hash` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL,
  `is_used` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_email_otps_email` (`email`),
  KEY `ix_email_otps_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_otps`
--

LOCK TABLES `email_otps` WRITE;
/*!40000 ALTER TABLE `email_otps` DISABLE KEYS */;
INSERT INTO `email_otps` VALUES (1,'satenderkashyap18@gmail.com','5e0796ba79ecdbda8d173026b7df8ce5a79fc4ce4ba8988056a3d2751c9b0370','2026-10-06 06:38:56',0,1,'2026-10-06 06:27:56');
/*!40000 ALTER TABLE `email_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `hospital` varchar(150) NOT NULL,
  `doctor` varchar(150) NOT NULL,
  `record_date` date NOT NULL,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_health_records_id` (`id`),
  KEY `ix_health_records_user_id` (`user_id`),
  CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_listings`
--

DROP TABLE IF EXISTS `job_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_listings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `location` varchar(150) NOT NULL,
  `type` varchar(100) NOT NULL,
  `experience` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_job_listings_id` (`id`),
  KEY `ix_job_listings_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_listings`
--

LOCK TABLES `job_listings` WRITE;
/*!40000 ALTER TABLE `job_listings` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medikart_schema_version`
--

DROP TABLE IF EXISTS `medikart_schema_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medikart_schema_version` (
  `version` varchar(50) NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medikart_schema_version`
--

LOCK TABLES `medikart_schema_version` WRITE;
/*!40000 ALTER TABLE `medikart_schema_version` DISABLE KEYS */;
INSERT INTO `medikart_schema_version` VALUES ('20261106_payment_tax_review'),('20261106_payment_tax_review_stock');
/*!40000 ALTER TABLE `medikart_schema_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_newsletter_subscribers_email` (`email`),
  KEY `ix_newsletter_subscribers_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletters`
--

DROP TABLE IF EXISTS `newsletters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `subscribed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_newsletters_email` (`email`),
  KEY `ix_newsletters_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletters`
--

LOCK TABLES `newsletters` WRITE;
/*!40000 ALTER TABLE `newsletters` DISABLE KEYS */;
INSERT INTO `newsletters` VALUES (1,'test@example.com',1,'2026-10-06 05:51:19'),(2,'satenderkashyap18@gmail.com',1,'2026-10-06 06:33:33'),(3,'kiran@gmail.com',1,'2026-10-07 05:20:11'),(4,'abc@gmail.com',1,'2026-11-02 06:35:39'),(5,'mani@gmail.com',1,'2026-11-04 05:56:05');
/*!40000 ALTER TABLE `newsletters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_feedback`
--

DROP TABLE IF EXISTS `order_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `rating` int NOT NULL,
  `feedback` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_order_feedback_id` (`id`),
  KEY `ix_order_feedback_user_id` (`user_id`),
  CONSTRAINT `order_feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_feedback`
--

LOCK TABLES `order_feedback` WRITE;
/*!40000 ALTER TABLE `order_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` float NOT NULL,
  `total` float DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `ix_order_items_id` (`id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,352,'Paracetamol 500mg',1,28,28,'/static/media/paracetamol.5b1c569b318836514799.jpg'),(2,1,353,'Azithral 500',1,115,115,'/static/media/azithral.a1f2649d4aa00c9a7f90.png'),(3,1,351,'Crocin Advance',1,32,32,'/static/media/crocin.291364d61ca04c85a0af.jpg'),(7,12,2014,'Johnson\'s Baby Premium Care Kit',7,250,1750,'/static/media/premium14.bcf06613d144268f6a69.png'),(8,12,16,'Omega-3 Fish Oil',1,699,699,'/static/media/fish-oil.39065efad8e2a2b21c80.png'),(9,13,1,'Product',1,0,0,NULL),(10,14,1,'Product',1,0,0,NULL),(11,15,1,'Product',1,0,0,NULL),(12,22,163,'Blue Light Protection Glasses',1,899,899,'/catalog/EyeCare/eye9.png'),(13,23,20,'Pulse Oximeter',1,999,999,'/catalog/medicalDevices/pulse-oximeter.png');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL,
  `total_amount` float NOT NULL,
  `status` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL DEFAULT 'Pending',
  `delivery_address_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `payment_method` varchar(30) DEFAULT NULL,
  `delivery_type` varchar(30) DEFAULT NULL,
  `delivery_distance` varchar(30) DEFAULT NULL,
  `delivery_time` varchar(50) DEFAULT NULL,
  `delivery_charge` float DEFAULT NULL,
  `product_amount` float DEFAULT NULL,
  `discount` float DEFAULT NULL,
  `platform_fee` float DEFAULT NULL,
  `tax_amount` float NOT NULL DEFAULT '0',
  `stock_reserved` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_orders_order_id` (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `delivery_address_id` (`delivery_address_id`),
  KEY `ix_orders_id` (`id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`delivery_address_id`) REFERENCES `addresses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'MK1781467643',NULL,167,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Satender Kashyap','9182513854','Location selected on map (17.436110, 78.444702)','City','TELANGANA','500047','COD','normal','short','20–30 minutes',10,175,18,0,0,0),(12,'MK261012063846252376',1,2254,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Satender Kashyap','9182513854','Location selected on map (17.436139, 78.444708)','City','TELANGANA','500047','COD','normal','short','20–30 minutes',50,2449,245,0,0,0),(13,'MK261012064045555735',NULL,10,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Test','0000000000','Test Address','Test','Test','000000','COD','normal','short','20–30 minutes',10,0,0,0,0,0),(14,'MK261012064046151881',NULL,10,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Test','0000000000','Test Address','Test','Test','000000','COD','normal','short','20–30 minutes',10,0,0,0,0,0),(15,'MK261012064046666462',NULL,10,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Test','0000000000','Test Address','Test','Test','000000','COD','normal','short','20–30 minutes',10,0,0,0,0,0),(22,'MK20261110081606318344',1,809.1,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Satender Kashyap','1234567890','Plot No.86 Street No.1 A.S. nager East Anand bagh, near saraswathi Temple','City','Telangana','500047','COD','normal','short',NULL,0,899,89.9,0,0,1),(23,'MK20261111053928792744',1,899.1,'Order Confirmed','Pending',NULL,NULL,NULL,NULL,'Satender Kashyap','1234567890','Plot No.86 Street No.1 A.S. nager East Anand bagh, near saraswathi Temple','City','Telangana','500047','COD','normal','short',NULL,0,999,99.9,0,0,1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_webhook_events`
--

DROP TABLE IF EXISTS `payment_webhook_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_webhook_events` (
  `event_id` varchar(100) NOT NULL,
  `payment_id` int NOT NULL,
  `event_status` varchar(20) NOT NULL,
  `received_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`event_id`),
  KEY `ix_payment_webhook_events_payment_id` (`payment_id`),
  CONSTRAINT `payment_webhook_events_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_webhook_events`
--

LOCK TABLES `payment_webhook_events` WRITE;
/*!40000 ALTER TABLE `payment_webhook_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_webhook_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `amount` float NOT NULL,
  `method` varchar(30) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` datetime NOT NULL,
  `provider_order_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `ix_payments_provider_order_id` (`provider_order_id`),
  KEY `ix_payments_id` (`id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,22,NULL,809.1,'COD','Pending','2026-11-10 08:16:06',NULL),(2,23,NULL,899.1,'COD','Pending','2026-11-11 05:39:29',NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `content_type` varchar(100) NOT NULL,
  `content` mediumblob NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_prescriptions_id` (`id`),
  KEY `ix_prescriptions_user_id` (`user_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_product_images_product_id` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `product` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `review` text NOT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_product_reviews_id` (`id`),
  KEY `ix_product_reviews_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,'John','Medicine',5,'Excellent','2026-10-07 06:09:52',NULL),(2,'John Doe','Vitamin C',4,'Very good product','2026-10-07 06:09:52',NULL),(3,'John Doe','Vitamin C',4,'Very good product','2026-10-07 07:11:34',NULL),(4,'John','Medicine',5,'Excellent','2026-10-07 07:11:34',NULL);
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `price` float NOT NULL,
  `rating` float DEFAULT NULL,
  `image` varchar(1000) DEFAULT NULL,
  `stock` int NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_trending` tinyint(1) NOT NULL DEFAULT '0',
  `is_flash_sale` tinyint(1) NOT NULL DEFAULT '0',
  `flash_sale_start` datetime DEFAULT NULL,
  `flash_sale_end` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `category_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `prescription_required` tinyint(1) NOT NULL DEFAULT '0',
  `brand` varchar(255) DEFAULT NULL,
  `reviews` int NOT NULL DEFAULT '0',
  `pack_size` varchar(100) DEFAULT NULL,
  `expiry` varchar(100) DEFAULT NULL,
  `delivery` varchar(100) DEFAULT NULL,
  `return_policy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_products_name` (`name`),
  KEY `ix_products_category` (`category`),
  KEY `ix_products_id` (`id`),
  KEY `ix_products_active` (`is_active`),
  KEY `ix_products_featured` (`is_featured`),
  KEY `ix_products_trending` (`is_trending`),
  KEY `ix_products_flash_sale` (`is_flash_sale`),
  KEY `ix_products_category_id` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,'Paracetamol 650 mg',NULL,'Pain and fever relief tablets. Use as directed by a healthcare professional.',99,4.8,'',100,89.00,1,1,0,NULL,NULL,'2026-10-22 09:28:39',1,5,'2026-10-22 09:28:39',0,NULL,0,NULL,NULL,NULL,NULL),(4,'Crocin Advance 500 mg',NULL,'Fast relief from fever and mild pain.',45,4.6,'/catalog/medicines/crocin.jpg',150,40.00,0,1,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-10-22 09:28:39',0,'GSK',1850,'20 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(5,'Azithromycin 500 mg',NULL,'Antibiotic. Take only on a doctor\'s prescription.',120,4.5,'',60,108.00,0,0,0,NULL,NULL,'2026-10-22 09:28:39',1,5,'2026-10-22 09:28:39',1,NULL,0,NULL,NULL,NULL,NULL),(6,'Cetirizine 10 mg',NULL,'Relief from allergy symptoms such as sneezing and runny nose.',35,4.4,'/catalog/medicines/cetirizine.png',200,30.00,0,0,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-11-02 10:52:51',1,5,'2026-10-22 09:28:39',0,'Cipla',980,'10 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(7,'ORS Electral Powder',NULL,'Oral rehydration salts for dehydration.',22,4.7,'',300,20.00,0,0,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-10-22 09:28:39',1,5,'2026-10-22 09:28:39',0,NULL,0,NULL,NULL,NULL,NULL),(8,'Vitamin C 500 mg Tablets',NULL,'Vitamin C supplement to support immunity.',249,4.7,'',80,229.00,1,0,0,NULL,NULL,'2026-10-22 09:28:40',1,6,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(9,'Multivitamin Daily',NULL,'Complete daily multivitamin and mineral tablets.',399,4.6,'',90,349.00,1,1,0,NULL,NULL,'2026-10-22 09:28:40',1,6,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(10,'Vitamin D3 60000 IU',NULL,'Weekly vitamin D3 capsule.',180,4.5,'/catalog/vitamins/vitamin-d3.png',70,160.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-10-22 09:28:40',0,'Uprise',2100,'8 Capsules','24 Months',NULL,NULL),(11,'Omega-3 Fish Oil',NULL,'Omega-3 fatty acid capsules for heart health.',599,4.6,'/catalog/vitamins/fish-oil.png',55,529.00,1,0,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-11-02 10:52:51',1,6,'2026-10-22 09:28:40',0,'HK Vitals',2850,'60 Capsules','24 Months',NULL,NULL),(12,'Hand Sanitizer 500 ml',NULL,'Kills 99.9% germs. Everyday hygiene.',199,4.6,'',120,179.00,0,0,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-10-22 09:28:40',1,7,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(13,'Herbal Face Wash',NULL,'Gentle daily face wash for all skin types.',149,4.3,'',110,129.00,0,1,0,NULL,NULL,'2026-10-22 09:28:40',1,7,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(14,'Antiseptic Liquid 250 ml',NULL,'Antiseptic liquid for cuts and first aid.',135,4.5,'',85,120.00,0,0,0,NULL,NULL,'2026-10-22 09:28:40',1,7,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(15,'Baby Powder 400 g',NULL,'Soft, gentle baby powder.',215,4.7,'/catalog/BabyCare/baby-powder.png',75,195.00,1,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-10-22 09:28:40',0,'Johnson\'s',1330,'200g','36 Months','2-3 Business Days','7 Days Return Eligible'),(16,'Baby Lotion 200 ml',NULL,'Moisturizing lotion for delicate baby skin.',249,4.6,'',65,225.00,0,0,0,NULL,NULL,'2026-10-22 09:28:40',1,8,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(17,'Digital Thermometer',NULL,'Digital thermometer with fast, accurate readings.',299,4.8,'/catalog/medicalDevices/digital-thermometer.png',40,279.00,0,1,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-11-02 10:52:51',1,9,'2026-10-22 09:28:40',0,'Dr. Morepen',1250,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(18,'Blood Pressure Monitor',NULL,'Automatic upper-arm home blood pressure monitor.',1499,4.9,'/catalog/medicalDevices/bp-monitor.png',25,1399.00,1,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-10-22 09:28:40',0,'Omron',1540,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(19,'Glucometer Kit',NULL,'Blood glucose meter with 25 test strips.',999,4.7,'/catalog/medicalDevices/glucometer.png',30,899.00,0,1,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-10-22 09:28:40',0,'Accu-Chek',1890,'1 Kit','24 Months','2-3 Business Days','7 Days Return Eligible'),(20,'Pulse Oximeter',NULL,'Fingertip pulse oximeter, SpO2 and pulse rate.',1199,4.6,'/catalog/medicalDevices/pulse-oximeter.png',34,999.00,1,0,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-11-11 05:39:29',1,9,'2026-10-22 09:28:40',0,'Dr. Trust',1120,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(21,'First Aid Kit',NULL,'Compact first aid kit for home and travel.',449,4.5,'/catalog/healthcare/first-aid-kit.png',50,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-10-22 09:28:40',0,'Dr. Morepen',1350,'1 Kit','36 Months','3-4 Business Days','14 Days Return Eligible'),(22,'Face Masks (Pack of 50)',NULL,'3-ply disposable surgical masks.',199,4.4,'',200,169.00,0,0,1,'2026-10-21 09:28:39','2027-10-22 09:28:39','2026-10-22 09:28:40',1,10,'2026-10-22 09:28:40',0,NULL,0,NULL,NULL,NULL,NULL),(23,'Lubricating Eye Drops',NULL,'Relieves dry and tired eyes.',150,4.5,'/catalog/EyeCare/eye2.png',90,135.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-10-22 09:28:40',0,'Optive',1320,'10ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(24,'Anti-Dandruff Shampoo',NULL,'Clinically tested anti-dandruff shampoo.',325,4.4,'/catalog/hairCare/hair3.png',80,295.00,0,1,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-10-22 09:28:40',0,'Head & Shoulders',1560,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(25,'Iron & Folic Acid Tablets',NULL,'Iron and folic acid supplement.',130,4.5,'/catalog/womensHealth/womens1.png',95,115.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-10-22 09:28:40',0,'Himalaya',850,'60 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(26,'Dolo 650 Tablet',NULL,'Dolo 650 Tablet is used to reduce fever and provide relief from mild to moderate pain like headache and body pain.',45,4.8,'/catalog/medicines/Debo650.jpg',100,35.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Micro Labs',2540,'15 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(27,'Paracetamol 500mg',NULL,'Paracetamol 500mg helps reduce fever and provides relief from mild pain.',35,4.6,'/catalog/medicines/paracetamol.jpg',100,28.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Cipla',1420,'10 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(28,'Azithral 500',NULL,'Azithral 500 is an antibiotic medicine used for treating bacterial infections.',140,4.7,'/catalog/images/product-placeholder.svg',100,115.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Alembic',980,'3 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(29,'Amoxycillin 500mg',NULL,'Amoxycillin 500mg is an antibiotic used to treat bacterial infections.',120,4.5,'/catalog/medicines/amoxycillin.png',100,95.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Mankind',860,'10 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(30,'Pantocid 40',NULL,'Pantocid 40 helps in treating acidity, heartburn and stomach-related problems.',170,4.8,'/catalog/medicines/pantocid.png',100,145.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Sun Pharma',1200,'15 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(31,'Omez 20',NULL,'Omez 20 is used for relief from acidity, acid reflux and stomach ulcers.',150,4.6,'/catalog/medicines/omez.png',100,120.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Dr. Reddy\'s',1100,'20 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(32,'Limcee Vitamin C',NULL,'Limcee Vitamin C supports immunity and helps maintain overall health.',38,4.8,'/catalog/medicines/limcee.jpg',100,30.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Abbott',1650,'15 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(33,'Revital H',NULL,'Revital H is a multivitamin supplement that supports energy and immunity.',420,4.9,'/catalog/medicines/revital.png',100,360.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Sun Pharma',2450,'30 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(34,'Benadryl Syrup',NULL,'Benadryl Syrup helps relieve cough and throat irritation.',140,4.7,'/catalog/medicines/benadryl.png',100,110.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Johnson & Johnson',1300,'100ml Syrup','24 Months','2-3 Business Days','7 Days Return Eligible'),(35,'Electral ORS',NULL,'Electral ORS helps restore fluids and electrolytes lost due to dehydration.',30,4.8,'/catalog/medicines/electral.png',100,25.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'FDC',1620,'21g Sachet','24 Months','2-3 Business Days','7 Days Return Eligible'),(36,'Volini Spray',NULL,'Volini Spray provides quick relief from muscle pain and joint pain.',275,4.8,'/catalog/medicines/volini.png',100,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Sun Pharma',2140,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(37,'Digene Gel',NULL,'Digene Gel provides relief from acidity and indigestion.',225,4.6,'/catalog/medicines/digene.png',100,180.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Abbott',1180,'450ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(38,'Gelusil Tablet',NULL,'Gelusil Tablets provide fast relief from acidity.',105,4.5,'/catalog/medicines/gelusil.png',100,85.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Pfizer',890,'15 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(39,'Allegra 120',NULL,'Allegra 120 relieves allergy symptoms.',305,4.8,'/catalog/medicines/allegra.png',100,245.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Sanofi',1730,'10 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(40,'Sinarest Tablet',NULL,'Sinarest Tablet relieves common cold symptoms.',120,4.6,'/catalog/medicines/sinarest.png',100,95.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Centaur',1050,'15 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(41,'Calpol 650',NULL,'Calpol 650 reduces fever and body pain.',48,4.7,'/catalog/medicines/calpol.png',100,38.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'GSK',2080,'15 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(42,'Disprin',NULL,'Disprin provides quick relief from headache and fever.',28,4.4,'/catalog/medicines/disprin.png',100,22.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Reckitt',760,'10 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(43,'Zincovit',NULL,'Zincovit is a multivitamin supplement that supports immunity and overall health.',240,4.9,'/catalog/medicines/zincovit.png',100,190.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,5,'2026-11-02 10:52:51',0,'Apex',2450,'30 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(44,'Hand Sanitizer 500ml',NULL,'Hand sanitizer that helps protect against germs and keeps hands clean.',249,4.8,'/catalog/healthcare/sanitizer.jpg',100,199.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Dettol',1850,'500ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(45,'Antiseptic Liquid',NULL,'Antiseptic liquid suitable for cleaning minor cuts, wounds and protecting against germs.',220,4.7,'/catalog/healthcare/antiseptic-liquid.png',100,175.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Dettol',1420,'250ml','36 Months','2-3 Business Days','7 Days Return Eligible'),(46,'Savlon Antiseptic',NULL,'Antiseptic solution designed for everyday hygiene and minor wound care.',199,4.6,'/catalog/healthcare/savlon.png',100,160.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Savlon',980,'250ml','36 Months','2-3 Business Days','7 Days Return Eligible'),(47,'Cotton Roll',NULL,'Soft and absorbent cotton roll suitable for wound dressing and personal care.',90,4.8,'/catalog/healthcare/cotton-roll.png',100,70.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Johnson\'s',760,'100g','36 Months','2-3 Business Days','7 Days Return Eligible'),(48,'Sterile Gauze Pads',NULL,'Sterile gauze pads designed for wound dressing and first-aid applications.',120,4.7,'/catalog/healthcare/gauze-pads.png',100,90.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Romsons',640,'10 Pads','36 Months','2-3 Business Days','7 Days Return Eligible'),(49,'Adhesive Bandages',NULL,'Adhesive bandages for protecting minor cuts, scratches and small wounds.',70,4.9,'/catalog/healthcare/bandages.png',100,55.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Band-Aid',2150,'20 Bandages','36 Months','2-3 Business Days','7 Days Return Eligible'),(50,'Surgical Tape',NULL,'Medical-grade surgical tape for securing dressings and medical equipment.',110,4.7,'/catalog/healthcare/surgical-tape.png',100,85.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'3M',520,'1 Roll','36 Months','2-3 Business Days','7 Days Return Eligible'),(51,'Face Mask (Pack of 10)',NULL,'Disposable face masks designed to provide everyday protection from dust and airborne particles.',150,4.6,'/catalog/healthcare/face-mask.png',100,120.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'MediSafe',890,'10 Masks','36 Months','2-3 Business Days','7 Days Return Eligible'),(52,'Disposable Gloves',NULL,'Disposable medical gloves designed for hygiene and protection during everyday healthcare tasks.',190,4.8,'/catalog/healthcare/gloves.png',100,150.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'SafeCare',1120,'100 Gloves','36 Months','2-3 Business Days','7 Days Return Eligible'),(53,'Digital Thermometer',NULL,'Fast and accurate digital thermometer for convenient temperature measurement at home.',399,4.8,'/catalog/healthcare/digital-thermometer.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Omron',1680,'1 Device','3 Years','2-3 Business Days','14 Days Return Eligible'),(54,'Infrared Thermometer',NULL,'Non-contact infrared thermometer for quick and convenient temperature measurement.',1799,4.7,'/catalog/healthcare/infrared-thermometer.png',100,1499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'BPL',920,'1 Device','3 Years','3-4 Business Days','14 Days Return Eligible'),(55,'Pulse Oximeter',NULL,'Portable pulse oximeter designed to measure blood oxygen saturation and pulse rate.',1299,4.8,'/catalog/healthcare/pulse-oximeter.png',100,999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Dr. Trust',2450,'1 Device','3 Years','3-4 Business Days','14 Days Return Eligible'),(56,'Hot Water Bag',NULL,'Reusable hot water bag designed to provide soothing warmth and comfort.',299,4.6,'/catalog/healthcare/hot-water-bag.png',100,249.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Vissco',780,'2 Litres','24 Months','2-3 Business Days','7 Days Return Eligible'),(57,'Ice Gel Pack',NULL,'Reusable ice gel pack suitable for cooling and soothing minor injuries and swelling.',299,4.7,'/catalog/healthcare/ice-pack.png',100,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Tynor',690,'1 Pack','24 Months','2-3 Business Days','7 Days Return Eligible'),(58,'Pain Relief Spray',NULL,'Pain relief spray designed for temporary relief from muscle and joint discomfort.',260,4.8,'/catalog/healthcare/pain-spray.png',100,215.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Volini',1980,'100g Spray','24 Months','2-3 Business Days','7 Days Return Eligible'),(59,'Pain Relief Gel',NULL,'Topical pain relief gel for temporary relief from muscle and joint discomfort.',160,4.6,'/catalog/healthcare/pain-gel.png',100,130.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Moov',1650,'50g Gel','24 Months','2-3 Business Days','7 Days Return Eligible'),(60,'Crepe Bandage',NULL,'Stretchable crepe bandage providing comfortable support for sprains and strains.',140,4.7,'/catalog/healthcare/crepe-bandage.png',100,110.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Flamingo',850,'4 Metres','36 Months','2-3 Business Days','7 Days Return Eligible'),(61,'Elastic Knee Support',NULL,'Elastic knee support designed to provide compression and comfortable support during daily activities.',499,4.8,'/catalog/healthcare/knee-support.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Tynor',1280,'1 Support','36 Months','3-4 Business Days','14 Days Return Eligible'),(62,'Ankle Support',NULL,'Ankle support designed to provide compression and stability during everyday activities.',450,4.7,'/catalog/healthcare/ankle-support.png',100,350.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Vissco',940,'1 Support','36 Months','3-4 Business Days','14 Days Return Eligible'),(63,'Hand Wash 250ml',NULL,'Liquid hand wash that helps remove germs and maintain everyday hand hygiene.',125,4.8,'/catalog/healthcare/handwash.png',100,99.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Lifebuoy',1760,'250ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(64,'Disinfectant Spray',NULL,'Disinfectant spray designed to help clean and sanitize commonly touched household surfaces.',280,4.7,'/catalog/healthcare/disinfectant-spray.png',100,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Lizol',1120,'450ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(65,'Alcohol Swabs',NULL,'Alcohol swabs for cleaning skin surfaces before injections and other medical procedures.',100,4.6,'/catalog/healthcare/alcohol-swabs.png',100,80.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Romsons',540,'100 Swabs','36 Months','2-3 Business Days','7 Days Return Eligible'),(66,'Medical Scissors',NULL,'Durable medical scissors suitable for cutting dressings, medical tape and other healthcare materials.',180,4.7,'/catalog/healthcare/medical-scissors.png',100,140.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'MediCare',430,'1 Piece','5 Years','2-3 Business Days','7 Days Return Eligible'),(67,'Eye Wash Solution',NULL,'Eye wash solution designed to help cleanse and refresh tired or irritated eyes.',230,4.6,'/catalog/healthcare/eye-wash.png',100,190.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,10,'2026-11-02 10:52:51',0,'Optrex',720,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(68,'Revital H Capsules',NULL,'A daily multivitamin and mineral supplement designed to provide nutritional support.',420,4.9,'/catalog/vitamins/revital-h.png',50,300.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Sun Pharma',2450,'30 Capsules','24 Months',NULL,NULL),(69,'Limcee Vitamin C',NULL,'Vitamin C supplement available in convenient tablet form for daily nutritional support.',35,4.8,'/catalog/vitamins/limcee.png',80,25.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Abbott',1890,'15 Tablets','24 Months',NULL,NULL),(70,'Zincovit Tablets',NULL,'A combination of vitamins and minerals intended for daily nutritional supplementation.',200,4.8,'/catalog/vitamins/zincovit.png',45,110.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Apex',1650,'15 Tablets','24 Months',NULL,NULL),(71,'Shelcal 500',NULL,'Calcium and vitamin D nutritional supplement in tablet form.',170,4.7,'/catalog/vitamins/shelcal.png',60,145.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Torrent',1320,'15 Tablets','24 Months',NULL,NULL),(72,'Evion 400',NULL,'Vitamin E supplement provided in capsule form for nutritional support.',195,4.8,'/catalog/vitamins/evion400.png',55,165.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Merck',1780,'20 Capsules','24 Months',NULL,NULL),(73,'Becosules Capsules',NULL,'B-complex vitamin supplement intended to support daily nutritional needs.',70,4.6,'/catalog/vitamins/becosules.png',70,58.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Pfizer',980,'20 Capsules','24 Months',NULL,NULL),(74,'Neurobion Forte',NULL,'B-vitamin supplement containing a combination of B-group vitamins.',50,4.7,'/catalog/vitamins/neurobion.png',65,42.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'P&G',1450,'30 Tablets','24 Months',NULL,NULL),(75,'Calcimax Tablets',NULL,'Calcium-based nutritional supplement in tablet form.',250,4.7,'/catalog/vitamins/calcimax.png',48,210.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Meyer',870,'30 Tablets','24 Months',NULL,NULL),(76,'Supradyn Daily',NULL,'Daily multivitamin and mineral nutritional supplement.',340,4.9,'/catalog/vitamins/supradyn.png',52,290.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Bayer',2350,'15 Tablets','24 Months',NULL,NULL),(77,'A to Z NS Tablets',NULL,'Multivitamin and mineral nutritional supplement.',220,4.6,'/catalog/vitamins/atoz.png',45,185.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Alkem',920,'15 Tablets','24 Months',NULL,NULL),(78,'HealthKart Multivitamin',NULL,'Daily multivitamin supplement containing a combination of vitamins and minerals.',799,4.8,'/catalog/vitamins/hk-multivitamin.png',35,599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'HealthKart',3100,'60 Tablets','24 Months',NULL,NULL),(79,'Vitamin B Complex',NULL,'Vitamin B complex supplement provided in tablet form.',145,4.5,'/catalog/vitamins/vitamin-b.png',60,120.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Cipla',760,'20 Tablets','24 Months',NULL,NULL),(80,'Vitamin K2',NULL,'Vitamin K2 dietary supplement in capsule form.',1099,4.8,'/catalog/vitamins/vitamin-k2.png',25,899.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Now Foods',650,'60 Capsules','24 Months',NULL,NULL),(81,'Vitamin E Capsules',NULL,'Vitamin E nutritional supplement in capsule form.',200,4.7,'/catalog/vitamins/vitamin-e.png',55,170.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Evion',1140,'20 Capsules','24 Months',NULL,NULL),(82,'Biotin Tablets',NULL,'Biotin dietary supplement in tablet form.',599,4.7,'/catalog/vitamins/biotin.png',38,450.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Carbamide Forte',1920,'60 Tablets','24 Months',NULL,NULL),(83,'Iron & Folic Acid',NULL,'Iron and folic acid nutritional supplement.',115,4.6,'/catalog/vitamins/iron-folic.png',65,95.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Cipla',710,'30 Tablets','24 Months',NULL,NULL),(84,'Calcium + Magnesium',NULL,'Calcium and magnesium dietary supplement.',699,4.8,'/catalog/vitamins/calcium-magnesium.png',30,540.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'HK Vitals',1240,'60 Tablets','24 Months',NULL,NULL),(85,'Vitamin C Gummies',NULL,'Vitamin C nutritional supplement in gummy form.',899,4.9,'/catalog/vitamins/vitamin-c-gummies.png',42,699.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Power Gummies',2700,'60 Gummies','18 Months',NULL,NULL),(86,'Hair Skin Nails Gummies',NULL,'Gummy nutritional supplement containing vitamins and nutrients.',999,4.8,'/catalog/vitamins/hair-gummies.png',35,799.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Power Gummies',1980,'60 Gummies','18 Months',NULL,NULL),(87,'Vitamin A Capsules',NULL,'Vitamin A dietary supplement in capsule form.',165,4.5,'/catalog/vitamins/vitamin-a.png',50,140.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Abbott',540,'30 Capsules','24 Months',NULL,NULL),(88,'Vitamin B12 Tablets',NULL,'Vitamin B12 nutritional supplement in tablet form.',220,4.7,'/catalog/vitamins/vitamin-b12.png',55,180.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Cipla',1350,'30 Tablets','24 Months',NULL,NULL),(89,'Multivitamin Syrup',NULL,'Multivitamin nutritional supplement in syrup form.',260,4.6,'/catalog/vitamins/multivitamin-syrup.png',45,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Dexorange',680,'200 ml','24 Months',NULL,NULL),(90,'Immunity Booster Tablets',NULL,'Nutritional supplement designed for daily wellness support.',325,4.8,'/catalog/vitamins/immunity-booster.png',40,275.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,6,'2026-11-02 10:52:51',0,'Himalaya',1540,'60 Tablets','24 Months',NULL,NULL),(91,'Dove Beauty Soap',NULL,'Moisturizing beauty soap that gently cleanses and nourishes the skin.',80,4.8,'/catalog/personalCare/dove-soap.png',100,65.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Dove',1850,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(92,'Lux Soft Glow Soap',NULL,'Fragrant bathing soap that leaves the skin feeling soft and refreshed.',70,4.7,'/catalog/personalCare/lux-soap.png',100,55.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Lux',1420,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(93,'Pears Pure Soap',NULL,'Gentle transparent soap designed to cleanse and refresh the skin.',90,4.8,'/catalog/personalCare/pears-soap.png',100,75.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Pears',1260,'125g','24 Months','2-3 Business Days','7 Days Return Eligible'),(94,'Dettol Original Soap',NULL,'Antibacterial bathing soap for everyday personal hygiene.',55,4.7,'/catalog/personalCare/dettol-soap.png',100,45.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Dettol',2140,'125g','24 Months','2-3 Business Days','7 Days Return Eligible'),(95,'Lifebuoy Soap',NULL,'Hygiene soap that helps remove germs and keeps the skin clean.',50,4.6,'/catalog/personalCare/lifebuoy-soap.png',100,40.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Lifebuoy',1980,'125g','24 Months','2-3 Business Days','7 Days Return Eligible'),(96,'Clinic Plus Shampoo',NULL,'Everyday shampoo that gently cleanses hair and helps keep it healthy.',220,4.6,'/catalog/personalCare/clinic-plus.png',100,180.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Clinic Plus',1560,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(97,'Head & Shoulders Shampoo',NULL,'Anti-dandruff shampoo that cleanses the scalp and helps control dandruff.',350,4.8,'/catalog/personalCare/head-shoulders.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Head & Shoulders',2450,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(98,'Pantene Shampoo',NULL,'Nourishing shampoo that cleanses hair and helps improve smoothness.',320,4.7,'/catalog/personalCare/pantene.png',100,275.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Pantene',1740,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(99,'Sunsilk Shampoo',NULL,'Daily shampoo formulated to cleanse hair and leave it fresh and manageable.',260,4.6,'/catalog/personalCare/sunsilk.png',100,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Sunsilk',1380,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(100,'Dove Shampoo',NULL,'Moisturizing shampoo that gently cleanses and nourishes dry hair.',360,4.8,'/catalog/personalCare/dove-shampoo.png',100,310.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Dove',1920,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(101,'Parachute Coconut Oil',NULL,'Coconut hair oil that helps nourish the scalp and keep hair soft.',220,4.9,'/catalog/personalCare/parachute-oil.png',100,185.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Parachute',2860,'250ml','36 Months','2-3 Business Days','7 Days Return Eligible'),(102,'Indulekha Hair Oil',NULL,'Herbal hair oil designed to nourish the scalp and support healthy-looking hair.',450,4.8,'/catalog/personalCare/indulekha.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Indulekha',2190,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(103,'Livon Hair Serum',NULL,'Hair serum that helps smooth frizz and gives hair a soft, shiny finish.',350,4.7,'/catalog/personalCare/livon.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Livon',1680,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(104,'Nivea Body Lotion',NULL,'Moisturizing body lotion that helps keep skin soft, smooth and hydrated.',320,4.8,'/catalog/personalCare/nivea-lotion.png',100,275.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Nivea',2310,'400ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(105,'Vaseline Body Lotion',NULL,'Deep moisturizing body lotion for smooth and healthy-looking skin.',300,4.8,'/catalog/personalCare/vaseline-lotion.png',100,260.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Vaseline',2180,'400ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(106,'Pond\'s Face Wash',NULL,'Face wash that gently cleanses the skin and removes excess oil and impurities.',220,4.6,'/catalog/personalCare/ponds-facewash.png',100,180.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Pond\'s',1540,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(107,'Himalaya Neem Face Wash',NULL,'Neem-based face wash that gently cleanses skin and removes impurities.',210,4.8,'/catalog/personalCare/himalaya-facewash.png',100,175.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Himalaya',2650,'150ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(108,'Garnier Face Wash',NULL,'Refreshing face wash that cleanses the skin and removes excess oil.',240,4.7,'/catalog/personalCare/garnier-facewash.png',100,199.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Garnier',1890,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(109,'Cetaphil Cleanser',NULL,'Gentle facial cleanser suitable for cleansing and maintaining healthy-looking skin.',550,4.9,'/catalog/personalCare/cetaphil.png',100,499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Cetaphil',3120,'125ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(110,'Colgate Toothpaste',NULL,'Daily toothpaste designed to clean teeth and support everyday oral hygiene.',130,4.8,'/catalog/personalCare/colgate.png',100,110.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Colgate',4250,'200g','24 Months','2-3 Business Days','7 Days Return Eligible'),(111,'Sensodyne Toothpaste',NULL,'Toothpaste specially formulated for people with sensitive teeth.',250,4.9,'/catalog/personalCare/sensodyne.png',100,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Sensodyne',3680,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(112,'Pepsodent Toothpaste',NULL,'Everyday toothpaste for cleaning teeth and maintaining oral freshness.',115,4.6,'/catalog/personalCare/pepsodent.png',100,95.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Pepsodent',1420,'150g','24 Months','2-3 Business Days','7 Days Return Eligible'),(113,'Oral-B Toothbrush',NULL,'Manual toothbrush designed for effective daily cleaning of teeth and gums.',150,4.8,'/catalog/personalCare/oralb.png',100,120.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Oral-B',1980,'1 Toothbrush','36 Months','2-3 Business Days','7 Days Return Eligible'),(114,'Listerine Mouthwash',NULL,'Mouthwash that helps freshen breath and support everyday oral hygiene.',300,4.8,'/catalog/personalCare/listerine.png',100,260.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,7,'2026-11-02 10:52:51',0,'Listerine',2450,'250ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(115,'Johnson\'s Baby Lotion',NULL,'Gentle baby lotion that keeps your baby\'s skin soft and moisturized.',299,4.8,'/catalog/BabyCare/baby-lotion.png',100,239.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Johnson\'s',1542,'200ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(116,'Himalaya Baby Shampoo',NULL,'Tear-free baby shampoo enriched with natural herbs.',260,4.7,'/catalog/BabyCare/baby-shampoo.png',100,208.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Himalaya',1280,'200ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(117,'Baby Soap',NULL,'Mild moisturizing soap specially made for babies.',150,4.8,'/catalog/BabyCare/baby-soap.png',100,120.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Dove',942,'75g','36 Months','2-3 Business Days','7 Days Return Eligible'),(118,'Johnson\'s Baby Oil',NULL,'Baby massage oil enriched with Vitamin E.',320,4.9,'/catalog/BabyCare/baby-oil.png',100,256.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Johnson\'s',1850,'200ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(119,'Baby Wet Wipes',NULL,'Soft baby wipes with aloe vera and vitamin E.',180,4.7,'/catalog/BabyCare/baby-wipes.png',100,144.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Pampers',1180,'72 Wipes','24 Months','2-3 Business Days','7 Days Return Eligible'),(120,'Pampers Baby Diapers',NULL,'Extra absorbent diapers for day and night protection.',799,4.9,'/catalog/BabyCare/baby-diapers.png',100,639.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Pampers',2500,'40 Pieces','36 Months','2-3 Business Days','No Return'),(121,'Baby Body Wash',NULL,'Natural body wash for baby\'s delicate skin.',349,4.8,'/catalog/BabyCare/baby-wash.png',100,279.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Mamaearth',1020,'250ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(122,'Baby Rash Cream',NULL,'Provides fast relief from diaper rash.',399,4.8,'/catalog/BabyCare/baby-cream.png',100,319.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Sebamed',970,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(123,'Baby Toothpaste',NULL,'Safe fluoride-free toothpaste for babies.',199,4.7,'/catalog/BabyCare/baby-toothpaste.png',100,159.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Chicco',820,'50g','24 Months','2-3 Business Days','7 Days Return Eligible'),(124,'Baby Feeding Bottle',NULL,'BPA-free feeding bottle with anti-colic technology.',599,4.9,'/catalog/BabyCare/baby-bottle.png',100,479.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Philips Avent',1680,'260ml','36 Months','2-3 Business Days','7 Days Return Eligible'),(125,'Baby Feeding Spoon Set',NULL,'Soft-tip feeding spoon set for babies.',199,4.7,'/catalog/BabyCare/baby-spoon.png',100,159.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Mee Mee',920,'2 Pieces','36 Months','2-3 Business Days','7 Days Return Eligible'),(126,'Baby Bib',NULL,'Waterproof baby bib for mess-free feeding.',249,4.8,'/catalog/BabyCare/baby-bib.png',100,199.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'LuvLap',760,'1 Piece','36 Months','2-3 Business Days','7 Days Return Eligible'),(127,'Baby Nail Clipper',NULL,'Rounded-edge nail clipper specially designed for babies.',299,4.8,'/catalog/BabyCare/baby-clipper.png',100,239.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Chicco',540,'1 Piece','5 Years','2-3 Business Days','7 Days Return Eligible'),(128,'Baby Comb & Brush Set',NULL,'Soft comb and brush set for baby\'s delicate hair.',349,4.8,'/catalog/BabyCare/baby-comb.png',100,279.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Mee Mee',860,'2 Pieces','5 Years','2-3 Business Days','7 Days Return Eligible'),(129,'Baby Laundry Detergent',NULL,'Gentle detergent specially formulated for baby clothes.',449,4.7,'/catalog/BabyCare/baby-detergent.png',100,359.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Mee Mee',680,'1 Litre','24 Months','2-3 Business Days','7 Days Return Eligible'),(130,'Baby Mosquito Patch',NULL,'Natural mosquito repellent patches for babies.',299,4.8,'/catalog/BabyCare/baby-mosquito-patch.png',100,239.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Mamaearth',950,'24 Patches','24 Months','2-3 Business Days','7 Days Return Eligible'),(131,'Baby Cotton Buds',NULL,'Soft cotton buds specially designed for babies.',149,4.7,'/catalog/BabyCare/baby-cotton-buds.png',100,119.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Johnson\'s',830,'100 Pieces','36 Months','2-3 Business Days','7 Days Return Eligible'),(132,'Baby Silicone Pacifier',NULL,'Orthodontic silicone pacifier for newborn babies.',499,4.9,'/catalog/BabyCare/baby-pacifier.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Philips Avent',1200,'2 Pieces','36 Months','2-3 Business Days','7 Days Return Eligible'),(133,'Baby Gift Care Kit',NULL,'Complete baby care gift kit containing essential baby products.',999,4.9,'/catalog/BabyCare/baby-gift-kit.png',100,799.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,8,'2026-11-02 10:52:51',0,'Johnson\'s',1640,'1 Kit','24 Months','2-3 Business Days','7 Days Return Eligible'),(134,'Infrared Thermometer',NULL,'Non-contact infrared thermometer designed for quick and hygienic temperature measurement.',1899,4.9,'/catalog/medicalDevices/infrared-thermometer.png',100,1599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Omron',980,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(135,'Blood Glucose Strips',NULL,'Accurate blood glucose test strips for convenient blood sugar monitoring.',799,4.8,'/catalog/medicalDevices/glucose-strips.png',100,680.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Accu-Chek',875,'50 Strips','18 Months','2-3 Business Days','7 Days Return Eligible'),(136,'Nebulizer Machine',NULL,'Portable nebulizer machine designed to deliver medication in the form of a fine mist.',2999,4.8,'/catalog/medicalDevices/nebulizer.png',100,2499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Omron',1340,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(137,'Steam Vaporizer',NULL,'Electric steam vaporizer suitable for convenient steam inhalation at home.',1199,4.7,'/catalog/medicalDevices/steam-vaporizer.png',100,1000.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Dr. Morepen',920,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(138,'Digital Weighing Scale',NULL,'Digital weighing scale with accurate weight measurement for everyday health monitoring.',499,4.8,'/catalog/medicalDevices/weighing-scale.png',100,400.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'HealthSense',1480,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(139,'BMI Smart Scale',NULL,'Smart body weighing scale designed to help monitor weight and BMI.',1299,4.8,'/catalog/medicalDevices/bmi-scale.png',100,1000.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Dr. Trust',760,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(140,'Heating Pad',NULL,'Electric heating pad designed to provide soothing warmth for everyday comfort.',1499,4.7,'/catalog/medicalDevices/heating-pad.png',100,1300.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Dr. Trust',1180,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(141,'Electric Hot Water Bag',NULL,'Rechargeable electric hot water bag that provides convenient warmth and comfort.',699,4.7,'/catalog/medicalDevices/hot-water-bag.png',100,599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Vissco',950,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(142,'Stethoscope',NULL,'Professional stethoscope designed for clear and reliable auscultation.',4499,4.9,'/catalog/medicalDevices/stethoscope.png',100,3999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'3M Littmann',680,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(143,'Digital ECG Monitor',NULL,'Digital ECG monitoring device designed for convenient heart rhythm monitoring.',7999,4.8,'/catalog/medicalDevices/ecg-monitor.png',100,6999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'BPL',540,'1 Unit','24 Months','3-5 Business Days','7 Days Return Eligible'),(144,'Oxygen Concentrator',NULL,'Oxygen concentrator designed to provide a continuous supply of concentrated oxygen.',49999,4.9,'/catalog/medicalDevices/oxygen-concentrator.png',100,45999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Philips',320,'1 Unit','24 Months','3-5 Business Days','7 Days Return Eligible'),(145,'Wheelchair',NULL,'Comfortable and durable wheelchair designed for convenient mobility support.',1199,4.8,'/catalog/medicalDevices/wheelchair.png',100,1000.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Karma',890,'1 Unit','24 Months','3-5 Business Days','7 Days Return Eligible'),(146,'Walking Stick',NULL,'Lightweight walking stick designed to provide additional support while walking.',999,4.7,'/catalog/medicalDevices/walking-stick.png',100,900.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Tynor',760,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(147,'Walking Walker',NULL,'Strong and stable walking walker designed to provide mobility support.',3499,4.8,'/catalog/medicalDevices/walker.png',100,2999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Vissco',620,'1 Unit','24 Months','3-5 Business Days','7 Days Return Eligible'),(148,'Knee Support',NULL,'Comfortable knee support designed to provide compression and support during daily activities.',599,4.8,'/catalog/medicalDevices/knee-support.png',100,499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Tynor',1420,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(149,'Lumbar Support Belt',NULL,'Lumbar support belt designed to provide comfortable support to the lower back.',999,4.7,'/catalog/medicalDevices/lumbar-support.png',100,899.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Vissco',1100,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(150,'Cervical Collar',NULL,'Soft cervical collar designed to provide comfortable neck support.',799,4.7,'/catalog/medicalDevices/cervical-collar.png',100,699.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Flamingo',840,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(151,'Ankle Support',NULL,'Ankle support designed to provide comfortable compression and support during movement.',549,4.8,'/catalog/medicalDevices/ankle-support.png',100,449.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Tynor',930,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(152,'Wrist Brace',NULL,'Wrist brace designed to provide support and comfortable compression around the wrist.',499,4.7,'/catalog/medicalDevices/wrist-brace.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Flamingo',860,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(153,'Shoulder Support',NULL,'Shoulder support designed to provide comfortable support and compression around the shoulder.',899,4.8,'/catalog/medicalDevices/shoulder-support.png',100,799.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Vissco',720,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(154,'Elbow Support',NULL,'Elbow support designed to provide comfortable compression and support during daily activities.',499,4.7,'/catalog/medicalDevices/elbow-support.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'Tynor',650,'1 Unit','24 Months','2-3 Business Days','7 Days Return Eligible'),(155,'Portable Oxygen Cylinder',NULL,'Portable oxygen equipment designed for convenient oxygen support and mobility.',8999,4.7,'/catalog/medicalDevices/oxygen-concentrator.png',100,7999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,9,'2026-11-02 10:52:51',0,'MediSafe',410,'1 Unit','24 Months','3-5 Business Days','7 Days Return Eligible'),(156,'Refresh Tears Eye Drops',NULL,'Lubricating eye drops for dry and irritated eyes.',225,4.8,'/catalog/EyeCare/eye1.png',100,180.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Refresh',1450,'10ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(157,'Eye Wash Solution',NULL,'Gentle eye cleansing solution.',188,4.6,'/catalog/EyeCare/eye3.png',100,150.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Boroline',950,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(158,'Artificial Tears',NULL,'Advanced artificial tears for dry eye relief.',300,4.9,'/catalog/EyeCare/eye4.png',100,240.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Systane',1780,'10ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(159,'Eye Allergy Drops',NULL,'Relieves itchy and allergic eyes.',350,4.8,'/catalog/EyeCare/eye5.png',100,280.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Zaditor',1100,'5ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(160,'Eye Cooling Gel',NULL,'Cooling gel for tired eyes.',249,4.5,'/catalog/EyeCare/eye6.png',100,199.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Himalaya',850,'20g','24 Months','2-3 Business Days','7 Days Return Eligible'),(161,'Eye Care Wipes',NULL,'Sterile wipes for eyelid hygiene.',219,4.6,'/catalog/EyeCare/eye7.png',100,175.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Clean Eyes',760,'30 Wipes','24 Months','2-3 Business Days','7 Days Return Eligible'),(162,'Eye Vitamin Capsules',NULL,'Supports healthy vision and retina.',499,4.7,'/catalog/EyeCare/eye8.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'HealthVit',1320,'60 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(163,'Blue Light Protection Glasses',NULL,'Blocks harmful blue light from screens.',1125,4.8,'/catalog/EyeCare/eye9.png',99,899.00,0,0,0,NULL,NULL,'2026-11-10 08:16:06',1,11,'2026-11-02 10:52:51',0,'VisionPro',1780,'1 Piece','5 Years','3-5 Business Days','7 Days Return Eligible'),(164,'Eye Massage Roller',NULL,'Relieves eye strain and puffiness.',625,4.6,'/catalog/EyeCare/eye10.png',100,499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Relax',620,'1 Piece','5 Years','2-3 Business Days','7 Days Return Eligible'),(165,'Dry Eye Relief Drops',NULL,'Fast relief from dry eye symptoms.',263,4.7,'/catalog/EyeCare/eye11.png',100,210.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Refresh',980,'10ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(166,'Eye Cleansing Pads',NULL,'Soft cleansing pads for eyelids.',200,4.5,'/catalog/EyeCare/eye12.png',100,160.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Opticare',710,'20 Pads','24 Months','2-3 Business Days','7 Days Return Eligible'),(167,'Eye Cooling Mask',NULL,'Reusable cooling mask for eye relaxation.',438,4.8,'/catalog/EyeCare/eye13.png',100,350.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'CarePlus',870,'1 Piece','5 Years','2-3 Business Days','7 Days Return Eligible'),(168,'Eye Lubricant Gel',NULL,'Long-lasting eye lubricant gel.',338,4.9,'/catalog/EyeCare/eye14.png',100,270.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Systane',990,'10g','24 Months','2-3 Business Days','7 Days Return Eligible'),(169,'Eye Infection Drops',NULL,'Prescription eye drops for infections.',363,4.6,'/catalog/EyeCare/eye15.png',100,290.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Cipla',810,'5ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(170,'Eye Wash Cup',NULL,'Convenient eye wash cup.',150,4.4,'/catalog/EyeCare/eye16.png',100,120.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'HealthCare',420,'1 Piece','5 Years','2-3 Business Days','7 Days Return Eligible'),(171,'Eye Protection Goggles',NULL,'Protective goggles for medical and industrial use.',688,4.7,'/catalog/EyeCare/eye17.png',100,550.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Safety',940,'1 Piece','5 Years','3-5 Business Days','7 Days Return Eligible'),(172,'Eye Moisturizing Drops',NULL,'Hydrates and refreshes dry eyes.',325,4.8,'/catalog/EyeCare/eye18.png',100,260.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'Optive',1050,'10ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(173,'Eye Health Tablets',NULL,'Supports vision and eye health.',600,4.7,'/catalog/EyeCare/eye19.png',100,480.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'HealthAid',1325,'60 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(174,'Vision Support Capsules',NULL,'Advanced eye nutrition capsules with lutein.',650,4.8,'/catalog/EyeCare/eye20.png',100,520.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,11,'2026-11-02 10:52:51',0,'VisionCare',1680,'60 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(175,'Anti Hair Fall Shampoo',NULL,'Anti hair fall shampoo that gently cleanses the scalp and helps strengthen hair.',349,4.8,'/catalog/hairCare/hair1.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Dove',1245,'340ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(176,'Hair Growth Oil',NULL,'Nourishing hair oil designed to support healthy-looking hair and scalp.',449,4.7,'/catalog/hairCare/hair2.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Indulekha',985,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(177,'Onion Hair Oil',NULL,'Onion hair oil enriched with nourishing ingredients for smooth and healthy-looking hair.',499,4.8,'/catalog/hairCare/hair4.png',100,449.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Mamaearth',1320,'150ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(178,'Hair Conditioner',NULL,'Hair conditioner that helps make hair softer, smoother and easier to manage.',349,4.7,'/catalog/hairCare/hair5.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'L\'Oréal',870,'180ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(179,'Hair Serum',NULL,'Lightweight hair serum that helps control frizz and gives hair a smooth finish.',599,4.8,'/catalog/hairCare/hair6.png',100,550.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Livon',1120,'100ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(180,'Keratin Shampoo',NULL,'Keratin shampoo formulated to cleanse hair while helping improve smoothness.',799,4.9,'/catalog/hairCare/hair7.png',100,699.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Tresemme',1430,'580ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(181,'Aloe Vera Hair Gel',NULL,'Aloe vera hair gel suitable for styling and conditioning hair.',260,4.5,'/catalog/hairCare/hair8.png',100,220.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Patanjali',760,'150ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(182,'Hair Repair Mask',NULL,'Deep conditioning hair mask that helps nourish dry and damaged-looking hair.',599,4.8,'/catalog/hairCare/hair9.png',100,499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'L\'Oréal',920,'250ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(183,'Coconut Hair Oil',NULL,'Coconut-based hair oil that helps nourish and condition the hair.',249,4.9,'/catalog/hairCare/hair10.png',100,199.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Parachute',2450,'250ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(184,'Argan Hair Oil',NULL,'Argan hair oil that helps provide nourishment and shine to dry-looking hair.',699,4.7,'/catalog/hairCare/hair11.png',100,599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'StBotanica',680,'120ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(185,'Herbal Shampoo',NULL,'Herbal shampoo formulated with plant-based ingredients for gentle hair cleansing.',320,4.6,'/catalog/hairCare/hair12.png',100,280.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Himalaya',890,'400ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(186,'Hair Styling Gel',NULL,'Hair styling gel that provides hold and helps create different hairstyles.',399,4.5,'/catalog/hairCare/hair13.png',100,350.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Set Wet',540,'250g','24 Months','2-3 Business Days','7 Days Return Eligible'),(187,'Hair Wax',NULL,'Hair wax designed to provide styling control and a natural-looking finish.',449,4.7,'/catalog/hairCare/hair14.png',100,399.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Beardo',620,'100g','24 Months','2-3 Business Days','7 Days Return Eligible'),(188,'Hair Spray',NULL,'Hair spray that helps maintain hairstyles with a lightweight finish.',499,4.6,'/catalog/hairCare/hair15.png',100,450.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Schwarzkopf',480,'300ml','24 Months','2-3 Business Days','7 Days Return Eligible'),(189,'Hair Color Black',NULL,'Black hair color designed for convenient at-home hair coloring.',349,4.5,'/catalog/hairCare/hair16.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Garnier',780,'1 Pack','24 Months','2-3 Business Days','7 Days Return Eligible'),(190,'Hair Color Brown',NULL,'Brown hair color for achieving a natural-looking hair shade.',380,4.4,'/catalog/hairCare/hair17.png',100,320.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Godrej',650,'1 Pack','24 Months','2-3 Business Days','7 Days Return Eligible'),(191,'Hair Comb Premium',NULL,'Premium hair comb designed for comfortable and easy daily hair grooming.',199,4.6,'/catalog/hairCare/hair18.png',100,149.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Vega',430,'1 Comb','3 Years','2-3 Business Days','14 Days Return Eligible'),(192,'Hair Brush',NULL,'Hair brush designed for smooth and comfortable everyday grooming.',349,4.7,'/catalog/hairCare/hair19.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Philips',590,'1 Brush','3 Years','2-3 Business Days','14 Days Return Eligible'),(193,'Hair Dryer',NULL,'Compact hair dryer with multiple settings for convenient everyday styling.',1899,4.8,'/catalog/hairCare/hair20.png',100,1599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,12,'2026-11-02 10:52:51',0,'Philips',1250,'1 Hair Dryer','3 Years','3-4 Business Days','14 Days Return Eligible'),(194,'Calcium Vitamin D3 Tablets',NULL,'Calcium Vitamin D3 tablets support bone strength and women\'s wellness.',399,4.8,'/catalog/womensHealth/womens2.png',100,299.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Cipla',1200,'60 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(195,'Women\'s Daily Multivitamin Capsules',NULL,'Daily multivitamin capsules provide essential vitamins and minerals for women.',599,4.6,'/catalog/womensHealth/womens3.png',100,449.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'HealthKart',760,'60 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(196,'Women\'s Probiotic Capsules',NULL,'Supports digestive health and women\'s intimate wellness.',999,4.8,'/catalog/womensHealth/womens5.png',100,799.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Wellbeing Nutrition',540,'30 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(197,'Biotin Hair Growth Capsules',NULL,'Supports healthy hair growth and stronger hair.',799,4.7,'/catalog/womensHealth/womens7.png',100,599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'HealthKart',670,'60 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(198,'Women\'s Protein Supplement',NULL,'Protein supplement designed to support women\'s fitness and nutrition.',1999,4.8,'/catalog/womensHealth/womens8.png',100,1699.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Optimum Nutrition',430,'1 Kg','18 Months','2-3 Business Days','7 Days Return Eligible'),(199,'Folic Acid Tablets',NULL,'Folic acid supports nutritional requirements of women.',120,4.8,'/catalog/womensHealth/womens9.png',100,99.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Cipla',1500,'30 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(200,'Women\'s Wellness Supplement',NULL,'Supports immunity, energy and overall women\'s health.',1299,4.9,'/catalog/womensHealth/womens10.png',100,999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'NutriCare',850,'60 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(201,'Omega 3 Fish Oil Capsules For Women',NULL,'Omega 3 capsules support heart health, brain function and overall wellness in women.',899,4.7,'/catalog/womensHealth/womens11.png',100,699.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'HealthKart',620,'60 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(202,'Vitamin C Immunity Tablets For Women',NULL,'Vitamin C tablets help improve immunity and provide antioxidant support.',299,4.8,'/catalog/womensHealth/womens12.png',100,229.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Cipla',950,'60 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(203,'Menopause Support Capsules',NULL,'Menopause support capsules help manage women\'s wellness during menopause.',1199,4.7,'/catalog/womensHealth/womens14.png',100,899.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Wellbeing Nutrition',420,'30 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(204,'Women\'s Hair Skin Nails Supplement',NULL,'Supplement containing nutrients that support healthy hair, skin and nails.',999,4.7,'/catalog/womensHealth/womens16.png',100,799.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'WOW Life Science',670,'60 Tablets','24 Months','2-3 Business Days','7 Days Return Eligible'),(205,'Women\'s Energy Boost Capsules',NULL,'Energy boost capsules help reduce fatigue and support active lifestyles.',799,4.6,'/catalog/womensHealth/womens17.png',100,599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'NutriCare',350,'30 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(206,'Collagen Beauty Supplement',NULL,'Collagen supplement supports skin elasticity and healthy appearance.',1499,4.8,'/catalog/womensHealth/womens18.png',100,1199.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'HealthKart',890,'30 Sachets','18 Months','2-3 Business Days','7 Days Return Eligible'),(207,'Women\'s Digestive Health Probiotic',NULL,'Probiotic supplement supports digestive health and gut balance.',899,4.7,'/catalog/womensHealth/womens19.png',100,699.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,13,'2026-11-02 10:52:51',0,'Wellbeing Nutrition',510,'30 Capsules','24 Months','2-3 Business Days','7 Days Return Eligible'),(208,'Omron Digital Blood Pressure Monitor',NULL,'A reliable digital blood pressure monitor designed for accurate and convenient blood pressure monitoring at home.',1999,4.9,'/catalog/premium/premium1.png',25,1600.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Omron',1850,'1 Device','36 Months',NULL,NULL),(209,'Accu-Chek Instant Glucometer',NULL,'A compact blood glucose monitoring system designed for convenient and easy blood sugar testing.',3299,4.9,'/catalog/premium/premium2.png',18,2860.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Accu-Chek',1420,'1 Glucometer Kit','36 Months',NULL,NULL),(210,'Philips Digital Thermometer',NULL,'A fast and easy-to-use digital thermometer designed for accurate temperature measurement.',250,4.8,'/catalog/premium/premium3.png',45,180.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Philips',2340,'1 Thermometer','36 Months',NULL,NULL),(211,'Braun Ear Thermometer',NULL,'A premium infrared ear thermometer designed to provide fast and convenient temperature readings.',5999,4.9,'/catalog/premium/premium4.png',12,5100.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Braun',980,'1 Device','36 Months',NULL,NULL),(212,'Dr. Morepen Pulse Oximeter',NULL,'A portable pulse oximeter designed to measure blood oxygen saturation and pulse rate.',1999,4.8,'/catalog/premium/premium5.png',30,1599.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Dr. Morepen',1650,'1 Oximeter','36 Months',NULL,NULL),(213,'Philips Nebulizer',NULL,'A compact nebulizer designed to deliver medication in an inhalable mist for respiratory care.',3199,4.8,'/catalog/premium/premium6.png',20,2600.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Philips',1250,'1 Nebulizer','36 Months',NULL,NULL),(214,'Ensure Vanilla Nutrition Powder',NULL,'A nutritional supplement designed to provide balanced nutrition and support daily health and wellness.',420,4.9,'/catalog/premium/premium7.png',50,360.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Ensure',2450,'400 g','18 Months',NULL,NULL),(215,'Pediasure Complete Nutrition',NULL,'A complete nutritional supplement formulated to support children\'s growth and development.',1199,4.9,'/catalog/premium/premium8.png',35,1000.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Abbott',2180,'400 g','18 Months',NULL,NULL),(216,'Premium Omega-3 Capsules',NULL,'Omega-3 capsules providing essential fatty acids to support overall health and wellness.',1299,4.8,'/catalog/premium/premium9.png',40,999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'HK Vitals',1760,'60 Capsules','24 Months',NULL,NULL),(217,'Vitamin D3 Premium Tablets',NULL,'Vitamin D3 supplement designed to support normal bones, muscles and overall nutritional health.',350,4.8,'/catalog/premium/premium10.png',55,280.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'HealthKart',1920,'60 Tablets','24 Months',NULL,NULL),(218,'Premium Multivitamin Capsules',NULL,'A daily multivitamin supplement containing essential vitamins and minerals for nutritional support.',799,4.8,'/catalog/premium/premium11.png',45,600.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Carbamide Forte',2840,'60 Capsules','24 Months',NULL,NULL),(219,'Himalaya Wellness Kit',NULL,'A wellness care kit containing selected products designed to support everyday personal health and care.',350,4.7,'/catalog/premium/premium12.png',30,270.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Himalaya',1350,'Wellness Kit','24 Months',NULL,NULL),(220,'Dettol No Touch Hand Wash Starter Pack Automatic Antibacterial',NULL,'An automatic hand wash dispenser designed for convenient and hygienic hand washing without touching the dispenser.',1299,4.8,'/catalog/premium/premium13.png',22,1000.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Dettol',890,'1 Automatic Dispenser','24 Months',NULL,NULL),(221,'Johnson\'s Baby Premium Care Kit',NULL,'A baby care kit containing gentle everyday care essentials suitable for baby\'s daily hygiene routine.',325,4.9,'/catalog/premium/premium14.png',38,250.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Johnson & Johnson',1540,'Baby Care Kit','24 Months',NULL,NULL),(222,'Premium First Aid Kit',NULL,'A comprehensive first aid kit containing essential healthcare supplies for everyday emergency preparedness.',1699,4.9,'/catalog/premium/premium15.png',20,1300.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'MEDIKART',760,'Complete First Aid Kit','36 Months',NULL,NULL),(223,'Tynor Knee Support',NULL,'A supportive knee brace designed to provide stability and comfort during everyday activities.',1899,4.8,'/catalog/premium/premium16.png',28,1500.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Tynor',1120,'1 Knee Support','36 Months',NULL,NULL),(224,'Flamingo Back Support Belt',NULL,'A back support belt designed to provide comfortable lumbar support during daily activities.',1399,4.7,'/catalog/premium/premium17.png',25,1100.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Flamingo',940,'1 Back Support Belt','36 Months',NULL,NULL),(225,'Premium Hot Water Bag',NULL,'A reusable hot water bag designed to provide soothing warmth and comfort whenever needed.',699,4.7,'/catalog/premium/premium18.png',40,499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'MEDIKART',1280,'1 Hot Water Bag','36 Months',NULL,NULL),(226,'Premium Heating Pad',NULL,'An electric heating pad designed to provide adjustable warmth and comfortable heat therapy.',1999,4.8,'/catalog/premium/premium19.png',18,1600.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Dr. Morepen',870,'1 Heating Pad','36 Months',NULL,NULL),(227,'Premium Weighing Scale',NULL,'A digital weighing scale designed for convenient and accurate body weight measurement at home.',699,4.9,'/catalog/premium/premium20.png',32,499.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Omron',1430,'1 Digital Weighing Scale','36 Months',NULL,NULL),(228,'Premium Digital ECG Monitor',NULL,'A premium digital ECG monitoring device designed for convenient heart rhythm monitoring.',10999,5,'/catalog/premium/premium21.png',10,8999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Omron',540,'1 ECG Monitor','36 Months',NULL,NULL),(229,'Premium Oxygen Concentrator',NULL,'A premium oxygen concentrator designed to provide a continuous supply of concentrated oxygen.',52999,5,'/catalog/premium/premium22.png',5,45999.00,0,0,0,NULL,NULL,'2026-11-02 10:52:51',1,14,'2026-11-02 10:52:51',0,'Philips',320,'1 Oxygen Concentrator','36 Months',NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_requests`
--

DROP TABLE IF EXISTS `return_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_record_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reason` text NOT NULL,
  `status` varchar(30) NOT NULL,
  `admin_note` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_return_order` (`order_record_id`),
  KEY `ix_return_requests_order_record_id` (`order_record_id`),
  KEY `ix_return_requests_user_id` (`user_id`),
  KEY `ix_return_requests_id` (`id`),
  CONSTRAINT `return_requests_ibfk_1` FOREIGN KEY (`order_record_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `return_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_requests`
--

LOCK TABLES `return_requests` WRITE;
/*!40000 ALTER TABLE `return_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_list_imports`
--

DROP TABLE IF EXISTS `shopping_list_imports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_list_imports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `list_type` varchar(20) NOT NULL,
  `migration_id` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shopping_list_import` (`user_id`,`list_type`,`migration_id`),
  KEY `ix_shopping_list_imports_user_id` (`user_id`),
  KEY `ix_shopping_list_imports_id` (`id`),
  CONSTRAINT `shopping_list_imports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_list_imports`
--

LOCK TABLES `shopping_list_imports` WRITE;
/*!40000 ALTER TABLE `shopping_list_imports` DISABLE KEYS */;
INSERT INTO `shopping_list_imports` VALUES (1,1,'wishlist','4b001b09-4bda-4db0-988c-9a3ef7f12a4b','2026-11-04 07:16:15');
/*!40000 ALTER TABLE `shopping_list_imports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `user_account_data`
--

DROP TABLE IF EXISTS `user_account_data`;
/*!50001 DROP VIEW IF EXISTS `user_account_data`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_account_data` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `email`,
 1 AS `phone`,
 1 AS `is_active`,
 1 AS `is_verified`,
 1 AS `is_admin`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(2048) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Satender Kashyap','satenderkashyap18@gmail.com','$2b$12$gmgMTC//tTaj7XPH3P2U1u9w.VP1NsdvG/qAZ/FHB7BIok4sd2R5S',0,'9182513854',1,0,'2026-09-24 12:32:04','\"C:\\Users\\Satender Kashyap\\Desktop\\1111.jpeg\"','2026-11-11 15:10:14','2026-11-11 09:40:14',NULL),(6,'Satender','satenderkashyap10@gmail.com','$2b$12$jRts9k3xZXQxppLfN6lCDOVMJEf0tmRAgszh6iGIH5AZ0tBW1OneK',0,NULL,1,0,'2026-10-22 12:00:10',NULL,'2026-10-22 12:00:18','2026-10-22 06:30:18',NULL),(7,'Sai','sai@gmail.com','$2b$12$.EhtvsBFkEPGqNaiC97tJuPG49MsRlZ9RHPeaxRn/Zvm.jnnxqfwu',0,NULL,1,0,'2026-10-22 15:00:29',NULL,'2026-10-22 15:00:37','2026-10-22 09:30:38',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `ix_wishlists_id` (`id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,1,75,NULL);
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `user_account_data`
--

/*!50001 DROP VIEW IF EXISTS `user_account_data`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_account_data` AS select `users`.`id` AS `id`,`users`.`name` AS `name`,`users`.`email` AS `email`,`users`.`phone` AS `phone`,`users`.`is_active` AS `is_active`,`users`.`is_verified` AS `is_verified`,`users`.`is_admin` AS `is_admin`,`users`.`created_at` AS `created_at` from `users` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-11 15:31:08
