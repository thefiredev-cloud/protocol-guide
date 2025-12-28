-- =============================================================================
-- ImageTrend Connections Table
-- Store encrypted OAuth tokens for ImageTrend API connections
-- =============================================================================

-- Create table to store ImageTrend OAuth connections
CREATE TABLE imagetrend_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id TEXT NOT NULL,
  agency_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['pcr:read', 'pcr:write'],
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE imagetrend_connections ENABLE ROW LEVEL SECURITY;

-- Users can only access their own connections
CREATE POLICY "Users can view own ImageTrend connection"
  ON imagetrend_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ImageTrend connection"
  ON imagetrend_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ImageTrend connection"
  ON imagetrend_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ImageTrend connection"
  ON imagetrend_connections FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Index for quick lookups by user_id
CREATE INDEX idx_imagetrend_connections_user ON imagetrend_connections(user_id);

-- Index for expired token cleanup
CREATE INDEX idx_imagetrend_connections_expires ON imagetrend_connections(token_expires_at);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_imagetrend_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_imagetrend_connections_updated_at
  BEFORE UPDATE ON imagetrend_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_imagetrend_connections_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE imagetrend_connections IS 'Stores encrypted OAuth tokens for ImageTrend API connections';
COMMENT ON COLUMN imagetrend_connections.user_id IS 'Reference to auth.users - each user can have one connection';
COMMENT ON COLUMN imagetrend_connections.agency_id IS 'ImageTrend agency identifier';
COMMENT ON COLUMN imagetrend_connections.access_token_encrypted IS 'Encrypted OAuth access token';
COMMENT ON COLUMN imagetrend_connections.refresh_token_encrypted IS 'Encrypted OAuth refresh token';
COMMENT ON COLUMN imagetrend_connections.token_expires_at IS 'When the access token expires (for automatic refresh)';
COMMENT ON COLUMN imagetrend_connections.scopes IS 'OAuth scopes granted for this connection';
COMMENT ON COLUMN imagetrend_connections.last_used_at IS 'Last time this connection was used for an API call';
