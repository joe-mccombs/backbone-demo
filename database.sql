CREATE DATABASE `backbone`;
USE `backbone`;


DROP TABLE IF EXISTS `customer`;
CREATE TABLE `customer` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `prefix` varchar(6) DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `fax` varchar(30) DEFAULT NULL,
  `title` varchar(20) DEFAULT NULL,
  `company` varchar(40) DEFAULT NULL,
  `company_url` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `customer` (`id`, `email`, `first_name`, `last_name`, `prefix`, `phone`, `fax`, `title`, `company`, `company_url`) VALUES
(1, 'jonas.sultani@hellyhansen.com', 'Jonas Sultani', '', 'Mr', '+49 6245 99334', '+49 6245 99335', 'Consultant', 'Helly Hansen', 'www.hellyhansen.com'),
(2, 'james.simmons@boeing.com', 'James H', 'Simmons', 'Mr', '+1 112-445-6684', '', 'AP Lead', 'Boeing', 'www.boeing.com'),
(3, 'steve-marino@boehringer-ingelheim.com', 'Steve', 'Marino', 'Mrs', '+1 650-774-5124', '', 'Project Manager', 'Boeing', 'www.boeing.com'),
(4, 'shrelph@apple.com', 'Sherley', 'Relph', '', '650 223 9824', '', '', 'Apple Inc', 'apple.com'),
(5, 'blaine.evans@readsoft.com', 'Blaine', 'Evans', '', '678-833-1201', '', 'SAP Specialist', 'ReadSoft Inc', 'www.readsoft.com'),
(6, 'hermann.geiger@pfizer.com', 'Hermann', 'Geiger ', 'Dr', '484.337-3912', '', 'ERP SAP FI Solutions', 'Pfizer', 'www.pfizer.com'),
(7, 'edward.higgins@pfizer.com', 'Edward', 'Higgins', '', '484.337-3994', '', 'SAP Basis Team', 'Pfizer', 'www.pfizer.com'),
(8, 'danielle@jobscore.com', 'Danielle', 'Arkind', '', '415-320-6230', '', 'CEO', 'JobScore', 'http://www.jobscore.com');
