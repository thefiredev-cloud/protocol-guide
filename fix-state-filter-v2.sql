-- FIX v2: Drop old function and create new one with state_code in SELECT

-- Drop ALL versions of the function to avoid overload conflicts
DROP FUNCTION IF EXISTS search_manus_protocols(vector, integer, text, integer, float);
DROP FUNCTION IF EXISTS search_manus_protocols(vector, integer, text, integer, float, text, char);

-- Create new version with:
-- 1. State code filtering using chunks.state_code (not agencies join)
-- 2. State code in the SELECT output
-- 3. Removed agencies join (not needed - data is denormalized)

CREATE FUNCTION search_manus_protocols(
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
  similarity float,
  state_code char(2)
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
    1 - (pc.embedding <=> query_embedding) AS similarity,
    pc.state_code
  FROM manus_protocol_chunks pc
  WHERE
    pc.embedding IS NOT NULL
    -- Agency ID filter
    AND (agency_filter IS NULL OR pc.agency_id = agency_filter)
    -- State code filter (use denormalized column)
    AND (state_code_filter IS NULL OR pc.state_code = state_code_filter)
    -- Legacy state_filter (for backward compatibility)
    AND (state_filter IS NULL OR pc.state_code = state_filter)
    -- Agency name filter (use denormalized column)
    AND (agency_name_filter IS NULL OR pc.agency_name ILIKE '%' || agency_name_filter || '%')
    -- Similarity threshold
    AND 1 - (pc.embedding <=> query_embedding) > match_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_manus_protocols TO authenticated, anon, service_role;
