-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: universediu
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
-- Current Database: `universediu`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `universediu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `universediu`;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_attachments_post` (`post_id`),
  CONSTRAINT `fk_attachments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
INSERT INTO `attachments` VALUES (2,5,'React_CRUD_Tutorial.pdf','2.4 MB','PDF',''),(3,8,'Human Following Robot.docx','1.33 MB','application/vnd.openxmlformats-officedocument.wordprocessingml.document','fe416ddf-4156-4a8a-8a89-90664faa286d.docx'),(4,9,'wp6571576.jpg','209.8 KB','image/jpeg','764713cc-973a-49a2-b025-ee40d5d86978.jpg'),(5,9,'Human Following Robot.docx','1.33 MB','application/vnd.openxmlformats-officedocument.wordprocessingml.document','59e82b42-1035-480b-9a79-78d77b47586f.docx'),(10,18,'drew starkey (1).jpeg','53.0 KB','image/jpeg','c234e553-b4bc-49fc-a42d-e57097aa6e01.jpeg'),(11,22,'drew starkey (1).jpeg','53.0 KB','image/jpeg','e6e2f4ba-bfa6-4b28-89e3-213065504a84.jpeg'),(12,26,'download (1).jpeg','138.0 KB','image/jpeg','0d3e7ac3-88d6-4357-8ce5-6e28aabacebe.jpeg');
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_id` int NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_actor` (`actor_id`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,2,'SYSTEM_INIT','DATABASE',1,'Initial university course and seed data provisioned.','2026-10-29 12:51:33'),(2,2,'CHANGE_USER_STATUS','USER',3,'{\"newStatus\":\"SUSPENDED\"}','2026-11-21 00:25:44'),(3,2,'DELETE_REPORTED_POST','POST',1,'{\"reportId\":\"1\",\"reason\":\"Inappropriate content\"}','2026-11-21 00:26:21'),(4,2,'CHANGE_USER_STATUS','USER',3,'{\"newStatus\":\"ACTIVE\"}','2026-11-21 15:13:50'),(5,2,'RESOLVE_REPORT','REPORT',2,'{\"status\":\"RESOLVED\",\"reason\":\"Spam post\"}','2026-11-24 11:14:07'),(6,2,'CREATE_COURSE','COURSE',5,'{\"code\":\"SE699\",\"name\":\"Introduction of Awami dirty Politics\"}','2026-11-25 17:52:35'),(7,2,'DELETE_COURSE','COURSE',4,'{\"code\":\"MAT-111\",\"name\":\"Calculus & Analytical Geometry\"}','2026-11-25 17:52:43');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `author_id` int NOT NULL,
  `parent_comment_id` int DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `helpful_count` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post` (`post_id`),
  KEY `idx_comments_author` (`author_id`),
  KEY `idx_comments_parent` (`parent_comment_id`),
  CONSTRAINT `fk_comments_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (10,5,3,NULL,'commmed for testing',0,'2026-11-21 00:10:35'),(11,5,3,NULL,'Automated test verification comment!',0,'2026-11-21 15:16:46'),(12,5,3,NULL,'Automated test verification comment!',0,'2026-11-21 15:17:13'),(13,5,3,NULL,'Automated test verification comment!',0,'2026-11-21 15:21:08'),(14,14,2,NULL,'I think it is fine',0,'2026-11-22 17:07:30'),(15,14,2,NULL,'i thinks it is fine',0,'2026-11-22 17:13:12'),(16,14,2,15,'replied',0,'2026-11-22 17:24:18'),(17,14,2,16,'really bro',0,'2026-11-22 17:32:11'),(18,14,2,16,'ok',0,'2026-11-22 17:32:22'),(19,14,2,16,'he should not do it',0,'2026-11-22 17:32:58'),(20,14,2,16,'final',0,'2026-11-22 17:34:29'),(21,14,2,20,'it is not ok bro',0,'2026-11-22 23:23:39'),(22,14,2,NULL,'now work',0,'2026-11-22 23:35:28'),(23,14,9,NULL,'hmm',0,'2026-11-23 09:11:26'),(24,14,2,23,'it is working bro....',0,'2026-11-23 09:12:06'),(25,14,2,24,'bye friends',0,'2026-11-23 09:17:34'),(26,9,10,NULL,'good',0,'2026-11-23 13:17:30'),(27,4,2,NULL,'i think as a admin you should be removed from the page',0,'2026-11-24 12:23:46'),(28,16,9,NULL,'hmm nice',0,'2026-11-25 15:01:40'),(29,16,2,28,'ok',0,'2026-11-25 15:02:35'),(30,21,9,NULL,'fsdff',0,'2026-11-25 20:50:14'),(31,21,9,30,'hey',0,'2026-11-25 20:50:21'),(32,26,9,NULL,'Testing enrolled course access',0,'2026-11-25 21:58:10');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conversation_user` (`conversation_id`,`user_id`),
  KEY `idx_participant_user` (`user_id`),
  CONSTRAINT `fk_participants_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_participants_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
INSERT INTO `conversation_participants` VALUES (1,1,9,'2026-11-23 10:19:06',NULL),(2,1,4,'2026-11-23 10:19:06',NULL),(3,2,9,'2026-11-23 10:21:21','2026-11-24 19:13:02'),(4,2,10,'2026-11-23 10:21:21','2026-11-23 10:40:27'),(5,3,2,'2026-11-24 17:51:20','2026-11-25 17:10:12'),(6,3,9,'2026-11-24 17:51:20','2026-11-25 15:23:40'),(7,4,9,'2026-11-25 20:58:09','2026-11-25 21:04:37'),(8,4,8,'2026-11-25 20:58:09',NULL);
/*!40000 ALTER TABLE `conversation_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('DIRECT','GROUP') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DIRECT',
  `direct_key` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conversations_direct_key` (`direct_key`),
  KEY `fk_conversations_creator` (`created_by`),
  CONSTRAINT `fk_conversations_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'DIRECT','4:9',9,'2026-11-23 10:19:06','2026-11-23 10:19:06'),(2,'DIRECT','9:10',9,'2026-11-23 10:21:21','2026-11-24 19:12:21'),(3,'DIRECT','2:9',2,'2026-11-24 17:51:20','2026-11-25 15:22:07'),(4,'DIRECT','8:9',9,'2026-11-25 20:58:09','2026-11-25 20:58:28');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_enrollments`
--

DROP TABLE IF EXISTS `course_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_enrollment` (`user_id`,`course_id`),
  KEY `idx_enrollments_course` (`course_id`),
  CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_enrollments`
