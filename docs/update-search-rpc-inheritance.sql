-- ============================================================================
-- Protocol Guide: Update Search RPC for Protocol Inheritance
-- ============================================================================
-- This updates the search_manus_protocols function to optionally
-- include protocols from parent agencies in the inheritance chain.
-- ============================================================================

-- ============================================================================
-- OPTION 1: Simple Enhancement (Add optional inheritance parameter)
-- ============================================================================

-- Drop existing function first (if parameter signature changes)
DROP FUNCTION IF EXISTS search_manus_protocols(
    vector, integer, text, integer, float, text, text
);

-- Create enhanced search function
CREATE OR REPLACE FUNCTION search_manus_protocols(
    query_embedding VECTOR(1536),
    agency_filter INTEGER DEFAULT NULL,
    state_filter TEXT DEFAULT NULL,           -- Deprecated, use state_code_filter
    match_count INTEGER DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.3,
    agency_name_filter TEXT DEFAULT NULL,
    state_code_filter TEXT DEFAULT NULL,
    include_inherited BOOLEAN DEFAULT FALSE   -- NEW: Include parent protocols
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
    source_level TEXT                         -- NEW: 'agency', 'regional', 'state'
)
LANGUAGE plpgsql
AS $$
DECLARE
    effective_agency_ids INTEGER[];
BEGIN
    -- Build effective agency IDs list
    IF include_inherited AND agency_filter IS NOT NULL THEN
        -- Get all agency IDs in inheritance chain
        SELECT ARRAY_AGG(c.id ORDER BY c.level)
        INTO effective_agency_ids
        FROM get_protocol_inheritance_chain(agency_filter) c;
    ELSIF agency_filter IS NOT NULL THEN
        effective_agency_ids := ARRAY[agency_filter];
    END IF;

    -- Main search query
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
        -- Determine source level
        CASE
            WHEN pc.agency_id = agency_filter THEN 'agency'
            WHEN a.agency_type = 'regional_council' THEN 'regional'
            WHEN a.agency_type = 'state_office' THEN 'state'
            ELSE 'inherited'
        END AS source_level
    FROM manus_protocol_chunks pc
    LEFT JOIN manus_agencies a ON pc.agency_id = a.id
    WHERE
        -- Vector similarity threshold
        (1 - (pc.embedding <=> query_embedding)) > match_threshold
        -- Agency filter (with optional inheritance)
        AND (
            effective_agency_ids IS NULL
            OR pc.agency_id = ANY(effective_agency_ids)
        )
        -- State code filter (on denormalized field or agency table)
        AND (
            state_code_filter IS NULL
            OR pc.state_code = state_code_filter
            OR a.state_code = state_code_filter
        )
        -- Agency name filter (partial match)
        AND (
            agency_name_filter IS NULL
            OR pc.agency_name ILIKE '%' || agency_name_filter || '%'
            OR a.name ILIKE '%' || agency_name_filter || '%'
        )
        -- Legacy state filter (deprecated)
        AND (
            state_filter IS NULL
            OR pc.state_name ILIKE '%' || state_filter || '%'
            OR a.state ILIKE '%' || state_filter || '%'
        )
    ORDER BY
        -- Prioritize agency's own protocols when using inheritance
        CASE WHEN include_inherited AND pc.agency_id = agency_filter THEN 0 ELSE 1 END,
        -- Then by similarity
        (1 - (pc.embedding <=> query_embedding)) DESC
    LIMIT match_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION search_manus_protocols IS
'Semantic search for protocols with optional inheritance support.
Set include_inherited=TRUE to search agency + parent protocols.';

-- ============================================================================
-- OPTION 2: Separate Inheritance Search Function
-- ============================================================================

