-- Rate Limiting Tables
-- Purpose: Dynamic rate limit configuration and violation tracking
-- Dependencies: 002_users_sessions.sql (for user references)

-- =============================================================================
-- RATE LIMIT CONFIGURATION TABLE
-- =============================================================================

CREATE TABLE rate_limit_config (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Configuration
  limit_type TEXT UNIQUE NOT NULL,
  requests_per_window INTEGER NOT NULL CHECK (requests_per_window > 0),
  window_ms INTEGER NOT NULL CHECK (window_ms > 0),
  error_message TEXT NOT NULL,

  -- Admin control
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_limit_type CHECK (limit_type ~ '^[A-Z_]+$')
);

-- Index for lookups
CREATE INDEX idx_rate_limit_config_type ON rate_limit_config(limit_type) WHERE enabled = TRUE;
CREATE INDEX idx_rate_limit_config_updated ON rate_limit_config(updated_at DESC);

-- Table comments
COMMENT ON TABLE rate_limit_config IS 'Dynamic rate limit configuration (editable without deployment)';
COMMENT ON COLUMN rate_limit_config.limit_type IS 'Rate limit type (CHAT, API, DOSING, AUTH, PHI, GLOBAL)';
COMMENT ON COLUMN rate_limit_config.requests_per_window IS 'Maximum requests allowed in time window';
COMMENT ON COLUMN rate_limit_config.window_ms IS 'Time window in milliseconds';
COMMENT ON COLUMN rate_limit_config.enabled IS 'Enable/disable this rate limit';
COMMENT ON COLUMN rate_limit_config.updated_by IS 'Admin user who last updated this config';

-- =============================================================================
-- RATE LIMIT VIOLATIONS TABLE
-- =============================================================================

CREATE TABLE rate_limit_violations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifier (fingerprint-based)
  fingerprint TEXT NOT NULL,
  ip_address INET,

  -- Violation details
  limit_type TEXT NOT NULL,
  violation_count INTEGER DEFAULT 1,

  -- Reputation scoring
  reputation_score INTEGER DEFAULT 100 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  is_banned BOOLEAN DEFAULT FALSE,

  -- Timestamps
  first_violation TIMESTAMPTZ DEFAULT NOW(),
  last_violation TIMESTAMPTZ DEFAULT NOW(),
  banned_until TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_ban_duration CHECK (banned_until IS NULL OR banned_until > last_violation)
);

-- Indexes for violation tracking
CREATE INDEX idx_violations_fingerprint ON rate_limit_violations(fingerprint);
CREATE INDEX idx_violations_ip ON rate_limit_violations(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX idx_violations_banned ON rate_limit_violations(is_banned, banned_until) WHERE is_banned = TRUE;
CREATE INDEX idx_violations_last ON rate_limit_violations(last_violation DESC);

-- Table comments
COMMENT ON TABLE rate_limit_violations IS 'Track rate limit violations and reputation scores';
COMMENT ON COLUMN rate_limit_violations.fingerprint IS 'SHA256 hash of IP + User-Agent + headers';
COMMENT ON COLUMN rate_limit_violations.reputation_score IS 'Score from 0-100 (ban threshold: 10)';
COMMENT ON COLUMN rate_limit_violations.is_banned IS 'Temporary ban status';
COMMENT ON COLUMN rate_limit_violations.banned_until IS 'Ban expiration timestamp';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on rate_limit_config
CREATE TRIGGER trigger_rate_limit_config_updated_at
  BEFORE UPDATE ON rate_limit_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-cleanup expired bans
CREATE OR REPLACE FUNCTION cleanup_expired_bans()
RETURNS TRIGGER AS $$
BEGIN
  -- Unban users whose ban has expired
  UPDATE rate_limit_violations
  SET is_banned = FALSE,
      banned_until = NULL
  WHERE is_banned = TRUE
    AND banned_until < NOW();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_expired_bans
  AFTER INSERT ON rate_limit_violations
  EXECUTE FUNCTION cleanup_expired_bans();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on rate_limit_config
ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read enabled rate limits
CREATE POLICY "Public read enabled rate limits"
  ON rate_limit_config FOR SELECT
  USING (enabled = TRUE);

-- Policy: Only admins can modify
CREATE POLICY "Admins can manage rate limits"
  ON rate_limit_config FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Enable RLS on rate_limit_violations
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read violations
CREATE POLICY "Admins can read violations"
  ON rate_limit_violations FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'medical_director')
  );

-- Policy: System can insert violations
CREATE POLICY "System can insert violations"
  ON rate_limit_violations FOR INSERT
  WITH CHECK (true);

-- Policy: System can update violations
CREATE POLICY "System can update violations"
  ON rate_limit_violations FOR UPDATE
  USING (true);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get active rate limit configuration
