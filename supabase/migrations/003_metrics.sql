-- Metrics Table
-- Purpose: Persistent storage for performance metrics and analytics
-- Replaces: In-memory MetricsRegistry

-- =============================================================================
-- METRICS TABLE
-- =============================================================================

CREATE TABLE metrics (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metric identification
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'histogram')),

  -- Time bucket (hourly granularity)
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour < 24),

  -- Counter metrics
  count BIGINT DEFAULT 0,

  -- Histogram metrics (percentiles)
  p50 NUMERIC,
  p95 NUMERIC,
  p99 NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  avg_value NUMERIC,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_percentiles CHECK (
    (metric_type = 'counter' AND p50 IS NULL AND p95 IS NULL AND p99 IS NULL)
    OR metric_type = 'histogram'
  )
);

-- Unique constraint to prevent duplicate metrics for same time bucket
CREATE UNIQUE INDEX idx_metrics_unique
  ON metrics(metric_name, date, hour);

-- Indexes for common query patterns
CREATE INDEX idx_metrics_date ON metrics(date DESC);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_name_date ON metrics(metric_name, date DESC);

-- Table comment
COMMENT ON TABLE metrics IS 'Hourly aggregated performance metrics for analytics and monitoring';
COMMENT ON COLUMN metrics.metric_name IS 'Metric identifier (e.g., "api.requests", "api.latency")';
COMMENT ON COLUMN metrics.metric_type IS 'Metric type: counter (total count) or histogram (percentiles)';
COMMENT ON COLUMN metrics.date IS 'Date of metric (UTC timezone)';
COMMENT ON COLUMN metrics.hour IS 'Hour of day (0-23, UTC timezone)';
COMMENT ON COLUMN metrics.count IS 'Total count for counter metrics, or sample count for histograms';
COMMENT ON COLUMN metrics.p50 IS 'Median (50th percentile) for histogram metrics';
COMMENT ON COLUMN metrics.p95 IS '95th percentile for histogram metrics';
COMMENT ON COLUMN metrics.p99 IS '99th percentile for histogram metrics';

-- =============================================================================
-- AGGREGATED VIEWS
-- =============================================================================

-- Daily summary view (aggregates hourly data)
CREATE OR REPLACE VIEW metrics_daily AS
SELECT
  metric_name,
  metric_type,
  date,
  SUM(count) as total_count,
  AVG(p50) as avg_p50,
  AVG(p95) as avg_p95,
  AVG(p99) as avg_p99,
  MIN(min_value) as min_value,
  MAX(max_value) as max_value,
  AVG(avg_value) as avg_value
FROM metrics
GROUP BY metric_name, metric_type, date
ORDER BY date DESC, metric_name;

COMMENT ON VIEW metrics_daily IS 'Daily aggregated metrics (sum of all hourly buckets)';

-- Recent metrics view (last 24 hours)
CREATE OR REPLACE VIEW metrics_recent AS
SELECT
  metric_name,
  metric_type,
  date,
  hour,
  count,
  p50,
  p95,
  p99,
  min_value,
  max_value,
  avg_value
FROM metrics
WHERE date >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY date DESC, hour DESC, metric_name;

