-- Migration: 0011_remove_phi_fields
-- Date: 2026-01-22
-- Priority: P0 CRITICAL - HIPAA Compliance
--
-- Description:
-- Removes potential PHI fields from integration_logs table.
-- userAge and impression fields constitute Protected Health Information (PHI)
-- when combined with timestamps, violating HIPAA requirements.
--
-- Fields Removed:
--   - userAge (int): Patient age
--   - impression (varchar): Clinical impression/diagnosis
--
-- IMPORTANT: This migration is DESTRUCTIVE. Any existing data in these
-- columns will be permanently deleted. This is intentional for compliance.

-- First, clear any existing PHI data (belt and suspenders approach)
UPDATE integration_logs SET userAge = NULL, impression = NULL WHERE userAge IS NOT NULL OR impression IS NOT NULL;

-- Drop the PHI columns
ALTER TABLE integration_logs DROP COLUMN IF EXISTS userAge;
ALTER TABLE integration_logs DROP COLUMN IF EXISTS impression;

-- Add audit comment to table
ALTER TABLE integration_logs COMMENT = 'Integration access logs. PHI fields (userAge, impression) removed 2026-01-22 for HIPAA compliance.';
