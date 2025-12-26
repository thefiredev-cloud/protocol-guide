-- Versioned Reference Documents Schema
-- Tracks LA County EMS Reference documents with version history

-- =============================================================================
-- REFERENCE DOCUMENTS
-- =============================================================================

-- Reference document categories (idempotent)
DO $$ BEGIN
  CREATE TYPE ref_category AS ENUM (
    'destination',      -- 500 series (Destination Policies)
    'treatment',        -- 1200 series (Treatment Protocols)
    'mcg',              -- 1300 series (Medication Cross-Reference)
    'operational',      -- 800 series (Operational Policies)
    'education',        -- 900 series (Education/Training)
    'administrative'    -- 100-400 series
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Reference document status (idempotent)
DO $$ BEGIN
  CREATE TYPE ref_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'effective',
    'superseded',
    'retired'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Main reference documents table
CREATE TABLE IF NOT EXISTS reference_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_number VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  category ref_category NOT NULL,
  status ref_status NOT NULL DEFAULT 'effective',
  version INTEGER NOT NULL DEFAULT 1,
  effective_date DATE NOT NULL,
  supersedes_ref VARCHAR(20),
  superseded_by_ref VARCHAR(20),
  revision_date DATE,
  expiration_date DATE,
  summary TEXT,
  full_text TEXT,
  keywords TEXT[],
  related_refs TEXT[],
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint on ref_number + version
CREATE UNIQUE INDEX idx_ref_number_version ON reference_documents(ref_number, version);
CREATE INDEX idx_ref_category ON reference_documents(category);
CREATE INDEX idx_ref_status ON reference_documents(status);
CREATE INDEX idx_ref_current ON reference_documents(is_current) WHERE is_current = true;
CREATE INDEX idx_ref_effective ON reference_documents(effective_date);

-- =============================================================================
-- REFERENCE CHANGE TRACKING
-- =============================================================================

-- Changes between reference versions
CREATE TABLE IF NOT EXISTS reference_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id UUID REFERENCES reference_documents(id) NOT NULL,
  ref_number VARCHAR(20) NOT NULL,
  from_version INTEGER NOT NULL,
  to_version INTEGER NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- addition, modification, removal, clarification
  section TEXT,
  description TEXT NOT NULL,
  clinical_impact VARCHAR(20), -- high, medium, low, none
  requires_training BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for change lookups
CREATE INDEX idx_changes_ref ON reference_changes(ref_number);
CREATE INDEX idx_changes_impact ON reference_changes(clinical_impact);

-- =============================================================================
-- TREATMENT PROTOCOL SPECIFICS
-- =============================================================================

-- Treatment protocols (1200 series) with structured data
CREATE TABLE IF NOT EXISTS treatment_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id UUID REFERENCES reference_documents(id),
  tp_code VARCHAR(20) NOT NULL,
  tp_name TEXT NOT NULL,
  category VARCHAR(50),
  version INTEGER NOT NULL DEFAULT 1,
  effective_date DATE NOT NULL,
  chief_complaints TEXT[],
  provider_impressions TEXT[],
  contraindications TEXT[],
  warnings TEXT[],
  base_contact_required BOOLEAN DEFAULT false,
  base_contact_criteria TEXT,
  transport_destinations JSONB,
  positioning TEXT,
  monitoring TEXT[],
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint
CREATE UNIQUE INDEX idx_tp_code_version ON treatment_protocols(tp_code, version);
CREATE INDEX idx_tp_current ON treatment_protocols(is_current) WHERE is_current = true;
CREATE INDEX idx_tp_category ON treatment_protocols(category);

-- =============================================================================
-- MCG (MEDICATION CROSS-REFERENCE) SPECIFICS
-- =============================================================================

-- Medication guidelines (1300 series)
CREATE TABLE IF NOT EXISTS mcg_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id UUID REFERENCES reference_documents(id),
  mcg_number VARCHAR(20) NOT NULL,
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  medication_class TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  effective_date DATE NOT NULL,
  adult_dose JSONB,
  pediatric_dose JSONB,
  neonatal_dose JSONB,
  routes TEXT[],
  contraindications TEXT[],
  precautions TEXT[],
  adverse_effects TEXT[],
  drug_interactions TEXT[],
  special_considerations TEXT,
  calculation_formula TEXT,
  concentration TEXT,
  max_dose TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint
CREATE UNIQUE INDEX idx_mcg_number_version ON mcg_entries(mcg_number, version);
CREATE INDEX idx_mcg_current ON mcg_entries(is_current) WHERE is_current = true;
CREATE INDEX idx_mcg_medication ON mcg_entries(medication_name);

-- =============================================================================
-- FACILITY SYNC TRACKING
-- =============================================================================

-- Track facility data synchronization with Supabase
CREATE TABLE IF NOT EXISTS facility_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL, -- full, incremental, hospitals, puccs, etc.
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_synced INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_removed INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress',
  error_message TEXT,
  source_ref VARCHAR(20), -- Reference document number if applicable
  source_date DATE
);

