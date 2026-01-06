-- Cleanup duplicate pharmacology entries
-- Issue: Both MED-xxx (from pharmacology/medications.ts) and 1317.x (from series-1300.ts)
-- entries exist for the same medications
-- Solution: Keep 1317.x (official LA County reference numbers), remove MED-xxx duplicates

-- First, log what will be deleted
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete MED-xxx entries that have duplicate 1317.x versions
  DELETE FROM protocols
  WHERE category = 'Pharmacology'
    AND protocol_id LIKE 'MED-%'
    AND LOWER(title) IN (
      SELECT LOWER(title) FROM protocols
      WHERE category = 'Pharmacology'
      GROUP BY LOWER(title)
      HAVING COUNT(*) > 1
    );

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % duplicate pharmacology entries', deleted_count;
END $$;

-- Also clean up protocol_chunks for removed protocols
DELETE FROM protocol_chunks
WHERE protocol_id LIKE 'MED-%'
  AND protocol_id NOT IN (SELECT protocol_id FROM protocols);
