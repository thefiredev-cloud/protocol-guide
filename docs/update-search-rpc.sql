-- Updated search_manus_protocols RPC Function
-- Adds agency_name_filter and state_code_filter parameters
-- for more flexible filtering options

CREATE OR REPLACE FUNCTION search_manus_protocols(
  query_embedding vector(1536),
  agency_filter integer DEFAULT NULL,
  state_filter text DEFAULT NULL,
  match_count integer DEFAULT 10,
  match_threshold float DEFAULT 0.3,
  agency_name_filter text DEFAULT NULL,
  state_code_filter char(2) DEFAULT NULL
)
RETURNS TABLE (
  id integer,
  agency_id integer,
  protocol_number text,
  protocol_title text,
  section text,
  content text,
  image_urls text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.agency_id,
    pc.protocol_number,
    pc.protocol_title,
    pc.section,
    pc.content,
    pc.image_urls,
    1 - (pc.embedding <=> query_embedding) AS similarity
  FROM manus_protocol_chunks pc
  LEFT JOIN agencies a ON pc.agency_id = a.id
  WHERE
    pc.embedding IS NOT NULL
    -- Original agency_id filter
    AND (agency_filter IS NULL OR pc.agency_id = agency_filter)
    -- Original state filter (kept for backward compatibility)
    AND (state_filter IS NULL OR a.state_code = state_filter)
    -- NEW: Agency name pattern filter (ILIKE for case-insensitive partial match)
    AND (agency_name_filter IS NULL OR a.agency_name ILIKE '%' || agency_name_filter || '%')
    -- NEW: State code exact match filter
    AND (state_code_filter IS NULL OR a.state_code = state_code_filter)
    -- Similarity threshold
    AND 1 - (pc.embedding <=> query_embedding) > match_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Usage Examples:
--
-- 1. Search by agency name pattern:
-- SELECT * FROM search_manus_protocols(
--   query_embedding := '[0.1, 0.2, ...]'::vector(1536),
--   agency_name_filter := 'Denver'
-- );
--
-- 2. Search by exact state code:
-- SELECT * FROM search_manus_protocols(
--   query_embedding := '[0.1, 0.2, ...]'::vector(1536),
--   state_code_filter := 'CO'
-- );
--
-- 3. Combine both new filters:
-- SELECT * FROM search_manus_protocols(
--   query_embedding := '[0.1, 0.2, ...]'::vector(1536),
--   agency_name_filter := 'County',
--   state_code_filter := 'CA',
--   match_count := 20,
--   match_threshold := 0.5
-- );
--
-- 4. Use all filters (old + new):
-- SELECT * FROM search_manus_protocols(
--   query_embedding := '[0.1, 0.2, ...]'::vector(1536),
--   agency_filter := 123,
--   state_filter := 'TX',
--   agency_name_filter := 'City',
--   state_code_filter := 'TX',
--   match_count := 15
-- );

-- Notes:
-- - agency_name_filter uses ILIKE for case-insensitive pattern matching
-- - state_code_filter uses exact match (=) for char(2) state codes
-- - All filters are optional and only apply when non-NULL
-- - Backward compatible with existing calls (new params are optional)
-- - Performance: Ensure agencies.agency_name and agencies.state_code have indexes
