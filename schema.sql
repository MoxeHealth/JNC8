



-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'encounters'
-- 
-- ---

DROP TABLE IF EXISTS `encounters`;
    
CREATE TABLE `encounters` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `patient_id` VARCHAR(200) NULL DEFAULT NULL,
  `org_id` VARCHAR(200) NULL DEFAULT NULL,
  `encounter_date` DATETIME NULL DEFAULT NULL,
  `blood_pressure` VARCHAR(200) NULL DEFAULT NULL,
  `medications_prescribed` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Foreign Keys 
-- ---


-- ---
-- Table Properties
-- ---

-- ALTER TABLE `encounters` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `encounters` (`id`,`patient_id`, `org_id,` `encounter_date`,`blood_pressure`,`medications_prescribed`) VALUES
-- ('','','','','');

