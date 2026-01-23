-- Migration: Remove PHI columns from integration_logs table
-- Description: HIPAA Compliance - Remove patient age and clinical impression fields
-- Date: 2026-01-23
--
-- HIPAA COMPLIANCE REQUIREMENT:
-- The userAge and impression columns constitute Protected Health Information (PHI)
-- when combined with timestamps and agency identifiers. Under HIPAA regulations,
-- this data should not be stored in analytics/logging tables.
--
-- These fields were originally added for potential analytics but create
-- compliance risk. This migration removes them permanently.
--
-- IMPORTANT: This migration is DESTRUCTIVE and cannot be rolled back.
-- Any existing PHI data in these columns will be permanently deleted.

-- Step 1: Drop the PHI columns from integration_logs table
-- userAge: Patient age - PHI when combined with timestamp/agency
-- impression: Clinical impression code - PHI (medical condition information)
ALTER TABLE `integration_logs`
  DROP COLUMN IF EXISTS `userAge`,
  DROP COLUMN IF EXISTS `impression`;

-- Step 2: Add a comment documenting the HIPAA compliance change
-- Note: MySQL 8.0+ supports ALTER TABLE ... COMMENT syntax
ALTER TABLE `integration_logs`
  COMMENT = 'Integration partner access logs. HIPAA compliant - no PHI stored. userAge and impression columns removed 2026-01-23.';

-- Verification query (run manually to confirm):
-- DESCRIBE `integration_logs`;
-- Expected columns: id, partner, agencyId, agencyName, searchTerm, responseTimeMs, resultCount, ipAddress, userAgent, createdAt
