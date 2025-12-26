-- HIPAA-Compliant Audit Logs Table
-- Purpose: Immutable audit trail for all security-relevant events
-- Retention: 6 years (HIPAA requirement for PHI access logging)
-- Schema: PostgreSQL 14+

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for audit actions and outcomes
CREATE TYPE audit_action AS ENUM (
  'user.login',
  'user.logout',
  'user.session.start',
  'user.session.end',
  'chat.query',
  'chat.stream',
  'dosing.calculate',
  'dosing.list',
  'protocol.view',
  'protocol.search',
  'auth.failure',
  'auth.unauthorized',
  'api.error',
  'api.validation_error',
  'system.startup',
  'system.shutdown'
);

CREATE TYPE audit_outcome AS ENUM (
  'success',
  'failure',
  'partial'
);

CREATE TYPE user_role AS ENUM (
  'paramedic',
  'emt',
  'medical_director',
  'admin',
  'guest'
);

-- Create the main audit_logs table
CREATE TABLE audit_logs (
  -- Primary key and timestamp (immutable)
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User identification (nullable for unauthenticated requests)
  user_id VARCHAR(255),
  user_role user_role,
  session_id VARCHAR(255),

  -- Event details
  action audit_action NOT NULL,
  resource VARCHAR(500) NOT NULL,
  outcome audit_outcome NOT NULL,

  -- Additional context (JSONB for flexible metadata storage)
  metadata JSONB,

  -- Network information
  ip_address INET,
  user_agent TEXT,

  -- Error tracking
  error_message TEXT,

  -- Performance tracking
  duration_ms INTEGER,

  -- Audit trail metadata (for compliance)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0),
  CONSTRAINT valid_timestamp CHECK (timestamp <= NOW() + INTERVAL '1 hour') -- Allow small clock skew
);

-- Create indexes for common query patterns
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_outcome ON audit_logs(outcome);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC) WHERE user_id IS NOT NULL;

-- Create GIN index for JSONB metadata queries
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN(metadata);

-- Add table comment for documentation
COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit trail for all security events. Immutable, append-only. Retention: 6 years.';

-- Column comments
COMMENT ON COLUMN audit_logs.event_id IS 'Unique event identifier (UUID v4)';
COMMENT ON COLUMN audit_logs.timestamp IS 'ISO 8601 timestamp of the event';
COMMENT ON COLUMN audit_logs.user_id IS 'User identifier (anonymized/hashed if needed)';
COMMENT ON COLUMN audit_logs.user_role IS 'User role at time of event';
COMMENT ON COLUMN audit_logs.session_id IS 'Session identifier for correlation';
COMMENT ON COLUMN audit_logs.action IS 'Action performed';
COMMENT ON COLUMN audit_logs.resource IS 'Resource accessed (protocol name, medication ID, etc.)';
COMMENT ON COLUMN audit_logs.outcome IS 'Outcome of the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional structured metadata (protocol names, calc results, etc.)';
COMMENT ON COLUMN audit_logs.ip_address IS 'Client IP address (IPv4 or IPv6)';
COMMENT ON COLUMN audit_logs.user_agent IS 'User-Agent header (browser/client info)';
COMMENT ON COLUMN audit_logs.error_message IS 'Error message (only if outcome is failure)';
COMMENT ON COLUMN audit_logs.duration_ms IS 'Duration in milliseconds (for performance tracking)';

-- Prevent updates and deletes (append-only, immutable)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. Updates and deletes are not allowed.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_prevent_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER audit_logs_prevent_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Create a view for easier querying (with common filters)
CREATE OR REPLACE VIEW audit_logs_recent AS
SELECT
  event_id,
  timestamp,
  user_id,
  user_role,
  session_id,
  action,
  resource,
  outcome,
  metadata,
  ip_address,
  user_agent,
  error_message,
  duration_ms
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;

COMMENT ON VIEW audit_logs_recent IS 'Recent audit logs (last 30 days) for quick access';

