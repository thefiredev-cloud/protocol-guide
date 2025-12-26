-- MCI Resources Schema
-- Reference: LA County EMS Ref 519 series (MCI Policies)

-- =============================================================================
-- MCI EVENT TRACKING
-- =============================================================================

-- MCI level enum per Ref 519 (idempotent)
DO $$ BEGIN
  CREATE TYPE mci_level AS ENUM (
    'level_1',   -- 5-10 patients
    'level_2',   -- 11-25 patients
    'level_3',   -- 26-100 patients
    'level_4'    -- 100+ patients (catastrophic)
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Triage category per START/JumpSTART (idempotent)
DO $$ BEGIN
  CREATE TYPE triage_category AS ENUM (
    'immediate',   -- Red - life threatening, immediate care needed
    'delayed',     -- Yellow - serious but can wait
    'minor',       -- Green - walking wounded
    'deceased'     -- Black - dead or expectant
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- MCI events table
CREATE TABLE IF NOT EXISTS mci_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number VARCHAR(50),
  incident_type VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  region VARCHAR(20) NOT NULL,
  mci_level mci_level NOT NULL,
  declared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_patients INTEGER DEFAULT 0,
  immediate_count INTEGER DEFAULT 0,
  delayed_count INTEGER DEFAULT 0,
  minor_count INTEGER DEFAULT 0,
  deceased_count INTEGER DEFAULT 0,
  transport_count INTEGER DEFAULT 0,
  incident_commander TEXT,
  medical_group_supervisor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for MCI queries
CREATE INDEX idx_mci_active ON mci_events(is_active) WHERE is_active = true;
CREATE INDEX idx_mci_region ON mci_events(region);
CREATE INDEX idx_mci_level ON mci_events(mci_level);

-- =============================================================================
-- REGIONAL BED AVAILABILITY
-- =============================================================================

-- Hospital bed availability during MCI
CREATE TABLE IF NOT EXISTS mci_bed_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mci_event_id UUID REFERENCES mci_events(id),
  facility_id VARCHAR(10) NOT NULL,
  facility_name TEXT NOT NULL,
  region VARCHAR(20) NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_beds INTEGER,
  available_beds INTEGER DEFAULT 0,
  icu_total INTEGER,
  icu_available INTEGER DEFAULT 0,
  trauma_total INTEGER,
  trauma_available INTEGER DEFAULT 0,
  peds_total INTEGER,
  peds_available INTEGER DEFAULT 0,
  burn_total INTEGER,
  burn_available INTEGER DEFAULT 0,
  can_accept_immediate BOOLEAN DEFAULT true,
  can_accept_delayed BOOLEAN DEFAULT true,
  diversion_status VARCHAR(50) DEFAULT 'accepting',
  reporter_name TEXT,
  notes TEXT
);

-- Indexes for bed availability
CREATE INDEX idx_bed_mci ON mci_bed_availability(mci_event_id);
CREATE INDEX idx_bed_facility ON mci_bed_availability(facility_id);
CREATE INDEX idx_bed_region ON mci_bed_availability(region);

-- =============================================================================
-- MCI PATIENT TRACKING
-- =============================================================================

-- Individual patient tracking during MCI
CREATE TABLE IF NOT EXISTS mci_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mci_event_id UUID REFERENCES mci_events(id) NOT NULL,
  triage_tag_number VARCHAR(20),
  triage_category triage_category NOT NULL,
  initial_category triage_category,
  age_group VARCHAR(20), -- adult, pediatric, geriatric
  chief_complaint TEXT,
  injuries TEXT,
  assigned_transport_unit VARCHAR(20),
  destination_facility_id VARCHAR(10),
  destination_facility_name TEXT,
  triaged_at TIMESTAMPTZ DEFAULT NOW(),
  transported_at TIMESTAMPTZ,
  transport_priority INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for patient tracking
CREATE INDEX idx_mci_patient_event ON mci_patients(mci_event_id);
CREATE INDEX idx_mci_patient_category ON mci_patients(triage_category);
CREATE INDEX idx_mci_patient_dest ON mci_patients(destination_facility_id);

-- =============================================================================
-- RESOURCE TRACKING
-- =============================================================================

-- Resources assigned to MCI
CREATE TABLE IF NOT EXISTS mci_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mci_event_id UUID REFERENCES mci_events(id) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- ambulance, engine, rescue, helicopter, etc.
  unit_id VARCHAR(20) NOT NULL,
  station VARCHAR(20),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  arrived_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ,
  assignment TEXT, -- triage, treatment, transport, staging
  transports_completed INTEGER DEFAULT 0,
  notes TEXT
);

-- Index for resource tracking
CREATE INDEX idx_mci_resource_event ON mci_resources(mci_event_id);
CREATE INDEX idx_mci_resource_unit ON mci_resources(unit_id);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Active MCI summary
CREATE OR REPLACE VIEW active_mci_summary AS
SELECT 
  id,
  incident_number,
  incident_type,
  location,
  region,
  mci_level,
  declared_at,
  EXTRACT(EPOCH FROM (NOW() - declared_at))/60 AS minutes_active,
  total_patients,
  immediate_count,
  delayed_count,
  minor_count,
  deceased_count,
  transport_count,
  incident_commander
FROM mci_events
WHERE is_active = true
ORDER BY declared_at DESC;

