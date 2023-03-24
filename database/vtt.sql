
-- Role list values for the role_list table. Applicable for showing the different options while user is trying to sign-up at VTT
insert into role_list VALUES  (1, "INDIVIDUAL/TRAINING_PROVIDER", "Individual Trainer/ Training Service Provider", 1);
insert into role_list VALUES  (2, "ENTERPRISE", "Enterprise", 1);
insert into role_list VALUES  (3, "PARTICIPANT", "Participant/Learner", 1);

--ROLE TABLE CONTENT
INSERT INTO role VALUES ('1', 'Subscriber', 'SUBSCRIBER', '1');
INSERT INTO role VALUES ('2', 'Super-Admin', 'SUPER_ADMIN', '1');
INSERT INTO role VALUES ('3', 'Admin', 'ADMIN', '1');
INSERT INTO role VALUES ('4', 'Trainer', 'TRAINER', '1');
INSERT INTO role VALUES ('5', 'Coordinator', 'COORDINATOR', '1');
INSERT INTO role VALUES ('6', 'Trainee', 'TRAINEE', '1');
INSERT INTO role VALUES ('7', 'Anonymous', 'ANONYMOUS', '1');




DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `price` varchar(255) DEFAULT NULL,
  `plan_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `start_date` varchar(255) DEFAULT NULL,
  `end_date` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT '2022-10-19 18:24:00',
  `updatedAt` datetime NOT NULL DEFAULT '2022-10-19 18:24:00',
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  `currencyType` enum('INR','USD') NOT NULL DEFAULT 'INR',
  `renewal_frequency` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'0','Basic','Our basic plan is designed to keep your trainings effective, easy and secure.',30,'10-10-2022','10-11-2022','2022-10-14 13:14:00','2022-10-14 13:14:00',0,'INR',''),(2,'1500','Professional','Unlock powerfull time-saving tools for your training sessions and collect analytical data.',30,'10-10-2022','10-11-2022','2022-10-14 13:14:00','2022-10-14 13:14:00',0,'INR',''),(3,'2500','Advanced','Access unparalleled support and unlimited cloud storage with the advanced plan.',30,'10-10-2022','10-11-2022','2022-10-14 13:14:00','2022-10-14 13:14:00',0,'INR',''),(4,'0','Basic','Our basic plan is designed to keep your trainings effective, easy and secure.',30,'10-10-2022','10-11-2022','2022-10-14 13:14:00','2022-10-14 13:14:00',0,'INR',''),(5,'1600','Professional','Unlock powerfull time-saving tools for your training sessions and collect analytical data.',30,'10-10-2022','10-11-2022','2022-10-16 14:46:00','2022-10-16 14:46:00',0,'INR',''),(20,'2600','Advanced','Access unparalleled support and unlimited cloud storage with the advanced plan.',30,'10-10-2022','10-11-2022','2022-10-17 13:02:00','2022-10-17 13:02:00',0,'INR','');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;




DROP TABLE IF EXISTS `subscription_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `feature_name` varchar(255) NOT NULL,
  `feature_code` enum('Host up to 100 participants','View basic analytics','500 MB cloud storage','24/7 customer care','Host up to 500 participants','Get detailed insights and analytics','10 GB cloud storage','Priority support','Host up to 1000 participants','Unlimited cloud support','Designated support team') NOT NULL DEFAULT 'Host up to 100 participants',
  `description` varchar(255) DEFAULT NULL,
  `subscriptionId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT '2022-10-19 18:24:00',
  `updatedAt` datetime NOT NULL DEFAULT '2022-10-19 18:24:00',
  `is_active` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_b56a0bc04ebfda94a2620496fa0` (`subscriptionId`),
  CONSTRAINT `FK_b56a0bc04ebfda94a2620496fa0` FOREIGN KEY (`subscriptionId`) REFERENCES `subscription_plans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_features`
--

LOCK TABLES `subscription_features` WRITE;
/*!40000 ALTER TABLE `subscription_features` DISABLE KEYS */;
INSERT INTO `subscription_features` VALUES (1,'Host up to 100 participants','Host up to 100 participants',NULL,1,'2022-10-20 00:21:58','2022-10-20 00:21:58',0),(2,'View basic analytics','View basic analytics',NULL,1,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(3,'500 MB cloud storage','500 MB cloud storage',NULL,1,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(4,'24/7 customer care','24/7 customer care',NULL,1,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(5,'Host up to 500 participants','Host up to 500 participants',NULL,2,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(6,'Get detailed insights and analytics','Get detailed insights and analytics',NULL,2,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(7,'10 GB cloud storage','10 GB cloud storage',NULL,2,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(8,'Priority support','Priority support',NULL,2,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(9,'Host up to 1000 participants','Host up to 1000 participants',NULL,3,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(10,'Get detailed insights and analytics','Get detailed insights and analytics',NULL,3,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(11,'Unlimited cloud support','Unlimited cloud support',NULL,3,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(12,'Designated support team','Designated support team',NULL,3,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(13,'Host up to 100 participants','Host up to 100 participants',NULL,4,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(14,'View basic analytics','View basic analytics',NULL,4,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(15,'500 MB cloud storage','500 MB cloud storage',NULL,4,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(16,'24/7 customer care','24/7 customer care',NULL,4,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(17,'Host up to 500 participants','Host up to 500 participants',NULL,5,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(18,'Get detailed insights and analytics','Get detailed insights and analytics',NULL,5,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(19,'10 GB cloud storage','10 GB cloud storage',NULL,5,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(20,'Priority support','Priority support',NULL,5,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(21,'Host up to 1000 participants','Host up to 1000 participants',NULL,20,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(22,'Get detailed insights and analytics','Get detailed insights and analytics',NULL,20,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(23,'Unlimited cloud support','Unlimited cloud support',NULL,20,'2022-10-14 13:14:00','2022-10-14 13:14:00',0),(24,'Designated support team','Designated support team',NULL,20,'2022-10-14 13:14:00','2022-10-14 13:14:00',0);
/*!40000 ALTER TABLE `subscription_features` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;



DROP TABLE IF EXISTS `currency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `currency` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currency`
--

LOCK TABLES `currency` WRITE;
/*!40000 ALTER TABLE `currency` DISABLE KEYS */;
INSERT INTO `currency` VALUES (1,'INR'),(2,'USD');
/*!40000 ALTER TABLE `currency` ENABLE KEYS */;
UNLOCK TABLES;
