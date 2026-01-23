-- Migration: Create integration_logs table
-- Description: Track integration partner access for analytics and partnership reporting
-- Date: 2026-01-23

-- Create integration partner enum
-- Note: MySQL doesn't support CREATE TYPE, using ENUM in column definition

-- Create the integration_logs table
CREATE TABLE IF NOT EXISTS `integration_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `partner` ENUM('imagetrend', 'esos', 'zoll', 'emscloud', 'none') NOT NULL,
    `agencyId` VARCHAR(100),
    `agencyName` VARCHAR(255),
    `searchTerm` VARCHAR(500),
    `userAge` INT,
    `impression` VARCHAR(255),
    `responseTimeMs` INT,
    `resultCount` INT,
    `ipAddress` VARCHAR(45),
    `userAgent` VARCHAR(500),
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for query optimization
CREATE INDEX `idx_integration_logs_partner` ON `integration_logs`(`partner`);
CREATE INDEX `idx_integration_logs_created_at` ON `integration_logs`(`createdAt`);
CREATE INDEX `idx_integration_logs_agency_id` ON `integration_logs`(`agencyId`);

-- Add comments
-- Note: MySQL 8.0+ supports COMMENT syntax
ALTER TABLE `integration_logs` COMMENT = 'Tracks integration partner access for analytics and partnership reporting';
