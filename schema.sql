



-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'patients'
-- 
-- ---

DROP TABLE IF EXISTS `patients`;
    
CREATE TABLE `patients` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `patientId` INTEGER(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'encounters'
-- 
-- ---

DROP TABLE IF EXISTS `encounters`;
    
CREATE TABLE `encounters` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `id_patients` INTEGER NULL DEFAULT NULL,
  `encounter_date` DATETIME NULL DEFAULT NULL,
  `blood_pressure` VARCHAR(200) NULL DEFAULT NULL,
  `medications_prescribed` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE `encounters` ADD FOREIGN KEY (id_patients) REFERENCES `patients` (`id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `patients` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `encounters` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `patients` (`id`,`patientId`) VALUES
-- ('','');
-- INSERT INTO `encounters` (`id`,`id_patients`,`encounter_date`,`blood_pressure`,`medications_prescribed`) VALUES
-- ('','','','','');

