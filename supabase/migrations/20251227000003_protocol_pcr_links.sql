-- =============================================================================
-- Protocol-PCR Links Table
-- Track protocol-to-PCR links for ImageTrend integration
-- =============================================================================

-- Create table to track protocol usage linked to ImageTrend PCRs
CREATE TABLE protocol_pcr_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id TEXT NOT NULL,
  protocol_name TEXT NOT NULL,
  pcr_id TEXT NOT NULL,
  pcr_incident_number TEXT,
  imagetrend_link_id TEXT,
  usage_context JSONB NOT NULL DEFAULT '{}',
  medication_administered JSONB,
  vitals_at_administration JSONB,
  linked_at TIMESTAMPTZ DEFAULT now(),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  sync_error TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE protocol_pcr_links ENABLE ROW LEVEL SECURITY;

-- Users can only access their own links
CREATE POLICY "Users can view own protocol links"
  ON protocol_pcr_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own protocol links"
  ON protocol_pcr_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protocol links"
  ON protocol_pcr_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own protocol links"
  ON protocol_pcr_links FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Index for user lookups
CREATE INDEX idx_protocol_pcr_links_user ON protocol_pcr_links(user_id);

-- Index for protocol lookups (analytics, usage tracking)
CREATE INDEX idx_protocol_pcr_links_protocol ON protocol_pcr_links(protocol_id);

-- Index for PCR lookups (finding all protocols used in a PCR)
CREATE INDEX idx_protocol_pcr_links_pcr ON protocol_pcr_links(pcr_id);

-- Index for sync status (finding pending syncs)
CREATE INDEX idx_protocol_pcr_links_sync ON protocol_pcr_links(sync_status) WHERE sync_status = 'pending';

-- Index for time-based queries
CREATE INDEX idx_protocol_pcr_links_linked_at ON protocol_pcr_links(linked_at DESC);

-- Composite index for user + protocol analytics
CREATE INDEX idx_protocol_pcr_links_user_protocol ON protocol_pcr_links(user_id, protocol_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get protocol usage statistics
CREATE OR REPLACE FUNCTION get_protocol_usage_stats(
  p_user_id UUID DEFAULT NULL,
  p_protocol_id TEXT DEFAULT NULL,
  p_days_back INT DEFAULT 30
)
RETURNS TABLE (
  protocol_id TEXT,
  protocol_name TEXT,
  usage_count BIGINT,
  last_used TIMESTAMPTZ,
  sync_success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ppl.protocol_id,
    ppl.protocol_name,
    COUNT(*) AS usage_count,
    MAX(ppl.linked_at) AS last_used,
    ROUND(
      (COUNT(*) FILTER (WHERE ppl.sync_status = 'synced')::NUMERIC /
       NULLIF(COUNT(*), 0) * 100),
      2
    ) AS sync_success_rate
  FROM protocol_pcr_links ppl
  WHERE
    (p_user_id IS NULL OR ppl.user_id = p_user_id)
    AND (p_protocol_id IS NULL OR ppl.protocol_id = p_protocol_id)
    AND ppl.linked_at > now() - (p_days_back || ' days')::INTERVAL
  GROUP BY ppl.protocol_id, ppl.protocol_name
  ORDER BY usage_count DESC;
END;
$$;

-- Function to get pending syncs for a user
CREATE OR REPLACE FUNCTION get_pending_syncs(
  p_user_id UUID
)
RETURNS TABLE (
  link_id UUID,
  protocol_name TEXT,
  pcr_incident_number TEXT,
  linked_at TIMESTAMPTZ,
  minutes_pending INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ppl.id AS link_id,
    ppl.protocol_name,
    ppl.pcr_incident_number,
    ppl.linked_at,
    EXTRACT(EPOCH FROM (now() - ppl.linked_at))::INT / 60 AS minutes_pending
  FROM protocol_pcr_links ppl
  WHERE
    ppl.user_id = p_user_id
    AND ppl.sync_status = 'pending'
  ORDER BY ppl.linked_at DESC;
END;
$$;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION get_protocol_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_syncs TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE protocol_pcr_links IS 'Links between Protocol Guide protocols and ImageTrend PCRs';
COMMENT ON COLUMN protocol_pcr_links.user_id IS 'EMS provider who used the protocol';
COMMENT ON COLUMN protocol_pcr_links.protocol_id IS 'Protocol identifier from Protocol Guide';
COMMENT ON COLUMN protocol_pcr_links.pcr_id IS 'ImageTrend PCR identifier';
COMMENT ON COLUMN protocol_pcr_links.usage_context IS 'Context about how protocol was used (patient presentation, decision points, etc.)';
COMMENT ON COLUMN protocol_pcr_links.medication_administered IS 'Medications given per this protocol';
COMMENT ON COLUMN protocol_pcr_links.vitals_at_administration IS 'Patient vitals at time of protocol use';
COMMENT ON COLUMN protocol_pcr_links.sync_status IS 'Sync status: pending (not synced), synced (successfully synced), failed (sync error)';
COMMENT ON COLUMN protocol_pcr_links.imagetrend_link_id IS 'ImageTrend internal link ID if applicable';

COMMENT ON FUNCTION get_protocol_usage_stats IS 'Get protocol usage statistics with optional filtering by user, protocol, and time range';
COMMENT ON FUNCTION get_pending_syncs IS 'Get all pending syncs for a user that need to be synced to ImageTrend';
