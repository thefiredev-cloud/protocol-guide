-- ============================================================================
-- Protocol Guide: EMS Agency Database Migration
-- Scale from 2,713 to 23,272 agencies with protocol inheritance hierarchy
-- ============================================================================
-- Run this in Supabase SQL Editor
-- Estimated execution time: < 5 minutes
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE ENUM TYPES
-- ============================================================================

-- Agency type classification based on NASEMSO categories
DO $$ BEGIN
    CREATE TYPE agency_type_enum AS ENUM (
        '911_transport',      -- Primary 911 response with transport capability
        '911_non_transport',  -- First response without transport (fire depts)
        'air_medical',        -- Helicopter/fixed-wing transport
        'dispatch',           -- Dispatch centers / PSAPs
        'specialty',          -- Critical care, neonatal, etc.
        'regional_council',   -- Regional EMS councils / RETACs
        'state_office',       -- State EMS offices
        'hospital_based',     -- Hospital-operated EMS
        'tribal',             -- Tribal nation EMS
        'unknown'             -- Unclassified agencies
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Call volume tier for 80/20 prioritization
DO $$ BEGIN
    CREATE TYPE call_volume_tier_enum AS ENUM (
        'high',     -- Top 20% by call volume (80% of calls)
        'mid',      -- Middle 30%
        'low',      -- Bottom 50%
        'unknown'   -- No data available
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Integration partner enum for partnerships (ImageTrend, eSolutions)
DO $$ BEGIN
    CREATE TYPE integration_partner_enum AS ENUM (
        'imagetrend',
        'esos',
        'zoll',
        'emscloud',
        'none'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: ADD NEW COLUMNS TO manus_agencies
-- ============================================================================

-- Agency classification
ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS agency_type agency_type_enum DEFAULT 'unknown';

-- Protocol inheritance: State -> Region -> Agency hierarchy
-- Self-referencing FK for parent protocol source
ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS parent_protocol_source_id INTEGER;

-- Call volume tier for prioritization
ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS call_volume_tier call_volume_tier_enum DEFAULT 'unknown';

-- State-specific license/certification ID
ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);

-- Data quality tracking
ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Integration partner fields (for ImageTrend demo)
ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS integration_partner integration_partner_enum DEFAULT 'none';

ALTER TABLE manus_agencies
ADD COLUMN IF NOT EXISTS integration_id TEXT;

-- ============================================================================
-- STEP 3: ADD SELF-REFERENCING FOREIGN KEY
-- ============================================================================

-- Use DEFERRABLE constraint to allow batch inserts with circular references
DO $$ BEGIN
    ALTER TABLE manus_agencies
    ADD CONSTRAINT fk_parent_protocol_source
    FOREIGN KEY (parent_protocol_source_id)
    REFERENCES manus_agencies(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 4: CREATE INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================

-- Index on agency_type for filtering
CREATE INDEX IF NOT EXISTS idx_agencies_agency_type
ON manus_agencies(agency_type);

-- Index on call_volume_tier for prioritization queries
CREATE INDEX IF NOT EXISTS idx_agencies_call_volume_tier
ON manus_agencies(call_volume_tier);

-- Index on parent_protocol_source for inheritance lookups
CREATE INDEX IF NOT EXISTS idx_agencies_parent_protocol_source
ON manus_agencies(parent_protocol_source_id);

-- Composite index for common query pattern: state + type + volume
CREATE INDEX IF NOT EXISTS idx_agencies_state_type_volume
ON manus_agencies(state_code, agency_type, call_volume_tier);

-- Index for integration partner filtering (ImageTrend demo)
CREATE INDEX IF NOT EXISTS idx_agencies_integration_partner
ON manus_agencies(integration_partner);

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_agencies_is_verified
ON manus_agencies(is_verified);

-- ============================================================================
-- STEP 5: CREATE PROTOCOL INHERITANCE FUNCTION
-- ============================================================================

-- Returns the full inheritance chain for an agency
-- Example: Agency -> Regional Council -> State Office
CREATE OR REPLACE FUNCTION get_protocol_inheritance_chain(agency_id_param INTEGER)
RETURNS TABLE (
    level INTEGER,
    id INTEGER,
    name TEXT,
    agency_type agency_type_enum,
    state_code CHAR(2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE inheritance_chain AS (
        -- Base case: the agency itself
        SELECT
            1 AS level,
            a.id,
            a.name,
            a.agency_type,
            a.state_code,
            a.parent_protocol_source_id
        FROM manus_agencies a
        WHERE a.id = agency_id_param

        UNION ALL

        -- Recursive case: walk up the parent chain
        SELECT
            ic.level + 1,
            a.id,
            a.name,
            a.agency_type,
            a.state_code,
            a.parent_protocol_source_id
        FROM manus_agencies a
        INNER JOIN inheritance_chain ic ON a.id = ic.parent_protocol_source_id
        WHERE ic.level < 5  -- Prevent infinite loops, max 5 levels
    )
    SELECT
        ic.level,
        ic.id,
        ic.name,
        ic.agency_type,
        ic.state_code
    FROM inheritance_chain ic
    ORDER BY ic.level;
END;
$$;

-- ============================================================================
-- STEP 6: CREATE SEARCH FUNCTION WITH INHERITANCE SUPPORT
-- ============================================================================

-- Enhanced search that includes inherited protocols
CREATE OR REPLACE FUNCTION get_protocols_with_inheritance(
    agency_id_param INTEGER,
    query_embedding VECTOR(1536),
    match_count INTEGER DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    id INTEGER,
    agency_id INTEGER,
    protocol_number TEXT,
    protocol_title TEXT,
    section TEXT,
    content TEXT,
    image_urls TEXT[],
    similarity FLOAT,
    source_level TEXT,  -- 'agency', 'regional', 'state'
    source_agency_name TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    chain_ids INTEGER[];
BEGIN
    -- Get all agency IDs in the inheritance chain
    SELECT ARRAY_AGG(c.id ORDER BY c.level)
    INTO chain_ids
    FROM get_protocol_inheritance_chain(agency_id_param) c;

    -- Search across all agencies in the chain
    RETURN QUERY
    SELECT
        pc.id,
        pc.agency_id,
        pc.protocol_number,
        pc.protocol_title,
        pc.section,
        pc.content,
        pc.image_urls,
        (1 - (pc.embedding <=> query_embedding))::FLOAT AS similarity,
        CASE
            WHEN pc.agency_id = agency_id_param THEN 'agency'
            WHEN a.agency_type = 'regional_council' THEN 'regional'
            WHEN a.agency_type = 'state_office' THEN 'state'
            ELSE 'inherited'
        END AS source_level,
        a.name AS source_agency_name
    FROM manus_protocol_chunks pc
    INNER JOIN manus_agencies a ON pc.agency_id = a.id
    WHERE pc.agency_id = ANY(chain_ids)
      AND (1 - (pc.embedding <=> query_embedding)) > match_threshold
    ORDER BY
        -- Prioritize agency's own protocols, then by similarity
        CASE WHEN pc.agency_id = agency_id_param THEN 0 ELSE 1 END,
        (1 - (pc.embedding <=> query_embedding)) DESC
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- STEP 7: ADD TRIGGER FOR DENORMALIZED DATA SYNC
-- ============================================================================

-- Sync agency changes to protocol_chunks (denormalized fields)
CREATE OR REPLACE FUNCTION sync_agency_to_chunks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update denormalized fields in protocol_chunks when agency changes
    IF OLD.name IS DISTINCT FROM NEW.name
       OR OLD.state_code IS DISTINCT FROM NEW.state_code
       OR OLD.state IS DISTINCT FROM NEW.state THEN

        UPDATE manus_protocol_chunks
        SET
            agency_name = NEW.name,
            state_code = NEW.state_code,
            state_name = NEW.state
        WHERE agency_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_sync_agency_to_chunks ON manus_agencies;
CREATE TRIGGER trigger_sync_agency_to_chunks
AFTER UPDATE ON manus_agencies
FOR EACH ROW
EXECUTE FUNCTION sync_agency_to_chunks();

-- ============================================================================
-- STEP 8: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN manus_agencies.agency_type IS 'Classification of EMS agency (911, air medical, dispatch, etc.)';
COMMENT ON COLUMN manus_agencies.parent_protocol_source_id IS 'FK to parent agency for protocol inheritance (e.g., agency -> regional -> state)';
COMMENT ON COLUMN manus_agencies.call_volume_tier IS 'Call volume tier for 80/20 prioritization (high/mid/low)';
COMMENT ON COLUMN manus_agencies.license_number IS 'State-specific EMS license or certification number';
COMMENT ON COLUMN manus_agencies.is_verified IS 'True if agency data has been verified by medical director or authorized user';
COMMENT ON COLUMN manus_agencies.verified_at IS 'Timestamp when verification occurred';
COMMENT ON COLUMN manus_agencies.verified_by IS 'Identifier of who performed verification';
COMMENT ON COLUMN manus_agencies.integration_partner IS 'ePCR/data integration partner (ImageTrend, eSolutions, etc.)';
COMMENT ON COLUMN manus_agencies.integration_id IS 'Partner-specific agency identifier';

COMMENT ON FUNCTION get_protocol_inheritance_chain(INTEGER) IS
'Returns the full protocol inheritance chain for an agency, walking up parent references';

COMMENT ON FUNCTION get_protocols_with_inheritance(INTEGER, VECTOR, INTEGER, FLOAT) IS
'Semantic search across an agency and its inherited protocol sources';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'manus_agencies'
  AND column_name IN ('agency_type', 'parent_protocol_source_id', 'call_volume_tier',
                       'license_number', 'is_verified', 'verified_at', 'verified_by',
                       'integration_partner', 'integration_id')
ORDER BY column_name;

-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'manus_agencies'
  AND indexname LIKE 'idx_agencies_%';

-- Verify functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_protocol_inheritance_chain', 'get_protocols_with_inheritance');

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
/*
-- Drop trigger
DROP TRIGGER IF EXISTS trigger_sync_agency_to_chunks ON manus_agencies;
DROP FUNCTION IF EXISTS sync_agency_to_chunks();

-- Drop functions
DROP FUNCTION IF EXISTS get_protocols_with_inheritance(INTEGER, VECTOR, INTEGER, FLOAT);
DROP FUNCTION IF EXISTS get_protocol_inheritance_chain(INTEGER);

-- Drop indexes
DROP INDEX IF EXISTS idx_agencies_agency_type;
DROP INDEX IF EXISTS idx_agencies_call_volume_tier;
DROP INDEX IF EXISTS idx_agencies_parent_protocol_source;
DROP INDEX IF EXISTS idx_agencies_state_type_volume;
DROP INDEX IF EXISTS idx_agencies_integration_partner;
DROP INDEX IF EXISTS idx_agencies_is_verified;

-- Drop FK constraint
ALTER TABLE manus_agencies DROP CONSTRAINT IF EXISTS fk_parent_protocol_source;

-- Drop columns
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS agency_type;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS parent_protocol_source_id;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS call_volume_tier;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS license_number;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS is_verified;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS verified_at;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS verified_by;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS integration_partner;
ALTER TABLE manus_agencies DROP COLUMN IF EXISTS integration_id;

-- Drop enum types
DROP TYPE IF EXISTS agency_type_enum;
DROP TYPE IF EXISTS call_volume_tier_enum;
DROP TYPE IF EXISTS integration_partner_enum;
*/