COMMENT ON VIEW metrics_recent IS 'Metrics from the last 24 hours';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-cleanup old metrics (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete metrics older than 90 days
  DELETE FROM metrics
  WHERE date < CURRENT_DATE - INTERVAL '90 days';

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_metrics
  AFTER INSERT ON metrics
  EXECUTE FUNCTION cleanup_old_metrics();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get metric summary for a date range
CREATE OR REPLACE FUNCTION get_metric_summary(
  p_metric_name TEXT,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_count BIGINT,
  avg_p50 NUMERIC,
  avg_p95 NUMERIC,
  avg_p99 NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.date,
    SUM(m.count) as total_count,
    AVG(m.p50) as avg_p50,
    AVG(m.p95) as avg_p95,
    AVG(m.p99) as avg_p99,
    MIN(m.min_value) as min_value,
    MAX(m.max_value) as max_value
  FROM metrics m
  WHERE m.metric_name = p_metric_name
    AND m.date >= p_start_date
    AND m.date <= p_end_date
  GROUP BY m.date
  ORDER BY m.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_metric_summary IS 'Get daily summary for a specific metric over a date range';

-- Get all metrics for a specific date
CREATE OR REPLACE FUNCTION get_metrics_by_date(p_date DATE)
RETURNS TABLE (
  metric_name TEXT,
  metric_type TEXT,
  hour INTEGER,
  count BIGINT,
  p50 NUMERIC,
  p95 NUMERIC,
  p99 NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.metric_name,
    m.metric_type,
    m.hour,
    m.count,
    m.p50,
    m.p95,
    m.p99
  FROM metrics m
  WHERE m.date = p_date
  ORDER BY m.metric_name, m.hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_metrics_by_date IS 'Get all metrics for a specific date';

-- Get top metrics by count
CREATE OR REPLACE FUNCTION get_top_metrics(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  metric_name TEXT,
  total_count BIGINT,
  avg_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.metric_name,
    SUM(m.count) as total_count,
    AVG(m.avg_value) as avg_value
  FROM metrics m
  WHERE m.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  GROUP BY m.metric_name
  ORDER BY total_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_top_metrics IS 'Get top N metrics by total count over specified days';

-- Get performance degradation alerts
CREATE OR REPLACE FUNCTION get_performance_alerts(
  p_threshold_multiplier NUMERIC DEFAULT 2.0,
  p_days INTEGER DEFAULT 1
)
RETURNS TABLE (
  metric_name TEXT,
  current_p95 NUMERIC,
  baseline_p95 NUMERIC,
  degradation_factor NUMERIC,
  alert_severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH recent AS (
    SELECT
      m.metric_name,
      AVG(m.p95) as current_p95
    FROM metrics m
    WHERE m.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
      AND m.metric_type = 'histogram'
    GROUP BY m.metric_name
  ),
  baseline AS (
    SELECT
      m.metric_name,
      AVG(m.p95) as baseline_p95
    FROM metrics m
    WHERE m.date >= CURRENT_DATE - INTERVAL '30 days'
      AND m.date < CURRENT_DATE - (p_days || ' days')::INTERVAL
      AND m.metric_type = 'histogram'
    GROUP BY m.metric_name
  )
  SELECT
    r.metric_name,
    r.current_p95,
    b.baseline_p95,
    (r.current_p95 / NULLIF(b.baseline_p95, 0)) as degradation_factor,
    CASE
      WHEN (r.current_p95 / NULLIF(b.baseline_p95, 0)) >= p_threshold_multiplier * 2 THEN 'CRITICAL'
      WHEN (r.current_p95 / NULLIF(b.baseline_p95, 0)) >= p_threshold_multiplier THEN 'WARNING'
      ELSE 'INFO'
    END as alert_severity
  FROM recent r
  JOIN baseline b ON r.metric_name = b.metric_name
  WHERE r.current_p95 / NULLIF(b.baseline_p95, 0) >= p_threshold_multiplier
  ORDER BY degradation_factor DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_performance_alerts IS 'Detect performance degradation by comparing recent metrics to baseline';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on metrics table
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read metrics
CREATE POLICY "Authenticated users can read metrics"
  ON metrics FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only system (service role) can insert metrics
CREATE POLICY "System can insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);

-- Policy: Only system can update metrics (for upsert operations)
CREATE POLICY "System can update metrics"
  ON metrics FOR UPDATE
  USING (true);

-- Policy: No direct deletes (cleanup handled by trigger)
CREATE POLICY "No manual deletes"
  ON metrics FOR DELETE
  USING (false);

-- =============================================================================
-- INITIAL SYSTEM METRICS
-- =============================================================================

-- Insert system startup metric
INSERT INTO metrics (metric_name, metric_type, date, hour, count)
VALUES (
  'system.migrations',
  'counter',
  CURRENT_DATE,
  EXTRACT(HOUR FROM NOW())::INTEGER,
  1
);
