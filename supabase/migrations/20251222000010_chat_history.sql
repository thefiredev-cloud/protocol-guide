-- =============================================================================
-- Chat History Tables for Medic-Bot
-- Purpose: Persist chat conversations with HIPAA-compliant storage
-- Retention: 6 years (aligned with audit_logs)
-- Dependencies: 001_audit_logs.sql (user_role enum), 002_users_sessions.sql (users table)
-- =============================================================================

-- =============================================================================
-- CHAT_SESSIONS TABLE
-- =============================================================================
-- Represents a conversation context (not to be confused with auth sessions)

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner identification (nullable for anonymous/guest users)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Anonymous device identifier for non-authenticated users
  device_fingerprint TEXT,

  -- Session metadata
  title TEXT, -- Auto-generated from first user message or explicit title
  provider_level TEXT CHECK (provider_level IN ('EMT', 'Paramedic')) DEFAULT 'Paramedic',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete for recovery
  deleted_at TIMESTAMPTZ,

  -- Metadata (protocols referenced, themes, etc. - NO PHI)
  metadata JSONB DEFAULT '{}',

  -- Constraints
  CONSTRAINT has_owner CHECK (user_id IS NOT NULL OR device_fingerprint IS NOT NULL)
);

-- Indexes for efficient retrieval
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_device ON chat_sessions(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(user_id, deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE chat_sessions IS 'Chat conversation containers. 6-year retention.';

-- =============================================================================
-- CHAT_MESSAGES TABLE
-- =============================================================================
-- Individual messages within a chat session

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent session
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Content sanitization flag (PHI must be sanitized before storage)
  is_sanitized BOOLEAN DEFAULT FALSE NOT NULL,

  -- AI response metadata (NO PHI - only protocol references, not patient data)
  citations JSONB DEFAULT '[]',
  protocols_referenced TEXT[] DEFAULT '{}',

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Response metrics (for performance tracking)
  response_time_ms INTEGER,

  -- Token usage (for cost tracking)
  tokens_used INTEGER,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for message retrieval
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_active ON chat_messages(session_id, deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE chat_messages IS 'Chat messages with PHI sanitization. 6-year retention.';

-- =============================================================================
-- UPDATE TRIGGERS
-- =============================================================================

-- Reuse existing update_updated_at_column function from earlier migrations
CREATE TRIGGER trigger_chat_sessions_updated
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update session's last_message_at when new message added
CREATE OR REPLACE FUNCTION update_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_message();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions FOR SELECT
  USING (
    user_id = auth.uid()
    OR device_fingerprint = current_setting('app.device_fingerprint', true)
  );

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Messages inherit session permissions
CREATE POLICY "Users can read messages in own sessions"
  ON chat_messages FOR SELECT
  USING (session_id IN (
    SELECT id FROM chat_sessions
    WHERE user_id = auth.uid()
    OR device_fingerprint = current_setting('app.device_fingerprint', true)
  ));

CREATE POLICY "Users can insert messages in own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (session_id IN (
    SELECT id FROM chat_sessions
    WHERE user_id = auth.uid()
    OR device_fingerprint = current_setting('app.device_fingerprint', true)
  ));

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get user's chat history (paginated)
CREATE OR REPLACE FUNCTION get_user_chat_history(
  p_user_id UUID DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  session_id UUID,
  title TEXT,
  message_count BIGINT,
  created_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  preview TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.title,
    COUNT(cm.id) as message_count,
    cs.created_at,
    cs.last_message_at,
    (SELECT content FROM chat_messages
     WHERE session_id = cs.id AND role = 'user' AND deleted_at IS NULL
     ORDER BY created_at ASC LIMIT 1) as preview
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cm.session_id = cs.id AND cm.deleted_at IS NULL
  WHERE cs.deleted_at IS NULL
    AND (p_user_id IS NULL OR cs.user_id = p_user_id)
    AND (p_device_fingerprint IS NULL OR cs.device_fingerprint = p_device_fingerprint)
  GROUP BY cs.id
  ORDER BY cs.last_message_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get full session with messages
CREATE OR REPLACE FUNCTION get_chat_session_with_messages(
  p_session_id UUID
)
RETURNS TABLE (
  session_id UUID,
  session_title TEXT,
  session_created_at TIMESTAMPTZ,
  message_id UUID,
  role TEXT,
  content TEXT,
  citations JSONB,
  message_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.title,
    cs.created_at,
    cm.id,
    cm.role,
    cm.content,
    cm.citations,
    cm.created_at
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cm.session_id = cs.id AND cm.deleted_at IS NULL
  WHERE cs.id = p_session_id AND cs.deleted_at IS NULL
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old sessions (6+ years - HIPAA retention)
CREATE OR REPLACE FUNCTION cleanup_old_chat_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete sessions older than 6 years
  DELETE FROM chat_sessions
  WHERE created_at < NOW() - INTERVAL '6 years';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TYPE EXPORTS FOR APPLICATION
-- =============================================================================

COMMENT ON FUNCTION get_user_chat_history IS 'Get paginated chat history for a user or device';
COMMENT ON FUNCTION get_chat_session_with_messages IS 'Get full session with all messages';
COMMENT ON FUNCTION cleanup_old_chat_history IS 'Delete sessions older than 6 years (HIPAA)';
