-- QA/QI Enhancement Migration
-- LA County Fire EMS Division - Quality Assurance and Quality Improvement Tracking
-- Adds columns for comprehensive conversation analytics and clinical review workflow

-- ============================================
-- ENHANCE CHAT_SESSIONS TABLE
-- ============================================

-- Add user attribution columns
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS station TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS department TEXT;

-- Add patient context tracking
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS patient_context_active BOOLEAN DEFAULT FALSE;

-- Add session lifecycle columns
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS session_duration_ms INTEGER;

-- ============================================
-- ENHANCE CHAT_MESSAGES TABLE
-- ============================================

-- Add confidence level (categorical)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_level TEXT
  CHECK (confidence_level IS NULL OR confidence_level IN ('HIGH', 'MEDIUM', 'LOW'));

-- Add quality metrics
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS grounding_score FLOAT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS protocols_referenced TEXT[];

-- Add response classification
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_decline_response BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS has_warning BOOLEAN DEFAULT FALSE;

-- Add QA review workflow columns
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS qa_reviewed BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS qa_reviewed_by TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS qa_reviewed_at TIMESTAMPTZ;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS qa_status TEXT DEFAULT 'pending'
  CHECK (qa_status IS NULL OR qa_status IN ('pending', 'approved', 'flagged', 'escalated'));
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS qa_notes TEXT;

-- ============================================
-- CREATE INDEXES FOR QA/QI QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_user_email ON chat_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_sessions_station ON chat_sessions(station);
CREATE INDEX IF NOT EXISTS idx_sessions_department ON chat_sessions(department);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON chat_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_confidence_level ON chat_messages(confidence_level);
CREATE INDEX IF NOT EXISTS idx_messages_qa_status ON chat_messages(qa_status);
CREATE INDEX IF NOT EXISTS idx_messages_qa_reviewed ON chat_messages(qa_reviewed);
CREATE INDEX IF NOT EXISTS idx_messages_decline ON chat_messages(is_decline_response) WHERE is_decline_response = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_warning ON chat_messages(has_warning) WHERE has_warning = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- PROTOCOL USAGE STATISTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS protocol_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id TEXT NOT NULL,
  protocol_ref TEXT NOT NULL,
  protocol_title TEXT,
  query_date DATE NOT NULL DEFAULT CURRENT_DATE,
  station TEXT,
  department TEXT,
  query_count INTEGER DEFAULT 1,
  avg_confidence FLOAT,
  positive_feedback_count INTEGER DEFAULT 0,
  negative_feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_protocol_usage UNIQUE(protocol_id, query_date, station)
);

