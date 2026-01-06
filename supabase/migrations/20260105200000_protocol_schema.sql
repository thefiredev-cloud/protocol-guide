-- Protocol Guide Schema Migration
-- LA County Fire EMS - Zero Hallucination Implementation
-- NOTE: Drops existing tables to recreate with new schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- Drop existing tables if they exist (cascade to handle dependencies)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS verification_audit CASCADE;
DROP TABLE IF EXISTS protocol_chunks CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS protocols CASCADE;

-- ============================================
-- PROTOCOLS TABLE
-- ============================================
CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id VARCHAR(50) UNIQUE NOT NULL,
  ref_no VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  protocol_type VARCHAR(50) DEFAULT 'Protocol',
  sections JSONB NOT NULL,
  full_text_content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  icon VARCHAR(50) DEFAULT 'medical_services',
  color VARCHAR(30) DEFAULT 'blue',
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  source_last_modified TIMESTAMPTZ,
  source_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by VARCHAR(100),
  last_updated DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_protocols_protocol_id ON protocols(protocol_id);
CREATE INDEX idx_protocols_ref_no ON protocols(ref_no);
CREATE INDEX idx_protocols_category ON protocols(category);
CREATE INDEX idx_protocols_type ON protocols(protocol_type);
CREATE INDEX idx_protocols_hash ON protocols(content_hash);
CREATE INDEX idx_protocols_fts ON protocols USING gin(to_tsvector('english', full_text_content));
CREATE INDEX idx_protocols_title_fts ON protocols USING gin(to_tsvector('english', title));

-- ============================================
-- MEDICATIONS TABLE
-- ============================================
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand_names TEXT[] DEFAULT '{}',
  classification VARCHAR(100),
  mechanism TEXT,
  indications TEXT[] NOT NULL DEFAULT '{}',
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  precautions TEXT[] DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  adult_dosing JSONB NOT NULL DEFAULT '{}',
  pediatric_dosing JSONB DEFAULT '{}',
  routes TEXT[] NOT NULL DEFAULT '{}',
  is_approved_formulary BOOLEAN DEFAULT TRUE,
  is_rsi_drug BOOLEAN DEFAULT FALSE,
  protocol_references TEXT[] DEFAULT '{}',
  special_considerations TEXT,
  content_hash VARCHAR(64) NOT NULL,
  last_updated DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_medication_id ON medications(medication_id);
CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_medications_classification ON medications(classification);
CREATE INDEX idx_medications_approved ON medications(is_approved_formulary);
CREATE INDEX idx_medications_rsi ON medications(is_rsi_drug);
CREATE INDEX idx_medications_fts ON medications USING gin(to_tsvector('english', name));

-- ============================================
-- PROTOCOL CHUNKS TABLE
-- ============================================
CREATE TABLE protocol_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id VARCHAR(50) NOT NULL,
  protocol_ref VARCHAR(50) NOT NULL,
  protocol_title VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  section_type VARCHAR(50),
  section_title VARCHAR(255),
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  token_count INTEGER,
  embedding vector(768),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_chunk UNIQUE (protocol_id, chunk_index)
);

CREATE INDEX idx_chunks_protocol_id ON protocol_chunks(protocol_id);
CREATE INDEX idx_chunks_category ON protocol_chunks(category);
CREATE INDEX idx_chunks_section_type ON protocol_chunks(section_type);
CREATE INDEX idx_chunks_fts ON protocol_chunks USING gin(to_tsvector('english', content));
CREATE INDEX idx_chunks_embedding ON protocol_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================
-- VERIFICATION AUDIT LOG
-- ============================================
CREATE TABLE verification_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID,
  ref_no VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  previous_hash VARCHAR(64),
  new_hash VARCHAR(64),
  differences JSONB,
  severity VARCHAR(20),
  verified_by VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON verification_audit(entity_type, entity_id);
CREATE INDEX idx_audit_ref ON verification_audit(ref_no);
CREATE INDEX idx_audit_action ON verification_audit(action);
CREATE INDEX idx_audit_time ON verification_audit(created_at DESC);

-- ============================================
-- CHAT SESSIONS
-- ============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  retrieved_chunks UUID[] DEFAULT '{}',
  confidence FLOAT,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_time ON chat_messages(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users
CREATE POLICY "protocols_select_authenticated" ON protocols FOR SELECT TO authenticated USING (true);
CREATE POLICY "medications_select_authenticated" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "chunks_select_authenticated" ON protocol_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_select_authenticated" ON verification_audit FOR SELECT TO authenticated USING (true);

-- Chat: users access own data
CREATE POLICY "sessions_select_own" ON chat_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON chat_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update_own" ON chat_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages_select_own" ON chat_messages FOR SELECT TO authenticated
  USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_insert_own" ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protocols_updated_at ON protocols;
DROP TRIGGER IF EXISTS medications_updated_at ON medications;
DROP TRIGGER IF EXISTS chunks_updated_at ON protocol_chunks;

CREATE TRIGGER protocols_updated_at BEFORE UPDATE ON protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chunks_updated_at BEFORE UPDATE ON protocol_chunks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE protocols IS 'LA County EMS protocols (Ref 100-1300)';
COMMENT ON TABLE medications IS 'LA County EMS formulary with clinical essentials';
COMMENT ON TABLE protocol_chunks IS 'Chunked protocol content for RAG embeddings';
COMMENT ON COLUMN medications.is_rsi_drug IS 'CRITICAL: RSI drugs NOT authorized in LA County';
