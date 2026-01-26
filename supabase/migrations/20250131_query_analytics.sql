-- Query Analytics Tables for RAG Improvement
-- Captures query data for analysis and tuning

-- Query Analytics Log Table
CREATE TABLE IF NOT EXISTS query_analytics_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- Query Information
  original_query TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  query_intent VARCHAR(50) NOT NULL,
  is_complex BOOLEAN DEFAULT FALSE,
  is_emergent BOOLEAN DEFAULT FALSE,
  extracted_medications TEXT[] DEFAULT '{}',
  extracted_conditions TEXT[] DEFAULT '{}',
  expanded_abbreviations TEXT[] DEFAULT '{}',
  
  -- Search Context
  agency_id INTEGER,
  agency_name VARCHAR(255),
  state_code VARCHAR(2),
  user_tier VARCHAR(20) NOT NULL DEFAULT 'free',
  
  -- Results Metrics
  result_count INTEGER NOT NULL DEFAULT 0,
  top_similarity_score REAL NOT NULL DEFAULT 0,
  avg_similarity_score REAL NOT NULL DEFAULT 0,
  used_multi_query_fusion BOOLEAN DEFAULT FALSE,
  cache_hit BOOLEAN DEFAULT FALSE,
  
  -- Performance Metrics
  total_latency_ms INTEGER NOT NULL DEFAULT 0,
  embedding_latency_ms INTEGER DEFAULT 0,
  search_latency_ms INTEGER DEFAULT 0,
  rerank_latency_ms INTEGER DEFAULT 0,
  llm_latency_ms INTEGER DEFAULT 0,
  
  -- Model Information
  model_used VARCHAR(20) DEFAULT 'haiku',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query Feedback Table
CREATE TABLE IF NOT EXISTS query_feedback (
  id BIGSERIAL PRIMARY KEY,
  query_log_id BIGINT REFERENCES query_analytics_log(id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  feedback_type VARCHAR(20) NOT NULL, -- 'helpful', 'not_helpful', 'incorrect', 'missing_info'
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_query_log_created_at ON query_analytics_log(created_at);
CREATE INDEX IF NOT EXISTS idx_query_log_intent ON query_analytics_log(query_intent);
CREATE INDEX IF NOT EXISTS idx_query_log_result_count ON query_analytics_log(result_count);
CREATE INDEX IF NOT EXISTS idx_query_log_similarity ON query_analytics_log(top_similarity_score);
CREATE INDEX IF NOT EXISTS idx_query_log_state ON query_analytics_log(state_code);
CREATE INDEX IF NOT EXISTS idx_query_log_agency ON query_analytics_log(agency_id);
CREATE INDEX IF NOT EXISTS idx_query_log_cache ON query_analytics_log(cache_hit);
CREATE INDEX IF NOT EXISTS idx_query_log_latency ON query_analytics_log(total_latency_ms);

CREATE INDEX IF NOT EXISTS idx_query_feedback_log_id ON query_feedback(query_log_id);
CREATE INDEX IF NOT EXISTS idx_query_feedback_type ON query_feedback(feedback_type);

-- Partial index for failed queries (result_count = 0)
CREATE INDEX IF NOT EXISTS idx_query_log_failed ON query_analytics_log(original_query) 
  WHERE result_count = 0;

-- Partial index for low similarity queries
CREATE INDEX IF NOT EXISTS idx_query_log_low_similarity ON query_analytics_log(original_query, top_similarity_score) 
  WHERE top_similarity_score < 0.4 AND result_count > 0;

-- Comment on tables
COMMENT ON TABLE query_analytics_log IS 'Logs all RAG queries for analytics and improvement';
COMMENT ON TABLE query_feedback IS 'User feedback on query results for quality improvement';

-- Add RLS policies (if needed)
ALTER TABLE query_analytics_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_feedback ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to query_analytics_log" 
  ON query_analytics_log FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role has full access to query_feedback" 
  ON query_feedback FOR ALL 
  USING (true) 
  WITH CHECK (true);
