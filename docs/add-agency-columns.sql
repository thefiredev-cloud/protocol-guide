-- Migration: Add Agency Metadata Columns to manus_protocol_chunks
-- Created: 2026-01-20
-- Description: Adds agency_name, state_code, and state_name columns with indexes
--              to support state-specific protocol filtering and agency attribution

-- ============================================================================
-- FORWARD MIGRATION
-- ============================================================================

-- Add agency metadata columns
ALTER TABLE manus_protocol_chunks
  ADD COLUMN IF NOT EXISTS agency_name TEXT,
  ADD COLUMN IF NOT EXISTS state_code CHAR(2),
  ADD COLUMN IF NOT EXISTS state_name TEXT;

-- Add column comments for documentation
COMMENT ON COLUMN manus_protocol_chunks.agency_name IS 'Name of the agency that published the protocol (e.g., "California Department of Health")';
COMMENT ON COLUMN manus_protocol_chunks.state_code IS 'Two-letter state code (e.g., "CA", "TX", "NY")';
COMMENT ON COLUMN manus_protocol_chunks.state_name IS 'Full state name (e.g., "California", "Texas", "New York")';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chunks_state_code
  ON manus_protocol_chunks(state_code)
  WHERE state_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chunks_agency_name
  ON manus_protocol_chunks(agency_name)
  WHERE agency_name IS NOT NULL;

-- Optional: Create composite index for combined state + agency queries
CREATE INDEX IF NOT EXISTS idx_chunks_state_agency
  ON manus_protocol_chunks(state_code, agency_name)
  WHERE state_code IS NOT NULL AND agency_name IS NOT NULL;

-- Optional: Add check constraint to ensure state_code is uppercase and 2 chars
ALTER TABLE manus_protocol_chunks
  ADD CONSTRAINT chk_state_code_format
  CHECK (state_code IS NULL OR (state_code = UPPER(state_code) AND LENGTH(state_code) = 2));

-- ============================================================================
-- ROLLBACK MIGRATION (for reference)
-- ============================================================================

-- To rollback this migration, run the following:
/*
DROP INDEX IF EXISTS idx_chunks_state_agency;
DROP INDEX IF EXISTS idx_chunks_agency_name;
DROP INDEX IF EXISTS idx_chunks_state_code;

ALTER TABLE manus_protocol_chunks
  DROP CONSTRAINT IF EXISTS chk_state_code_format;

ALTER TABLE manus_protocol_chunks
  DROP COLUMN IF EXISTS state_name,
  DROP COLUMN IF EXISTS state_code,
  DROP COLUMN IF EXISTS agency_name;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify columns were added
/*
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'manus_protocol_chunks'
  AND column_name IN ('agency_name', 'state_code', 'state_name')
ORDER BY ordinal_position;

-- Verify indexes were created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'manus_protocol_chunks'
  AND indexname LIKE 'idx_chunks_%'
ORDER BY indexname;

-- Check table structure
\d manus_protocol_chunks
*/
