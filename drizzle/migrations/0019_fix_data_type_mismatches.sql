-- Migration: Fix data type mismatches
-- This migration fixes type inconsistencies that prevent foreign key creation
-- Generated: 2026-01-23

-- =============================================================================
-- FIX: integrationLogs.agencyId type mismatch
-- =============================================================================
-- Problem: integrationLogs.agencyId is varchar(100) but agencies.id is int
-- Cause: External partner systems may send non-numeric agency IDs
-- Solution: Add separate column for internal agency reference

-- Step 1: Add new column for internal agency reference
ALTER TABLE `integration_logs`
ADD COLUMN `internalAgencyId` int DEFAULT NULL AFTER `agencyId`;

-- Step 2: Populate internalAgencyId for matching agencies (by name)
-- This attempts to match external agency names to internal agency records
UPDATE `integration_logs` il
INNER JOIN `agencies` a ON il.agencyName = a.name
SET il.internalAgencyId = a.id
WHERE il.agencyId IS NOT NULL;

-- Step 3: Add comment for documentation
ALTER TABLE `integration_logs`
MODIFY COLUMN `agencyId` varchar(100) COMMENT 'External agency ID from partner system',
MODIFY COLUMN `internalAgencyId` int COMMENT 'Internal agency reference for FK relationship';

-- Step 4: Add index for new column
CREATE INDEX `idx_integration_logs_internal_agency` ON `integration_logs` (`internalAgencyId`);

-- =============================================================================
-- NOTES
-- =============================================================================
-- The agencyId column remains varchar to store external partner agency IDs
-- The new internalAgencyId column will be used for foreign key relationship
-- This preserves partner data while enabling referential integrity
-- =============================================================================
