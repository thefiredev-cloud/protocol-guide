-- Simple protocol foundation migration (without dependencies)

CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tp_code VARCHAR(20) NOT NULL,
  tp_name TEXT NOT NULL,
  full_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS protocol_chunks (
  id TEXT PRIMARY KEY,
  protocol_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_protocols_tp_code ON protocols(tp_code);
CREATE INDEX idx_chunks_content ON protocol_chunks USING GIN(to_tsvector('english', content));

