-- User feedback table for AI response quality tracking
-- Applied: 2026-01-06

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  message_id TEXT,
  rating TEXT CHECK (rating IN ('positive', 'negative')),
  issue_type TEXT CHECK (issue_type IN ('incorrect_info', 'missing_info', 'outdated', 'unclear', 'other') OR issue_type IS NULL),
  feedback_text TEXT,
  query TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_time ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_issue ON user_feedback(issue_type) WHERE issue_type IS NOT NULL;

-- RLS: Users can only see and insert their own feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_feedback" ON user_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_feedback" ON user_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT ON user_feedback TO authenticated;