CREATE OR REPLACE FUNCTION get_rate_limits()
RETURNS TABLE (
  limit_type TEXT,
  requests_per_window INTEGER,
  window_ms INTEGER,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rl.limit_type,
    rl.requests_per_window,
    rl.window_ms,
    rl.error_message
  FROM rate_limit_config rl
  WHERE rl.enabled = TRUE
  ORDER BY rl.limit_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_rate_limits IS 'Get all enabled rate limit configurations';

-- Check if fingerprint is banned
CREATE OR REPLACE FUNCTION is_fingerprint_banned(p_fingerprint TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_banned BOOLEAN;
BEGIN
  SELECT is_banned INTO v_is_banned
  FROM rate_limit_violations
  WHERE fingerprint = p_fingerprint
    AND is_banned = TRUE
    AND (banned_until IS NULL OR banned_until > NOW())
  LIMIT 1;

  RETURN COALESCE(v_is_banned, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_fingerprint_banned IS 'Check if a fingerprint is currently banned';

-- Get reputation score
CREATE OR REPLACE FUNCTION get_reputation_score(p_fingerprint TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  SELECT reputation_score INTO v_score
  FROM rate_limit_violations
  WHERE fingerprint = p_fingerprint
  ORDER BY last_violation DESC
  LIMIT 1;

  RETURN COALESCE(v_score, 100); -- Default: perfect score
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_reputation_score IS 'Get current reputation score for a fingerprint';

-- Record violation and update reputation
CREATE OR REPLACE FUNCTION record_violation(
  p_fingerprint TEXT,
  p_ip_address INET,
  p_limit_type TEXT,
  p_reputation_penalty INTEGER DEFAULT 5
)
RETURNS TABLE (
  new_score INTEGER,
  is_banned BOOLEAN,
  banned_until TIMESTAMPTZ
) AS $$
DECLARE
  v_existing RECORD;
  v_new_score INTEGER;
  v_is_banned BOOLEAN;
  v_banned_until TIMESTAMPTZ;
BEGIN
  -- Check for existing violation record
  SELECT * INTO v_existing
  FROM rate_limit_violations
  WHERE fingerprint = p_fingerprint
  ORDER BY last_violation DESC
  LIMIT 1;

  IF v_existing IS NULL THEN
    -- First violation
    v_new_score := 100 - p_reputation_penalty;
    v_is_banned := FALSE;

    INSERT INTO rate_limit_violations (
      fingerprint,
      ip_address,
      limit_type,
      violation_count,
      reputation_score,
      is_banned
    ) VALUES (
      p_fingerprint,
      p_ip_address,
      p_limit_type,
      1,
      v_new_score,
      FALSE
    );
  ELSE
    -- Update existing record
    v_new_score := GREATEST(0, v_existing.reputation_score - p_reputation_penalty);
    v_is_banned := v_new_score <= 10;

    -- Ban duration: 1 hour for scores 6-10, 24 hours for score 0-5
    IF v_is_banned THEN
      IF v_new_score <= 5 THEN
        v_banned_until := NOW() + INTERVAL '24 hours';
      ELSE
        v_banned_until := NOW() + INTERVAL '1 hour';
      END IF;
    ELSE
      v_banned_until := NULL;
    END IF;

    UPDATE rate_limit_violations
    SET
      violation_count = violation_count + 1,
      reputation_score = v_new_score,
      is_banned = v_is_banned,
      last_violation = NOW(),
      banned_until = v_banned_until,
      limit_type = p_limit_type
    WHERE id = v_existing.id;
  END IF;

  RETURN QUERY
  SELECT v_new_score, v_is_banned, v_banned_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION record_violation IS 'Record a rate limit violation and update reputation score';

-- Get top violators
CREATE OR REPLACE FUNCTION get_top_violators(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  fingerprint TEXT,
  ip_address INET,
  violation_count INTEGER,
  reputation_score INTEGER,
  is_banned BOOLEAN,
  last_violation TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.fingerprint,
    v.ip_address,
    v.violation_count,
    v.reputation_score,
    v.is_banned,
    v.last_violation
  FROM rate_limit_violations v
  WHERE v.last_violation >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY v.violation_count DESC, v.reputation_score ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_top_violators IS 'Get top rate limit violators in specified timeframe';

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert default rate limit configurations
INSERT INTO rate_limit_config (limit_type, requests_per_window, window_ms, error_message) VALUES
  ('CHAT', 20, 60000, 'Too many chat requests. Please slow down.'),
  ('API', 60, 60000, 'Rate limit exceeded. Please wait before making more requests.'),
  ('DOSING', 30, 60000, 'Too many dosing calculations. Please wait.'),
  ('AUTH', 5, 900000, 'Too many authentication attempts. Please wait 15 minutes.'),
  ('PHI', 50, 60000, 'PHI access rate limit exceeded. Please wait.'),
  ('GLOBAL', 500, 900000, 'Global rate limit exceeded. Please wait.');

-- Log initial setup
INSERT INTO audit_logs (action, resource, outcome, metadata)
VALUES (
  'system.startup',
  'rate_limit_initialization',
  'success',
  jsonb_build_object(
    'migration_version', '004',
    'default_configs_created', 6,
    'timestamp', NOW()
  )
);
