-- Audit logs table for HIPAA compliance
-- Applied: 2026-01-06

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- RLS: Users can only see their own audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can insert their own logs
CREATE POLICY "users_insert_own_logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