-- Regional bed summary during MCI
CREATE OR REPLACE VIEW mci_regional_beds AS
SELECT 
  mci_event_id,
  region,
  SUM(available_beds) AS total_available,
  SUM(icu_available) AS total_icu_available,
  SUM(trauma_available) AS total_trauma_available,
  SUM(peds_available) AS total_peds_available,
  COUNT(*) FILTER (WHERE can_accept_immediate) AS facilities_accepting_immediate,
  COUNT(*) FILTER (WHERE can_accept_delayed) AS facilities_accepting_delayed
FROM mci_bed_availability
WHERE reported_at > NOW() - INTERVAL '2 hours'
GROUP BY mci_event_id, region;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Declare MCI event
CREATE OR REPLACE FUNCTION declare_mci(
  p_incident_type VARCHAR(100),
  p_location TEXT,
  p_region VARCHAR(20),
  p_mci_level mci_level,
  p_incident_number VARCHAR(50) DEFAULT NULL,
  p_incident_commander TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_mci_id UUID;
BEGIN
  INSERT INTO mci_events (
    incident_number, incident_type, location, region, 
    mci_level, incident_commander
  ) VALUES (
    COALESCE(p_incident_number, 'MCI-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MI')),
    p_incident_type, p_location, p_region, 
    p_mci_level, p_incident_commander
  ) RETURNING id INTO v_mci_id;
  
  RETURN v_mci_id;
END;
$$ LANGUAGE plpgsql;

-- Update MCI patient counts
CREATE OR REPLACE FUNCTION update_mci_counts(p_mci_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE mci_events SET
    total_patients = (SELECT COUNT(*) FROM mci_patients WHERE mci_event_id = p_mci_id),
    immediate_count = (SELECT COUNT(*) FROM mci_patients WHERE mci_event_id = p_mci_id AND triage_category = 'immediate'),
    delayed_count = (SELECT COUNT(*) FROM mci_patients WHERE mci_event_id = p_mci_id AND triage_category = 'delayed'),
    minor_count = (SELECT COUNT(*) FROM mci_patients WHERE mci_event_id = p_mci_id AND triage_category = 'minor'),
    deceased_count = (SELECT COUNT(*) FROM mci_patients WHERE mci_event_id = p_mci_id AND triage_category = 'deceased'),
    transport_count = (SELECT COUNT(*) FROM mci_patients WHERE mci_event_id = p_mci_id AND transported_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = p_mci_id;
END;
$$ LANGUAGE plpgsql;

-- Add triaged patient
CREATE OR REPLACE FUNCTION add_mci_patient(
  p_mci_id UUID,
  p_triage_category triage_category,
  p_tag_number VARCHAR(20) DEFAULT NULL,
  p_age_group VARCHAR(20) DEFAULT 'adult',
  p_chief_complaint TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  INSERT INTO mci_patients (
    mci_event_id, triage_tag_number, triage_category, 
    initial_category, age_group, chief_complaint
  ) VALUES (
    p_mci_id, p_tag_number, p_triage_category,
    p_triage_category, p_age_group, p_chief_complaint
  ) RETURNING id INTO v_patient_id;
  
  -- Update counts
  PERFORM update_mci_counts(p_mci_id);
  
  RETURN v_patient_id;
END;
$$ LANGUAGE plpgsql;

-- Assign patient transport
CREATE OR REPLACE FUNCTION assign_patient_transport(
  p_patient_id UUID,
  p_unit_id VARCHAR(20),
  p_facility_id VARCHAR(10),
  p_facility_name TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE mci_patients SET
    assigned_transport_unit = p_unit_id,
    destination_facility_id = p_facility_id,
    destination_facility_name = p_facility_name,
    transported_at = NOW(),
    updated_at = NOW()
  WHERE id = p_patient_id;
  
  -- Update MCI counts
  UPDATE mci_events SET
    transport_count = (
      SELECT COUNT(*) FROM mci_patients 
      WHERE mci_event_id = (SELECT mci_event_id FROM mci_patients WHERE id = p_patient_id)
      AND transported_at IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = (SELECT mci_event_id FROM mci_patients WHERE id = p_patient_id);
END;
$$ LANGUAGE plpgsql;

-- Report bed availability
CREATE OR REPLACE FUNCTION report_bed_availability(
  p_mci_id UUID,
  p_facility_id VARCHAR(10),
  p_facility_name TEXT,
  p_region VARCHAR(20),
  p_available_beds INTEGER,
  p_icu_available INTEGER DEFAULT 0,
  p_trauma_available INTEGER DEFAULT 0,
  p_can_accept_immediate BOOLEAN DEFAULT true,
  p_can_accept_delayed BOOLEAN DEFAULT true
) RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
BEGIN
  INSERT INTO mci_bed_availability (
    mci_event_id, facility_id, facility_name, region,
    available_beds, icu_available, trauma_available,
    can_accept_immediate, can_accept_delayed
  ) VALUES (
    p_mci_id, p_facility_id, p_facility_name, p_region,
    p_available_beds, p_icu_available, p_trauma_available,
    p_can_accept_immediate, p_can_accept_delayed
  ) RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- Resolve MCI
CREATE OR REPLACE FUNCTION resolve_mci(p_mci_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE mci_events SET
    is_active = false,
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_mci_id;
END;
$$ LANGUAGE plpgsql;
