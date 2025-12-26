-- Facility Diversion and APOT Tracking Schema
-- Reference: LA County EMS Ref 503 (Hospital Diversion), Ref 505 (APOT)

-- =============================================================================
-- DIVERSION STATUS TRACKING
-- =============================================================================

-- Diversion type enum (idempotent)
DO $$ BEGIN
  CREATE TYPE diversion_type AS ENUM (
    'internal_disaster',    -- Complete ED closure
    'saturation',           -- ED at capacity
    'trauma_bypass',        -- Trauma center bypass
    'stemi_bypass',         -- STEMI center bypass
    'stroke_bypass',        -- Stroke center bypass
    'pediatric_bypass',     -- Pediatric ED bypass
    'burn_bypass',          -- Burn center bypass
    'psych_bypass',         -- Psychiatric services bypass
    'none'                  -- Normal operations
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Diversion status for each hospital
CREATE TABLE IF NOT EXISTS facility_diversion_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(10) NOT NULL,
  facility_name TEXT NOT NULL,
  diversion_type diversion_type NOT NULL DEFAULT 'none',
  reason TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_end_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reported_by TEXT,
  region VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for diversion queries
CREATE INDEX idx_diversion_facility ON facility_diversion_status(facility_id);
CREATE INDEX idx_diversion_active ON facility_diversion_status(is_active) WHERE is_active = true;
CREATE INDEX idx_diversion_region ON facility_diversion_status(region);
CREATE INDEX idx_diversion_type ON facility_diversion_status(diversion_type);

-- =============================================================================
-- APOT (AMBULANCE PATIENT OFFLOAD TIME) TRACKING
-- =============================================================================

-- APOT records per transport
CREATE TABLE IF NOT EXISTS apot_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(10) NOT NULL,
  facility_name TEXT NOT NULL,
  unit_id VARCHAR(20),
  arrival_time TIMESTAMPTZ NOT NULL,
  offload_time TIMESTAMPTZ,
  offload_minutes INTEGER,
  exceeded_threshold BOOLEAN DEFAULT false,
  threshold_minutes INTEGER DEFAULT 20,
  delay_reason TEXT,
  patient_acuity VARCHAR(20),
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for APOT queries
CREATE INDEX idx_apot_facility ON apot_records(facility_id);
CREATE INDEX idx_apot_shift ON apot_records(shift_date);
CREATE INDEX idx_apot_exceeded ON apot_records(exceeded_threshold) WHERE exceeded_threshold = true;

-- =============================================================================
-- FACILITY REAL-TIME STATUS
-- =============================================================================

-- Current facility operational status
CREATE TABLE IF NOT EXISTS facility_status (
  facility_id VARCHAR(10) PRIMARY KEY,
  facility_name TEXT NOT NULL,
  region VARCHAR(20) NOT NULL,
  is_operational BOOLEAN NOT NULL DEFAULT true,
  current_diversion_type diversion_type DEFAULT 'none',
  ed_wait_minutes INTEGER,
  available_beds INTEGER,
  icu_beds_available INTEGER,
  trauma_beds_available INTEGER,
  last_apot_minutes INTEGER,
  avg_apot_24h DECIMAL(5,1),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_source VARCHAR(50) DEFAULT 'manual'
);

-- =============================================================================
-- ALTERNATE ROUTING RULES
-- =============================================================================

-- Routing rules when primary hospital is on diversion
CREATE TABLE IF NOT EXISTS alternate_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_facility_id VARCHAR(10) NOT NULL,
  diversion_type diversion_type NOT NULL,
  alternate_facility_id VARCHAR(10) NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  distance_miles DECIMAL(5,2),
  transport_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for routing lookups
CREATE INDEX idx_routing_primary ON alternate_routing_rules(primary_facility_id, diversion_type);
CREATE INDEX idx_routing_active ON alternate_routing_rules(is_active) WHERE is_active = true;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Active diversions view
CREATE OR REPLACE VIEW active_diversions AS
SELECT 
  facility_id,
  facility_name,
  diversion_type,
  reason,
  started_at,
  expected_end_at,
  region,
  EXTRACT(EPOCH FROM (NOW() - started_at))/60 AS minutes_on_diversion
FROM facility_diversion_status
WHERE is_active = true
ORDER BY started_at DESC;

-- APOT summary by facility (last 24 hours)
CREATE OR REPLACE VIEW apot_summary_24h AS
SELECT 
  facility_id,
  facility_name,
  COUNT(*) AS total_transports,
  AVG(offload_minutes) AS avg_offload_minutes,
  MAX(offload_minutes) AS max_offload_minutes,
  SUM(CASE WHEN exceeded_threshold THEN 1 ELSE 0 END) AS exceeded_count,
  ROUND(100.0 * SUM(CASE WHEN exceeded_threshold THEN 1 ELSE 0 END) / COUNT(*), 1) AS exceeded_pct
FROM apot_records
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY facility_id, facility_name
ORDER BY avg_offload_minutes DESC;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Start diversion for a facility
CREATE OR REPLACE FUNCTION start_diversion(
  p_facility_id VARCHAR(10),
  p_facility_name TEXT,
  p_diversion_type diversion_type,
  p_reason TEXT,
  p_expected_hours INTEGER DEFAULT NULL,
  p_region VARCHAR(20) DEFAULT 'Central'
) RETURNS UUID AS $$
DECLARE
  v_diversion_id UUID;
  v_expected_end TIMESTAMPTZ;
BEGIN
  -- End any active diversions first
  UPDATE facility_diversion_status 
  SET is_active = false, ended_at = NOW(), updated_at = NOW()
  WHERE facility_id = p_facility_id AND is_active = true;
  
  -- Calculate expected end if hours provided
  IF p_expected_hours IS NOT NULL THEN
    v_expected_end := NOW() + (p_expected_hours || ' hours')::INTERVAL;
  END IF;
  
  -- Insert new diversion
  INSERT INTO facility_diversion_status (
    facility_id, facility_name, diversion_type, reason, 
    expected_end_at, region
  ) VALUES (
    p_facility_id, p_facility_name, p_diversion_type, p_reason,
    v_expected_end, p_region
  ) RETURNING id INTO v_diversion_id;
  
  -- Update facility status
  INSERT INTO facility_status (facility_id, facility_name, region, current_diversion_type)
  VALUES (p_facility_id, p_facility_name, p_region, p_diversion_type)
  ON CONFLICT (facility_id) DO UPDATE 
  SET current_diversion_type = p_diversion_type, last_updated = NOW();
  
  RETURN v_diversion_id;
END;
$$ LANGUAGE plpgsql;

-- End diversion for a facility
CREATE OR REPLACE FUNCTION end_diversion(p_facility_id VARCHAR(10)) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE facility_diversion_status 
  SET is_active = false, ended_at = NOW(), updated_at = NOW()
  WHERE facility_id = p_facility_id AND is_active = true;
  
  UPDATE facility_status 
  SET current_diversion_type = 'none', last_updated = NOW()
  WHERE facility_id = p_facility_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Record APOT
CREATE OR REPLACE FUNCTION record_apot(
  p_facility_id VARCHAR(10),
  p_facility_name TEXT,
  p_arrival_time TIMESTAMPTZ,
  p_offload_time TIMESTAMPTZ,
  p_unit_id VARCHAR(20) DEFAULT NULL,
  p_patient_acuity VARCHAR(20) DEFAULT NULL,
  p_threshold INTEGER DEFAULT 20
) RETURNS UUID AS $$
DECLARE
  v_apot_id UUID;
  v_minutes INTEGER;
BEGIN
  v_minutes := EXTRACT(EPOCH FROM (p_offload_time - p_arrival_time))/60;
  
  INSERT INTO apot_records (
    facility_id, facility_name, unit_id, arrival_time, offload_time,
    offload_minutes, exceeded_threshold, threshold_minutes, patient_acuity
  ) VALUES (
    p_facility_id, p_facility_name, p_unit_id, p_arrival_time, p_offload_time,
    v_minutes, v_minutes > p_threshold, p_threshold, p_patient_acuity
  ) RETURNING id INTO v_apot_id;
  
  -- Update facility status with latest APOT
  UPDATE facility_status 
  SET last_apot_minutes = v_minutes, last_updated = NOW()
  WHERE facility_id = p_facility_id;
  
  RETURN v_apot_id;
END;
$$ LANGUAGE plpgsql;

-- Get alternate facilities when primary is on diversion
CREATE OR REPLACE FUNCTION get_alternate_facilities(
  p_facility_id VARCHAR(10),
  p_diversion_type diversion_type DEFAULT NULL
) RETURNS TABLE (
  alternate_facility_id VARCHAR(10),
  priority INTEGER,
  distance_miles DECIMAL,
  transport_minutes INTEGER,
  current_status diversion_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.alternate_facility_id,
    r.priority,
    r.distance_miles,
    r.transport_minutes,
    COALESCE(s.current_diversion_type, 'none'::diversion_type) AS current_status
  FROM alternate_routing_rules r
  LEFT JOIN facility_status s ON r.alternate_facility_id = s.facility_id
  WHERE r.primary_facility_id = p_facility_id
    AND r.is_active = true
    AND (p_diversion_type IS NULL OR r.diversion_type = p_diversion_type)
    AND (s.current_diversion_type IS NULL OR s.current_diversion_type = 'none')
  ORDER BY r.priority ASC;
END;
$$ LANGUAGE plpgsql;