CREATE INDEX IF NOT EXISTS idx_protocol_usage_date ON protocol_usage_stats(query_date DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_usage_protocol ON protocol_usage_stats(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_usage_station ON protocol_usage_stats(station);

-- ============================================
-- QA VALIDATION QUEUE VIEW
-- ============================================

CREATE OR REPLACE VIEW qa_validation_queue AS
SELECT
  cm.id as message_id,
  cm.session_id,
  cs.user_email,
  cs.station,
  cs.department,
  cm.role,
  cm.content,
  cm.confidence,
  cm.confidence_level,
  cm.grounding_score,
  cm.is_decline_response,
  cm.has_warning,
  cm.protocols_referenced,
  cm.response_time_ms,
  cm.qa_status,
  cm.created_at,
  uf.rating as feedback_rating,
  uf.issue_type as feedback_issue,
  uf.feedback_text
FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.id
LEFT JOIN user_feedback uf ON uf.message_id = cm.id::text
WHERE cm.role = 'assistant'
  AND (
    cm.confidence_level = 'LOW'
    OR cm.has_warning = TRUE
    OR cm.is_decline_response = TRUE
    OR uf.rating = 'negative'
    OR cm.qa_status = 'pending'
  )
  AND cm.qa_reviewed = FALSE
ORDER BY cm.created_at DESC;

-- Grant access to view
GRANT SELECT ON qa_validation_queue TO authenticated;

-- ============================================
-- DAILY METRICS SUMMARY VIEW
-- ============================================

CREATE OR REPLACE VIEW daily_chat_metrics AS
SELECT
  DATE(cm.created_at) as query_date,
  cs.station,
  cs.department,
  COUNT(*) FILTER (WHERE cm.role = 'user') as user_queries,
  COUNT(*) FILTER (WHERE cm.role = 'assistant') as ai_responses,
  AVG(cm.confidence) FILTER (WHERE cm.role = 'assistant') as avg_confidence,
  COUNT(*) FILTER (WHERE cm.confidence_level = 'HIGH') as high_confidence_count,
  COUNT(*) FILTER (WHERE cm.confidence_level = 'MEDIUM') as medium_confidence_count,
  COUNT(*) FILTER (WHERE cm.confidence_level = 'LOW') as low_confidence_count,
  COUNT(*) FILTER (WHERE cm.is_decline_response = TRUE) as decline_count,
  COUNT(*) FILTER (WHERE cm.has_warning = TRUE) as warning_count,
  AVG(cm.response_time_ms) FILTER (WHERE cm.response_time_ms IS NOT NULL) as avg_response_time_ms,
  COUNT(DISTINCT cs.id) as unique_sessions,
  COUNT(DISTINCT cs.user_email) as unique_users
FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.id
WHERE cm.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(cm.created_at), cs.station, cs.department
ORDER BY query_date DESC, station;

GRANT SELECT ON daily_chat_metrics TO authenticated;

-- ============================================
-- STATION PERFORMANCE VIEW
-- ============================================

CREATE OR REPLACE VIEW station_performance AS
SELECT
  cs.station,
  COUNT(DISTINCT cs.id) as total_sessions,
  COUNT(cm.id) FILTER (WHERE cm.role = 'user') as total_queries,
  AVG(cm.confidence) FILTER (WHERE cm.role = 'assistant') as avg_confidence,
  COUNT(*) FILTER (WHERE cm.confidence_level = 'HIGH') as high_confidence_count,
  COUNT(*) FILTER (WHERE cm.confidence_level = 'LOW') as low_confidence_count,
  COUNT(*) FILTER (WHERE cm.is_decline_response = TRUE) as decline_count,
  COUNT(uf.id) FILTER (WHERE uf.rating = 'positive') as positive_feedback,
  COUNT(uf.id) FILTER (WHERE uf.rating = 'negative') as negative_feedback,
  MAX(cm.created_at) as last_activity
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cm.session_id = cs.id
LEFT JOIN user_feedback uf ON uf.message_id = cm.id::text
WHERE cs.station IS NOT NULL
GROUP BY cs.station
ORDER BY total_queries DESC;

GRANT SELECT ON station_performance TO authenticated;

-- ============================================
-- RLS POLICIES FOR NEW TABLE
-- ============================================

ALTER TABLE protocol_usage_stats ENABLE ROW LEVEL SECURITY;

-- Admins can read/write, others can read
CREATE POLICY "protocol_usage_select_authenticated" ON protocol_usage_stats
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE protocol_usage_stats IS 'Aggregated protocol query statistics for QA/QI analysis';
COMMENT ON VIEW qa_validation_queue IS 'Messages requiring clinical review (low confidence, warnings, negative feedback)';
COMMENT ON VIEW daily_chat_metrics IS 'Daily aggregated chat metrics by station/department';
COMMENT ON VIEW station_performance IS 'Performance summary by station for QA/QI dashboards';

COMMENT ON COLUMN chat_sessions.station IS 'LA County Fire station identifier';
COMMENT ON COLUMN chat_sessions.department IS 'Department/unit identifier';
COMMENT ON COLUMN chat_messages.qa_status IS 'QA review status: pending, approved, flagged, escalated';
COMMENT ON COLUMN chat_messages.confidence_level IS 'Categorical confidence: HIGH, MEDIUM, LOW';