-- Index for sync queries
CREATE INDEX idx_sync_type ON facility_sync_log(sync_type);
CREATE INDEX idx_sync_status ON facility_sync_log(status);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Current references view
CREATE OR REPLACE VIEW current_references AS
SELECT 
  id,
  ref_number,
  title,
  category,
  version,
  effective_date,
  revision_date,
  summary,
  keywords,
  related_refs
FROM reference_documents
WHERE is_current = true AND status = 'effective'
ORDER BY ref_number;

-- Recent changes view
CREATE OR REPLACE VIEW recent_reference_changes AS
SELECT 
  c.ref_number,
  r.title,
  c.from_version,
  c.to_version,
  c.change_type,
  c.section,
  c.description,
  c.clinical_impact,
  c.requires_training,
  c.created_at
FROM reference_changes c
JOIN reference_documents r ON c.ref_id = r.id
WHERE c.created_at > NOW() - INTERVAL '90 days'
ORDER BY c.created_at DESC;

-- High impact changes
CREATE OR REPLACE VIEW high_impact_changes AS
SELECT 
  c.ref_number,
  r.title,
  c.from_version,
  c.to_version,
  c.description,
  c.section,
  c.requires_training,
  c.created_at
FROM reference_changes c
JOIN reference_documents r ON c.ref_id = r.id
WHERE c.clinical_impact = 'high'
ORDER BY c.created_at DESC;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Add new reference version
CREATE OR REPLACE FUNCTION add_reference_version(
  p_ref_number VARCHAR(20),
  p_title TEXT,
  p_category ref_category,
  p_effective_date DATE,
  p_full_text TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_keywords TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_ref_id UUID;
  v_new_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
  FROM reference_documents WHERE ref_number = p_ref_number;
  
  -- Mark previous version as superseded
  UPDATE reference_documents 
  SET is_current = false, 
      status = 'superseded',
      superseded_by_ref = p_ref_number || ' v' || v_new_version,
      updated_at = NOW()
  WHERE ref_number = p_ref_number AND is_current = true;
  
  -- Insert new version
  INSERT INTO reference_documents (
    ref_number, title, category, version, effective_date,
    full_text, summary, keywords,
    supersedes_ref
  ) VALUES (
    p_ref_number, p_title, p_category, v_new_version, p_effective_date,
    p_full_text, p_summary, p_keywords,
    CASE WHEN v_new_version > 1 THEN p_ref_number || ' v' || (v_new_version - 1) ELSE NULL END
  ) RETURNING id INTO v_ref_id;
  
  RETURN v_ref_id;
END;
$$ LANGUAGE plpgsql;

-- Record reference change
CREATE OR REPLACE FUNCTION record_reference_change(
  p_ref_id UUID,
  p_from_version INTEGER,
  p_to_version INTEGER,
  p_change_type VARCHAR(50),
  p_description TEXT,
  p_section TEXT DEFAULT NULL,
  p_clinical_impact VARCHAR(20) DEFAULT 'low',
  p_requires_training BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_change_id UUID;
  v_ref_number VARCHAR(20);
BEGIN
  SELECT ref_number INTO v_ref_number FROM reference_documents WHERE id = p_ref_id;
  
  INSERT INTO reference_changes (
    ref_id, ref_number, from_version, to_version,
    change_type, section, description, clinical_impact, requires_training
  ) VALUES (
    p_ref_id, v_ref_number, p_from_version, p_to_version,
    p_change_type, p_section, p_description, p_clinical_impact, p_requires_training
  ) RETURNING id INTO v_change_id;
  
  RETURN v_change_id;
END;
$$ LANGUAGE plpgsql;

-- Get reference history
CREATE OR REPLACE FUNCTION get_reference_history(p_ref_number VARCHAR(20))
RETURNS TABLE (
  version INTEGER,
  status ref_status,
  effective_date DATE,
  revision_date DATE,
  summary TEXT,
  is_current BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.version,
    r.status,
    r.effective_date,
    r.revision_date,
    r.summary,
    r.is_current
  FROM reference_documents r
  WHERE r.ref_number = p_ref_number
  ORDER BY r.version DESC;
END;
$$ LANGUAGE plpgsql;

-- Get changes between versions
CREATE OR REPLACE FUNCTION get_version_changes(
  p_ref_number VARCHAR(20),
  p_from_version INTEGER DEFAULT NULL,
  p_to_version INTEGER DEFAULT NULL
) RETURNS TABLE (
  change_type VARCHAR(50),
  section TEXT,
  description TEXT,
  clinical_impact VARCHAR(20),
  requires_training BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.change_type,
    c.section,
    c.description,
    c.clinical_impact,
    c.requires_training
  FROM reference_changes c
  WHERE c.ref_number = p_ref_number
    AND (p_from_version IS NULL OR c.from_version >= p_from_version)
    AND (p_to_version IS NULL OR c.to_version <= p_to_version)
  ORDER BY c.to_version DESC, c.created_at DESC;
END;
$$ LANGUAGE plpgsql;
