CREATE DATABASE IF NOT EXISTS `greenwatch`;
USE `greenwatch`;

CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `citizenId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `desc` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `lat` float NOT NULL,
  `lng` float NOT NULL,
  `status` enum('pending','in-progress','resolved') DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `image` longtext,
  `assignedTo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenId` (`citizenId`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`citizenId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`citizenId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_3` FOREIGN KEY (`citizenId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_4` FOREIGN KEY (`citizenId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `complaints` VALUES 
(1, 1, 'Blocked manholes', 'water', 'blockage of water in nearby area causing water logging and drainage issues ', 'Dombivali ', 51.5054, -0.0877876, 'resolved', '2026-04-26 07:11:39', '2026-04-26 07:26:38', NULL, NULL),
(2, 1, 'garbage dump', 'garbage', 'garbage dump in my area', 'vashi', 51.5088, -0.0985898, 'resolved', '2026-04-26 07:26:19', '2026-04-26 07:26:40', NULL, NULL),
(3, 1, 'industrial waste disposal ', 'water', 'industries deposit their wastes in the river nearby my area', 'vashi ', 51.5169, -0.0951274, 'in-progress', '2026-04-26 07:38:00', '2026-04-26 07:47:10', NULL, 'Green Squad C');

CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `message` varchar(255) NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notifications` VALUES 
(1, 1, 'Your complaint "industrial waste disposal " has been assigned to team: Green Squad C.', 0, '2026-04-26 07:47:10', '2026-04-26 07:47:10');

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('citizen','admin') DEFAULT 'citizen',
  `points` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` VALUES 
(1, 'Atharva More', 'athumore11@gmail.com', 'Atharva@1339', 'citizen', 20, '2026-04-26 07:10:37', '2026-04-26 07:26:40'),
(2, 'Admin', 'admin@greenwatch.com', 'password123', 'admin', 0, '2026-04-26 07:12:14', '2026-04-26 07:12:14');