-- Alternative: Keep original function unchanged, add new one for inheritance
CREATE OR REPLACE FUNCTION search_manus_protocols_inherited(
    query_embedding VECTOR(1536),
    agency_id_param INTEGER,
    match_count INTEGER DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    id INTEGER,
    agency_id INTEGER,
    agency_name TEXT,
    protocol_number TEXT,
    protocol_title TEXT,
    section TEXT,
    content TEXT,
    image_urls TEXT[],
    similarity FLOAT,
    source_level TEXT,
    inheritance_level INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH inheritance AS (
        SELECT
            c.id AS chain_agency_id,
            c.level AS chain_level,
            c.agency_type
        FROM get_protocol_inheritance_chain(agency_id_param) c
    )
    SELECT
        pc.id,
        pc.agency_id,
        a.name AS agency_name,
        pc.protocol_number,
        pc.protocol_title,
        pc.section,
        pc.content,
        pc.image_urls,
        (1 - (pc.embedding <=> query_embedding))::FLOAT AS similarity,
        CASE
            WHEN inh.chain_level = 1 THEN 'agency'
            WHEN a.agency_type = 'regional_council' THEN 'regional'
            WHEN a.agency_type = 'state_office' THEN 'state'
            ELSE 'inherited'
        END AS source_level,
        inh.chain_level AS inheritance_level
    FROM manus_protocol_chunks pc
    INNER JOIN inheritance inh ON pc.agency_id = inh.chain_agency_id
    INNER JOIN manus_agencies a ON pc.agency_id = a.id
    WHERE (1 - (pc.embedding <=> query_embedding)) > match_threshold
    ORDER BY
        -- Agency's own protocols first
        inh.chain_level ASC,
        -- Then by similarity within each level
        (1 - (pc.embedding <=> query_embedding)) DESC
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_manus_protocols_inherited IS
'Semantic search that includes protocols from parent agencies in inheritance chain.
Returns source_level (agency/regional/state) and inheritance_level (1=own, 2+=parent).';

-- ============================================================================
-- HELPER FUNCTION: Get Effective Protocols for Agency
-- ============================================================================

-- Returns protocol coverage summary for an agency including inherited
CREATE OR REPLACE FUNCTION get_agency_protocol_coverage(agency_id_param INTEGER)
RETURNS TABLE (
    source_agency_id INTEGER,
    source_agency_name TEXT,
    source_level TEXT,
    protocol_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH inheritance AS (
        SELECT
            c.id AS chain_agency_id,
            c.name AS chain_agency_name,
            c.level AS chain_level,
            c.agency_type
        FROM get_protocol_inheritance_chain(agency_id_param) c
    )
    SELECT
        inh.chain_agency_id AS source_agency_id,
        inh.chain_agency_name AS source_agency_name,
        CASE
            WHEN inh.chain_level = 1 THEN 'agency'
            WHEN inh.agency_type = 'regional_council' THEN 'regional'
            WHEN inh.agency_type = 'state_office' THEN 'state'
            ELSE 'inherited'
        END AS source_level,
        COUNT(pc.id) AS protocol_count
    FROM inheritance inh
    LEFT JOIN manus_protocol_chunks pc ON pc.agency_id = inh.chain_agency_id
    GROUP BY inh.chain_agency_id, inh.chain_agency_name, inh.chain_level, inh.agency_type
    ORDER BY inh.chain_level;
END;
$$;

COMMENT ON FUNCTION get_agency_protocol_coverage(INTEGER) IS
'Returns protocol count from each source in the agency inheritance chain.
Useful for showing "Your protocols: X, Regional: Y, State: Z"';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test inheritance chain for a sample agency
-- SELECT * FROM get_protocol_inheritance_chain(1);

-- Test inherited search
-- WITH test_embedding AS (
--     SELECT embedding FROM manus_protocol_chunks LIMIT 1
-- )
-- SELECT * FROM search_manus_protocols_inherited(
--     (SELECT embedding FROM test_embedding),
--     1,  -- agency_id
--     5   -- match_count
-- );

-- Test protocol coverage
-- SELECT * FROM get_agency_protocol_coverage(1);

-- ============================================================================
-- INDEX OPTIMIZATION FOR INHERITANCE QUERIES
-- ============================================================================

-- Index for faster inheritance joins
CREATE INDEX IF NOT EXISTS idx_protocol_chunks_agency_id
ON manus_protocol_chunks(agency_id);

-- Partial index for active agencies only (optimization)
CREATE INDEX IF NOT EXISTS idx_agencies_active_with_protocols
ON manus_agencies(id)
WHERE is_active = TRUE AND protocol_count > 0;
