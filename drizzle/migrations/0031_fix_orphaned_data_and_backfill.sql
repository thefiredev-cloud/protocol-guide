-- ============================================================================
-- Migration 0031: Fix Orphaned Data and Backfill Missing Embeddings
-- ============================================================================
-- Database: Supabase (PostgreSQL)
--
-- This migration:
-- 1. Identifies and handles orphaned protocol chunks (no agency_id)
-- 2. Identifies chunks missing embeddings
-- 3. Creates monitoring functions for data quality
-- ============================================================================

-- ============================================================================
-- 1. ANALYZE ORPHANED DATA
-- ============================================================================

-- Create a view to monitor data quality
CREATE OR REPLACE VIEW data_quality_metrics AS
SELECT
    -- Total counts
    (SELECT COUNT(*) FROM manus_protocol_chunks) AS total_chunks,
    (SELECT COUNT(*) FROM manus_agencies) AS total_agencies,
    
    -- Orphaned data
    (SELECT COUNT(*) FROM manus_protocol_chunks WHERE agency_id IS NULL) AS chunks_without_agency,
    (SELECT COUNT(*) FROM manus_protocol_chunks WHERE state_code IS NULL) AS chunks_without_state,
    
    -- Missing embeddings
    (SELECT COUNT(*) FROM manus_protocol_chunks WHERE embedding IS NULL) AS chunks_without_embedding,
    
    -- Full-text search readiness
    (SELECT COUNT(*) FROM manus_protocol_chunks WHERE search_vector IS NULL) AS chunks_without_search_vector,
    
    -- Data freshness
    (SELECT COUNT(*) FROM manus_protocol_chunks 
     WHERE last_verified_at < NOW() - INTERVAL '90 days' OR last_verified_at IS NULL) AS stale_chunks,
    
    -- Timestamp
    NOW() AS checked_at;

COMMENT ON VIEW data_quality_metrics IS 'Dashboard view for monitoring protocol data quality';

-- ============================================================================
-- 2. IDENTIFY ORPHANED CHUNKS BY STATE
-- ============================================================================

-- Orphaned chunks often belong to state-level protocols that should be assigned
-- to a state agency. Create a function to help with this.

CREATE OR REPLACE FUNCTION get_orphaned_chunks_by_state()
RETURNS TABLE (
    state_code TEXT,
    chunk_count BIGINT,
    sample_titles TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.state_code,
        COUNT(*) AS chunk_count,
        STRING_AGG(DISTINCT c.protocol_title, ', ' ORDER BY c.protocol_title) 
            FILTER (WHERE c.protocol_title IS NOT NULL) AS sample_titles
    FROM manus_protocol_chunks c
    WHERE c.agency_id IS NULL
    GROUP BY c.state_code
    ORDER BY chunk_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_orphaned_chunks_by_state IS 'Lists orphaned chunks grouped by state for remediation';

-- ============================================================================
-- 3. CREATE DEFAULT AGENCY ASSIGNMENT FUNCTION
-- ============================================================================

-- For chunks without agency_id, assign them to a state-level "default" agency
-- This preserves the data while making it searchable by state

CREATE OR REPLACE FUNCTION assign_orphaned_chunks_to_state_agency()
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER := 0;
    state_rec RECORD;
    state_agency_id INTEGER;
BEGIN
    -- For each state with orphaned chunks
    FOR state_rec IN 
        SELECT DISTINCT state_code 
        FROM manus_protocol_chunks 
        WHERE agency_id IS NULL AND state_code IS NOT NULL
    LOOP
        -- Find or create a state-level agency
        SELECT id INTO state_agency_id
        FROM manus_agencies
        WHERE state_code = state_rec.state_code
          AND agency_type = 'state_office'
        LIMIT 1;
        
        -- If no state agency exists, find any agency in that state
        IF state_agency_id IS NULL THEN
            SELECT id INTO state_agency_id
            FROM manus_agencies
            WHERE state_code = state_rec.state_code
            ORDER BY protocol_count DESC NULLS LAST
            LIMIT 1;
        END IF;
        
        -- If we found an agency, assign orphaned chunks to it
        IF state_agency_id IS NOT NULL THEN
            UPDATE manus_protocol_chunks
            SET agency_id = state_agency_id
            WHERE state_code = state_rec.state_code
              AND agency_id IS NULL;
            
            GET DIAGNOSTICS rows_updated = rows_updated + ROW_COUNT;
            
            RAISE NOTICE 'Assigned % chunks to agency % for state %', 
                ROW_COUNT, state_agency_id, state_rec.state_code;
        ELSE
            RAISE WARNING 'No agency found for state %', state_rec.state_code;
        END IF;
    END LOOP;
    
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_orphaned_chunks_to_state_agency IS 'Assigns orphaned chunks to appropriate state-level agencies';

-- ============================================================================
-- 4. IDENTIFY CHUNKS MISSING EMBEDDINGS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_chunks_missing_embeddings()
RETURNS TABLE (
    id INTEGER,
    agency_id INTEGER,
    protocol_number TEXT,
    protocol_title TEXT,
    content_length INTEGER,
    state_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.agency_id,
        c.protocol_number,
        c.protocol_title,
        LENGTH(c.content) AS content_length,
        c.state_code
    FROM manus_protocol_chunks c
    WHERE c.embedding IS NULL
    ORDER BY c.agency_id, c.protocol_number;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_chunks_missing_embeddings IS 'Lists chunks that need embedding generation';

-- ============================================================================
-- 5. CREATE DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Add NOT NULL constraint to agency_id after cleaning orphaned data
-- This prevents future orphaned chunks
-- NOTE: Only run after assign_orphaned_chunks_to_state_agency()

-- CREATE OR REPLACE FUNCTION ensure_agency_id_not_null()
-- RETURNS VOID AS $$
-- BEGIN
--     -- Check if there are still orphaned chunks
--     IF EXISTS (SELECT 1 FROM manus_protocol_chunks WHERE agency_id IS NULL) THEN
--         RAISE EXCEPTION 'Cannot add NOT NULL constraint: % orphaned chunks remain',
--             (SELECT COUNT(*) FROM manus_protocol_chunks WHERE agency_id IS NULL);
--     END IF;
--     
--     -- Add NOT NULL constraint
--     ALTER TABLE manus_protocol_chunks 
--     ALTER COLUMN agency_id SET NOT NULL;
--     
--     RAISE NOTICE 'Added NOT NULL constraint to agency_id';
-- END;
-- $$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. ADD FOREIGN KEY CONSTRAINT (optional)
-- ============================================================================

-- Create FK from chunks to agencies
-- This ensures referential integrity

-- Check if constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_manus_chunks_agency'
        AND table_name = 'manus_protocol_chunks'
    ) THEN
        -- Only add if all agency_ids exist in manus_agencies
        IF NOT EXISTS (
            SELECT 1 FROM manus_protocol_chunks c
            WHERE c.agency_id IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM manus_agencies a WHERE a.id = c.agency_id)
        ) THEN
            ALTER TABLE manus_protocol_chunks
            ADD CONSTRAINT fk_manus_chunks_agency
            FOREIGN KEY (agency_id) REFERENCES manus_agencies(id)
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Added foreign key constraint fk_manus_chunks_agency';
        ELSE
            RAISE WARNING 'Cannot add FK: Some chunks reference non-existent agencies';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 7. CREATE INDEXES ON MANUS_AGENCIES
