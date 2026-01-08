-- Data Audit: Find Non-DHS Protocols
-- Run this BEFORE applying constraints to identify data needing cleanup
--
-- AUTHORIZED SOURCE:
-- https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/

-- ============================================
-- 1. PROTOCOLS WITHOUT DHS SOURCE URL
-- ============================================

SELECT
  protocol_id,
  ref_no,
  title,
  category,
  source_url,
  source_verified,
  created_at
FROM protocols
WHERE source_url IS NULL
   OR source_url NOT LIKE 'https://dhs.lacounty.gov/%'
ORDER BY category, ref_no;

-- ============================================
-- 2. PROTOCOL COUNT BY SOURCE DOMAIN
-- ============================================

SELECT
  CASE
    WHEN source_url IS NULL THEN '[NULL - No source]'
    WHEN source_url LIKE 'https://dhs.lacounty.gov/%' THEN 'LA County DHS (AUTHORIZED)'
    WHEN source_url LIKE 'https://file.lacounty.gov/%' THEN 'LA County Files (AUTHORIZED)'
    WHEN source_url LIKE 'https://%.gov/%' THEN 'Other .gov (UNAUTHORIZED)'
    ELSE 'External/Unknown (UNAUTHORIZED)'
  END AS source_domain,
  COUNT(*) AS protocol_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM protocols
GROUP BY 1
ORDER BY 2 DESC;

-- ============================================
-- 3. CHUNKS WITHOUT VALID SOURCE
-- ============================================

SELECT
  pc.id AS chunk_id,
  pc.protocol_id,
  pc.protocol_title,
  pc.category,
  p.source_url,
  p.source_verified
FROM protocol_chunks pc
LEFT JOIN protocols p ON pc.protocol_id = p.protocol_id
WHERE p.source_url IS NULL
   OR p.source_url NOT LIKE 'https://dhs.lacounty.gov/%'
LIMIT 100;

-- ============================================
-- 4. UNVERIFIED PROTOCOLS (POTENTIAL NON-DHS)
-- ============================================

SELECT
  protocol_id,
  ref_no,
  title,
  source_url,
  source_verified,
  verified_at,
  verified_by
FROM protocols
WHERE source_verified = FALSE
   OR source_verified IS NULL
ORDER BY ref_no;

-- ============================================
-- 5. SUMMARY STATISTICS
-- ============================================

SELECT
  'Total Protocols' AS metric,
  COUNT(*)::TEXT AS value
FROM protocols
UNION ALL
SELECT
  'Protocols with NULL source_url',
  COUNT(*)::TEXT
FROM protocols WHERE source_url IS NULL
UNION ALL
SELECT
  'Protocols with DHS source_url',
  COUNT(*)::TEXT
FROM protocols WHERE source_url LIKE 'https://dhs.lacounty.gov/%'
UNION ALL
SELECT
  'Protocols with non-DHS source_url',
  COUNT(*)::TEXT
FROM protocols WHERE source_url IS NOT NULL AND source_url NOT LIKE 'https://dhs.lacounty.gov/%'
UNION ALL
SELECT
  'Total Protocol Chunks',
  COUNT(*)::TEXT
FROM protocol_chunks
UNION ALL
SELECT
  'Verified Protocols',
  COUNT(*)::TEXT
FROM protocols WHERE source_verified = TRUE
UNION ALL
SELECT
  'Unverified Protocols',
  COUNT(*)::TEXT
FROM protocols WHERE source_verified = FALSE OR source_verified IS NULL;

-- ============================================
-- 6. SOURCE VIOLATIONS LOG (if table exists)
-- ============================================

SELECT
  protocol_id,
  protocol_ref,
  detected_source_url,
  violation_context,
  detected_at,
  resolved_at
FROM source_violations
WHERE resolved_at IS NULL
ORDER BY detected_at DESC
LIMIT 50;

-- ============================================
-- 7. PROTOCOLS BY CATEGORY WITH SOURCE STATUS
-- ============================================

SELECT
  category,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE source_verified = TRUE) AS verified,
  COUNT(*) FILTER (WHERE source_url LIKE 'https://dhs.lacounty.gov/%') AS dhs_sourced,
  COUNT(*) FILTER (WHERE source_url IS NULL) AS missing_source
FROM protocols
GROUP BY category
ORDER BY total DESC;