-- Create a materialized view for audit statistics (refreshed daily)
CREATE MATERIALIZED VIEW audit_stats AS
SELECT
  DATE(timestamp) as date,
  action,
  outcome,
  COUNT(*) as event_count,
  AVG(duration_ms) as avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration_ms
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '90 days'
  AND duration_ms IS NOT NULL
GROUP BY DATE(timestamp), action, outcome
ORDER BY date DESC, action, outcome;

CREATE UNIQUE INDEX idx_audit_stats_date_action_outcome ON audit_stats(date, action, outcome);

COMMENT ON MATERIALIZED VIEW audit_stats IS 'Daily aggregated audit statistics for the last 90 days. Refresh daily.';

-- Function to refresh audit stats (called by cron job)
CREATE OR REPLACE FUNCTION refresh_audit_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY audit_stats;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up old audit logs (6+ years)
-- Note: This should be called ONLY after verifying compliance requirements
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete logs older than 6 years (HIPAA retention requirement)
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '6 years';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log the cleanup operation
  INSERT INTO audit_logs (action, resource, outcome, metadata)
  VALUES (
    'system.startup',
    'audit_logs_cleanup',
    'success',
    jsonb_build_object('deleted_count', deleted_count, 'retention_years', 6)
  );

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Cleanup audit logs older than 6 years. Run this manually or via scheduled job.';

-- Grant appropriate permissions
-- IMPORTANT: Adjust these based on your database user setup

-- Read-only access for medical directors and admins (via application layer RBAC)
-- GRANT SELECT ON audit_logs TO medical_director_role;
-- GRANT SELECT ON audit_logs TO admin_role;

-- Application service account needs INSERT only (append-only)
-- GRANT INSERT ON audit_logs TO medic_bot_service;

-- Example query functions for common audit scenarios
CREATE OR REPLACE FUNCTION get_user_audit_trail(
  p_user_id VARCHAR,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  event_id UUID,
  event_timestamp TIMESTAMPTZ,
  action audit_action,
  resource VARCHAR,
  outcome audit_outcome,
  ip_address INET,
  duration_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.event_id,
    a.timestamp,
    a.action,
    a.resource,
    a.outcome,
    a.ip_address,
    a.duration_ms
  FROM audit_logs a
  WHERE a.user_id = p_user_id
    AND a.timestamp >= p_start_date
    AND a.timestamp <= p_end_date
  ORDER BY a.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_audit_trail IS 'Retrieve complete audit trail for a specific user';

CREATE OR REPLACE FUNCTION get_failed_auth_attempts(
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  event_id UUID,
  event_timestamp TIMESTAMPTZ,
  user_id VARCHAR,
  ip_address INET,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.event_id,
    a.timestamp,
    a.user_id,
    a.ip_address,
    a.error_message
  FROM audit_logs a
  WHERE a.action IN ('auth.failure', 'auth.unauthorized')
    AND a.outcome = 'failure'
    AND a.timestamp >= NOW() - (p_hours || ' hours')::INTERVAL
  ORDER BY a.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_failed_auth_attempts IS 'Retrieve failed authentication attempts within specified hours';

-- Create a function to get audit summary statistics
CREATE OR REPLACE FUNCTION get_audit_summary(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_events BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  unique_users BIGINT,
  unique_sessions BIGINT,
  avg_duration_ms NUMERIC,
  p95_duration_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE outcome = 'success') as success_count,
    COUNT(*) FILTER (WHERE outcome = 'failure') as failure_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(duration_ms) as avg_duration_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms
  FROM audit_logs
  WHERE timestamp >= p_start_date
    AND timestamp <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_audit_summary IS 'Get summary statistics for audit logs within date range';

-- Insert initial system startup event
INSERT INTO audit_logs (action, resource, outcome, metadata)
VALUES (
  'system.startup',
  'audit_logs_initialization',
  'success',
  jsonb_build_object(
    'migration_version', '001',
    'schema_created', NOW(),
    'retention_years', 6,
    'compliance', 'HIPAA'
  )
);