-- ============================================================================

-- State code index for state filtering
CREATE INDEX IF NOT EXISTS idx_manus_agencies_state_code 
ON manus_agencies(state_code);

COMMENT ON INDEX idx_manus_agencies_state_code IS 'Index for state-filtered agency lookups';

-- Agency type index for type filtering
CREATE INDEX IF NOT EXISTS idx_manus_agencies_type 
ON manus_agencies(agency_type);

COMMENT ON INDEX idx_manus_agencies_type IS 'Index for agency type filtering';

-- Name search index (for autocomplete)
CREATE INDEX IF NOT EXISTS idx_manus_agencies_name_lower 
ON manus_agencies(lower(name) text_pattern_ops);

COMMENT ON INDEX idx_manus_agencies_name_lower IS 'Index for case-insensitive agency name searches';

-- Parent agency index (for inheritance)
CREATE INDEX IF NOT EXISTS idx_manus_agencies_parent 
ON manus_agencies(parent_protocol_source_id);

COMMENT ON INDEX idx_manus_agencies_parent IS 'Index for protocol inheritance hierarchy';

-- Composite: state + type (for state agency lookups)
CREATE INDEX IF NOT EXISTS idx_manus_agencies_state_type 
ON manus_agencies(state_code, agency_type);

COMMENT ON INDEX idx_manus_agencies_state_type IS 'Composite index for state + type filtered searches';

-- Active agencies index
CREATE INDEX IF NOT EXISTS idx_manus_agencies_active 
ON manus_agencies(id) 
WHERE is_active = true;

COMMENT ON INDEX idx_manus_agencies_active IS 'Partial index for active agencies only';

-- ============================================================================
-- 8. VERIFICATION
-- ============================================================================

-- Run this to check data quality after migration:
-- SELECT * FROM data_quality_metrics;

-- Run this to see orphaned chunks by state:
-- SELECT * FROM get_orphaned_chunks_by_state();

-- Run this to assign orphaned chunks (manual step):
-- SELECT assign_orphaned_chunks_to_state_agency();

-- ============================================================================
-- ROLLBACK
-- ============================================================================
/*
DROP VIEW IF EXISTS data_quality_metrics;
DROP FUNCTION IF EXISTS get_orphaned_chunks_by_state();
DROP FUNCTION IF EXISTS assign_orphaned_chunks_to_state_agency();
DROP FUNCTION IF EXISTS get_chunks_missing_embeddings();
DROP FUNCTION IF EXISTS ensure_agency_id_not_null();

ALTER TABLE manus_protocol_chunks DROP CONSTRAINT IF EXISTS fk_manus_chunks_agency;

DROP INDEX IF EXISTS idx_manus_agencies_state_code;
DROP INDEX IF EXISTS idx_manus_agencies_type;
DROP INDEX IF EXISTS idx_manus_agencies_name_lower;
DROP INDEX IF EXISTS idx_manus_agencies_parent;
DROP INDEX IF EXISTS idx_manus_agencies_state_type;
DROP INDEX IF EXISTS idx_manus_agencies_active;
*/