--

LOCK TABLES `course_enrollments` WRITE;
/*!40000 ALTER TABLE `course_enrollments` DISABLE KEYS */;
INSERT INTO `course_enrollments` VALUES (3,9,2,'2026-11-25 19:31:06'),(4,9,1,'2026-11-25 20:52:18');
/*!40000 ALTER TABLE `course_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  `semester` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Spring 2026',
  `instructor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructor_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_code` (`code`),
  KEY `fk_courses_department` (`department_id`),
  CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'SE-322','Web Application Lab',1,'Spring 2026','Dr. Sheikh Mohammad','Associate Professor, SWE','This course focuses on web application development using modern technologies like HTML, CSS, JavaScript, Node.js, Express and databases.','2026-10-29 12:51:33'),(2,'SE-213','Object Oriented Programming',1,'Spring 2026','Mr. Ashiqur Rahman','Senior Lecturer, SWE','Core object oriented design principles, Java, polymorphism, inheritance, design patterns.','2026-10-29 12:51:33'),(3,'CSE-311','Database Management Systems',2,'Spring 2026','Ms. Nadia Sultana','Assistant Professor, CSE','Relational database design, normalization, indexing, query execution, and transactions in SQL.','2026-10-29 12:51:33'),(5,'SE699','Introduction of Awami dirty Politics',3,'Summer 2026',NULL,NULL,NULL,'2026-11-25 17:52:35');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_departments_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'SWE','Software Engineering'),(2,'CSE','Computer Science & Engineering'),(3,'EEE','Electrical & Electronic Engineering');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_attachments`
--

DROP TABLE IF EXISTS `message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_message_attachments_message` (`message_id`),
  CONSTRAINT `fk_message_attachments_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_attachments`
--

LOCK TABLES `message_attachments` WRITE;
/*!40000 ALTER TABLE `message_attachments` DISABLE KEYS */;
INSERT INTO `message_attachments` VALUES (1,14,'drew starkey (1).jpeg',54283,'image/jpeg','3f254453-f4c1-4351-87ce-d6c878bc54e5.jpeg'),(2,15,'Human Following Robot.docx',1393731,'application/vnd.openxmlformats-officedocument.wordprocessingml.document','4eb39cd0-c0b5-4600-b0e4-e09dcff4d046.docx'),(3,16,'L-9-Logistic-Regression-Activation-Functions.pptx.pdf',591859,'application/pdf','1164041f-50a7-459b-a177-ff64cf1e3cc5.pdf'),(4,38,'wp6571576.jpg',214810,'image/jpeg','e71f820c-2d14-4c68-901f-8ea7de338080.jpg'),(5,41,'wp6571576.jpg',214810,'image/jpeg','a4cbdd2d-a238-4085-b818-c9bf9625aa72.jpg'),(6,43,'download (2).jpeg',84965,'image/jpeg','d02c838f-60dd-48bc-b65c-fa2f6f564178.jpeg');
/*!40000 ALTER TABLE `message_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `edited_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `reply_to_message_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation` (`conversation_id`,`created_at`),
  KEY `idx_messages_sender` (`sender_id`),
  KEY `fk_messages_reply` (`reply_to_message_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_reply` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,2,9,'Hey Munna! Let\'s chat on University Knowledge Platform.','2026-11-23 10:21:30',NULL,NULL,NULL),(2,2,10,'hmm','2026-11-23 10:34:46',NULL,NULL,NULL),(3,2,9,'ki hoise bhai','2026-11-23 10:36:27',NULL,NULL,NULL),(4,2,10,'kicu na','2026-11-23 10:36:34',NULL,NULL,NULL),(5,3,2,'hello hasu','2026-11-24 17:51:27',NULL,NULL,NULL),(6,3,2,'i am fine','2026-11-24 17:57:05',NULL,NULL,NULL),(7,3,2,'hello world','2026-11-24 18:03:55',NULL,NULL,NULL),(8,3,2,'ok','2026-11-24 18:04:08',NULL,NULL,NULL),(9,3,2,'hello','2026-11-24 18:05:29',NULL,NULL,NULL),(10,3,9,'i am hasu','2026-11-24 18:09:15',NULL,NULL,NULL),(11,3,9,'what is your name','2026-11-24 18:10:18',NULL,NULL,NULL),(12,3,2,'i am admin','2026-11-24 18:10:34',NULL,NULL,NULL),(13,3,9,'oh reaaly','2026-11-24 18:10:40',NULL,NULL,NULL),(14,3,2,'','2026-11-24 18:48:14',NULL,NULL,NULL),(15,3,2,'','2026-11-24 18:48:41',NULL,NULL,NULL),(16,3,9,'','2026-11-24 18:51:15',NULL,NULL,NULL),(17,3,9,'i sent u','2026-11-24 19:02:15',NULL,NULL,NULL),(18,3,2,'yeah','2026-11-24 19:02:37',NULL,NULL,NULL),(19,3,2,'and u have something to say???','2026-11-24 19:03:42',NULL,NULL,NULL),(20,2,9,'ami kicu bolbo na','2026-11-24 19:12:21',NULL,NULL,NULL),(21,3,2,'hello hasu','2026-11-24 22:55:52',NULL,NULL,NULL),(22,3,2,'i am very fine','2026-11-24 22:56:08',NULL,NULL,NULL),(23,3,2,'how do you think','2026-11-24 22:56:13',NULL,NULL,NULL),(24,3,2,'it is very funny','2026-11-24 22:56:22',NULL,NULL,NULL),(25,3,9,'i undestood','2026-11-24 22:56:27',NULL,NULL,NULL),(26,3,9,'bu in this case i donts think','2026-11-24 22:56:42',NULL,NULL,NULL),(27,3,9,'hey hasu','2026-11-24 22:57:18',NULL,NULL,NULL),(28,3,9,'how are u','2026-11-24 22:57:22',NULL,NULL,NULL),(29,3,9,'i am fine','2026-11-24 22:57:27',NULL,NULL,NULL),(30,3,9,'wel i relly dont think so','2026-11-25 00:10:56',NULL,NULL,NULL),(31,3,2,'i am cnfused','2026-11-25 00:11:33',NULL,NULL,NULL),(32,3,9,'why','2026-11-25 00:12:08',NULL,NULL,NULL),(36,3,9,'hey hasu','2026-11-25 15:03:22',NULL,NULL,NULL),(37,3,2,'ok','2026-11-25 15:03:42',NULL,NULL,NULL),(38,3,2,'','2026-11-25 15:04:04',NULL,NULL,NULL),(39,3,9,'sdfh k dfs dsf dfs ddjkfdhs','2026-11-25 15:04:49',NULL,NULL,NULL),(41,3,9,'','2026-11-25 15:22:07',NULL,NULL,NULL),(42,4,9,'sjfjkh','2026-11-25 20:58:13',NULL,NULL,NULL),(43,4,9,'','2026-11-25 20:58:28',NULL,NULL,NULL);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `actor_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `comment_id` int DEFAULT NULL,
  `type` enum('COMMENT','REPLY','HELPFUL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`,`is_read`,`created_at`),
  KEY `idx_notifications_actor` (`actor_id`),
  KEY `idx_notifications_post` (`post_id`),
  KEY `idx_notifications_comment` (`comment_id`),
  CONSTRAINT `fk_notifications_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,9,14,23,'COMMENT','commented on your post',1,'2026-11-23 09:11:26'),(2,9,2,14,24,'REPLY','replied to your comment',1,'2026-11-23 09:12:06'),(4,2,10,14,NULL,'HELPFUL','marked your post as helpful',1,'2026-11-23 10:40:35'),(5,8,10,9,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-23 13:17:25'),(6,8,10,9,26,'COMMENT','commented on your post',0,'2026-11-23 13:17:31'),(7,8,2,8,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-24 12:22:39'),(8,8,2,7,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-24 12:22:43'),(9,3,2,5,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-24 12:22:47'),(10,3,2,2,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-24 12:22:53'),(11,6,2,3,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-24 12:22:59'),(12,7,2,4,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-24 12:23:03'),(13,7,2,4,27,'COMMENT','commented on your post',0,'2026-11-24 12:23:46'),(14,2,9,16,28,'COMMENT','commented on your post',1,'2026-11-25 15:01:40'),(15,2,9,16,NULL,'HELPFUL','marked your post as helpful',1,'2026-11-25 15:01:59'),(16,9,2,16,29,'REPLY','replied to your comment',1,'2026-11-25 15:02:35'),(17,8,9,9,NULL,'HELPFUL','marked your post as helpful',0,'2026-11-25 15:11:27');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `idx_post_likes_post` (`post_id`),
  CONSTRAINT `fk_post_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_likes`
--

LOCK TABLES `post_likes` WRITE;
/*!40000 ALTER TABLE `post_likes` DISABLE KEYS */;
INSERT INTO `post_likes` VALUES (2,2,'2026-11-24 12:22:53'),(2,3,'2026-11-24 12:22:59'),(2,4,'2026-11-24 12:23:03'),(2,5,'2026-11-24 12:22:47'),(2,7,'2026-11-24 12:22:43'),(2,8,'2026-11-24 12:22:39'),(2,14,'2026-11-22 23:33:18'),(8,9,'2026-11-21 17:24:05'),(9,9,'2026-11-25 15:11:27'),(9,14,'2026-11-23 09:16:17'),(9,16,'2026-11-25 15:01:59'),(9,18,'2026-11-25 19:33:32'),(9,21,'2026-11-25 20:50:06'),(9,22,'2026-11-25 20:51:21'),(10,9,'2026-11-23 13:17:25'),(10,14,'2026-11-23 10:40:35');
/*!40000 ALTER TABLE `post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_id` int NOT NULL,
  `course_id` int DEFAULT NULL,
  `type` enum('Knowledge','Resource','Question','Project','Link','Media','Discussion') COLLATE utf8mb4_unicode_ci DEFAULT 'Knowledge',
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `helpful_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `status` enum('PUBLISHED','HIDDEN','REMOVED') COLLATE utf8mb4_unicode_ci DEFAULT 'PUBLISHED',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_posts_author` (`author_id`),
  KEY `idx_posts_course` (`course_id`),
  KEY `idx_posts_status_created` (`status`,`created_at`),
  CONSTRAINT `fk_posts_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_posts_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (2,3,1,'Knowledge','Understanding JWT Authentication','JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information between parties. Here is how signature verification prevents tampering...','[\"JWT\",\"Express\",\"Security\"]',25,8,'PUBLISHED','2026-10-29 12:51:33'),(3,6,1,'Resource','Building a CRUD App with React & Node.js','Full guide on building RESTful API endpoints, connecting MongoDB/MySQL, and wiring frontend states with React query.','[\"React\",\"Node.js\",\"MongoDB\"]',32,4,'PUBLISHED','2026-10-29 12:51:33'),(4,7,1,'Project','GitHub Repository - React CRUD','Open source boilerplate starter repository containing ready Express controllers and React component templates for SE-322 lab submissions.','[\"React\",\"Express\",\"GitHub\"]',20,3,'PUBLISHED','2026-10-29 12:51:33'),(5,3,NULL,'Knowledge','React CRUD with Express & MySQL','I am munna','[\"React\",\"Express\",\"MySQL\",\"CRUD\"]',1,4,'PUBLISHED','2026-11-21 00:09:46'),(6,8,NULL,'Knowledge','React CRUD with Express & MySQL','Hello from maruf','[\"React\",\"Express\",\"MySQL\",\"CRUD\"]',0,0,'PUBLISHED','2026-11-21 16:23:11'),(7,8,1,'Question','Who is munna bhai??','I understand that JWT has three parts (Header.Payload.Signature), but how does verify() ensure the token wasn\'t tampered with if anyone can decode base64? \n\nHere is my middleware snippet:\njwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... })','[\"JWT\",\"Express\",\"Node.js\"]',1,0,'PUBLISHED','2026-11-21 16:27:00'),(8,8,NULL,'Knowledge','MID TURM 5667','hello worldShare your knowledge, explanation, tutorial or idea...','[]',1,0,'PUBLISHED','2026-11-21 17:21:21'),(9,8,NULL,'Knowledge','MID TURM 4566','dsfsfsfds','[\"thel\",\"sdfh\",\"dsfdjh\"]',3,1,'PUBLISHED','2026-11-21 17:22:24'),(14,2,NULL,'Knowledge','Daffodil International University','I think it is very bad decidsion','[]',3,12,'PUBLISHED','2026-11-22 16:39:27'),(15,2,NULL,'Knowledge','How to quickly remove offset settings from Student Portal?','I understand that JWT has three parts (Header.Payload.Signature), but how does verify() ensure the token wasn\'t tampered with if anyone can decode base64? Here is my middleware snippet: jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... })','[]',0,0,'PUBLISHED','2026-11-24 11:57:05'),(16,2,NULL,'Knowledge','you knwo what','hello i am goint to give u links','[]',1,2,'PUBLISHED','2026-11-25 15:01:02'),(17,9,1,'Question','How does JWT authentication actually work in Express? hbhbb','I understand that JWT has three parts (Header.Payload.Signature), but how does verify() ensure the token wasn\'t tampered with if anyone can decode base64? \r\n\r\nHere is my middleware snippet:\r\njwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... })','[\"JWT\",\"Express\",\"Node.js\"]',0,0,'PUBLISHED','2026-11-25 15:07:34'),(18,9,2,'Resource','oop slide','good sld','[\"Assignments\"]',1,0,'PUBLISHED','2026-11-25 19:32:47'),(19,9,NULL,'Knowledge','sdf','df','[]',0,0,'PUBLISHED','2026-11-25 20:40:50'),(20,9,NULL,'Knowledge','dsf','dfsf','[]',0,0,'PUBLISHED','2026-11-25 20:46:28'),(21,9,NULL,'Knowledge','sdfaf','dgs','[]',1,2,'PUBLISHED','2026-11-25 20:50:00'),(22,9,NULL,'Knowledge','sdjfhbas','hello world','[]',1,0,'PUBLISHED','2026-11-25 20:50:58'),(23,9,NULL,'Knowledge','wwe','fasff','[]',0,0,'PUBLISHED','2026-11-25 21:07:54'),(24,9,1,'Resource','dammnnn','sdfaa','[]',0,0,'PUBLISHED','2026-11-25 21:08:19'),(25,9,NULL,'Resource','now it is done','fdsfaf','[]',0,0,'PUBLISHED','2026-11-25 21:22:01'),(26,9,1,'Resource','hello maruf','this is maruf','[\"Notes\"]',0,1,'PUBLISHED','2026-11-25 21:22:32');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','RESOLVED','DISMISSED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reports_post` (`post_id`),
  KEY `idx_reports_reporter` (`reporter_id`),
  KEY `idx_reports_status` (`status`),
  CONSTRAINT `fk_reports_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (2,2,5,'Spam post','RESOLVED','2026-10-29 12:51:33'),(4,2,4,'Harassment','PENDING','2026-10-29 12:51:33');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_posts`
--

DROP TABLE IF EXISTS `saved_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_posts` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `idx_saved_posts_post` (`post_id`),
  CONSTRAINT `fk_saved_posts_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_posts`
--

LOCK TABLES `saved_posts` WRITE;
/*!40000 ALTER TABLE `saved_posts` DISABLE KEYS */;
INSERT INTO `saved_posts` VALUES (2,14,'2026-11-22 23:39:45'),(3,5,'2026-11-21 00:10:59'),(9,14,'2026-11-23 09:16:52');
/*!40000 ALTER TABLE `saved_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('STUDENT','MODERATOR','ADMIN','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci DEFAULT 'STUDENT',
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Software Engineering',
  `batch` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '43',
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `knowledge_points` int DEFAULT '0',
  `status` enum('ACTIVE','SUSPENDED','BANNED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Administrator','superadmin@diu.edu.bd','ADMIN-001','$2a$10$w0FWxFMRPGV5wzI9J5u50uEl7rp6evbM0VRRm2a4nsPmIgEL0YF9u','SUPER_ADMIN','Software Engineering','01','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',5000,'ACTIVE','2026-10-29 12:51:33'),(2,'Dr. Sheikh Mohammad','admin@diu.edu.bd','FAC-SWE-01','$2a$10$wVesR2UL4SwS6Fz92ZAJu.Zwt7X770JYqUJPgKYHXM1OajEuMnQd6','ADMIN','Software Engineering','Faculty','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',3328,'ACTIVE','2026-10-29 12:51:33'),(3,'Nabiul Hasan Munna','student@diu.edu.bd','201-15-14231','$2a$10$vX5xxULcpaBINbjXKtxgmOdOjYTcKIr4au8gaWrfqmqWH/jaYlZhS','STUDENT','Software Engineering','43','https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',1283,'ACTIVE','2026-10-29 12:51:33'),(4,'Rafiul Islam','rafiul@diu.edu.bd','201-15-13982','$2a$10$vX5xxULcpaBINbjXKtxgmOdOjYTcKIr4au8gaWrfqmqWH/jaYlZhS','STUDENT','Software Engineering','43','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',900,'ACTIVE','2026-10-29 12:51:33'),(5,'Sara Tasnim','sara@diu.edu.bd','201-15-14550','$2a$10$vX5xxULcpaBINbjXKtxgmOdOjYTcKIr4au8gaWrfqmqWH/jaYlZhS','STUDENT','Software Engineering','43','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',740,'ACTIVE','2026-10-29 12:51:33'),(6,'Nayeen Ahmed','nayeen@diu.edu.bd','201-15-13110','$2a$10$vX5xxULcpaBINbjXKtxgmOdOjYTcKIr4au8gaWrfqmqWH/jaYlZhS','STUDENT','Software Engineering','42','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',435,'ACTIVE','2026-10-29 12:51:33'),(7,'Farah Tasnim','farah@diu.edu.bd','201-15-15102','$2a$10$vX5xxULcpaBINbjXKtxgmOdOjYTcKIr4au8gaWrfqmqWH/jaYlZhS','STUDENT','Software Engineering','44','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',215,'ACTIVE','2026-10-29 12:51:33'),(8,'Maruf','maruf@diu.edu.bd','241-35-513','$2a$10$il.nEHLXRKfBCCPNs02oPO0NktWcBlEli/QnJIFbdIj/k/fZPhLuC','STUDENT','Software Engineering','43','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',75,'ACTIVE','2026-11-21 16:07:15'),(9,'hasu','hasu@diu.edu.bd','104','$2a$10$FBW4J.s3IpGsNv5xZjNUXOQ1gfHGb.bvwy69w6ROCz88X/JM6w5CC','STUDENT','Software Engineering','43','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',135,'ACTIVE','2026-11-23 09:11:10'),(10,'munna','munna@diu.edu.bd','513','$2a$10$WuWwaVep3Sp0ZlzjRrp/O.Q/4ME132euTJTzc/HZqOgB17rR2ahWW','STUDENT','Software Engineering','43','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',12,'ACTIVE','2026-11-23 10:19:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'universediu'
--

--
-- Dumping routines for database 'universediu'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26  1:15:45
