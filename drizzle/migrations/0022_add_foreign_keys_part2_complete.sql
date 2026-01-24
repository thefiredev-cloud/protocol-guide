-- Migration: Add foreign key constraints - Part 2 (Complete remaining relationships)
-- This migration adds foreign keys for counties, agencies, and protocol relationships
-- Generated: 2026-01-23
--
-- PREREQUISITES:
-- - 0021_add_foreign_keys_part1_users.sql completed successfully

-- =============================================================================
-- COUNTY RELATIONSHIPS
-- =============================================================================

-- protocolChunks.countyId → counties.id
-- RESTRICT: Cannot delete county that has protocols
ALTER TABLE `protocolChunks`
ADD CONSTRAINT `fk_protocol_chunks_county`
FOREIGN KEY (`countyId`)
REFERENCES `counties`(`id`)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- queries.countyId → counties.id
-- CASCADE DELETE: When county deleted, delete associated queries
ALTER TABLE `queries`
ADD CONSTRAINT `fk_queries_county`
FOREIGN KEY (`countyId`)
REFERENCES `counties`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- feedback.countyId → counties.id (nullable)
-- SET NULL: When county deleted, preserve feedback but clear county reference
ALTER TABLE `feedback`
ADD CONSTRAINT `fk_feedback_county`
FOREIGN KEY (`countyId`)
REFERENCES `counties`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- userCounties.countyId → counties.id
-- CASCADE DELETE: When county deleted, remove from user's saved counties
ALTER TABLE `user_counties`
ADD CONSTRAINT `fk_user_counties_county`
FOREIGN KEY (`countyId`)
REFERENCES `counties`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- searchHistory.countyId → counties.id (nullable)
-- SET NULL: Preserve search history even if county deleted
ALTER TABLE `search_history`
ADD CONSTRAINT `fk_search_history_county`
FOREIGN KEY (`countyId`)
REFERENCES `counties`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =============================================================================
-- AGENCY RELATIONSHIPS
-- =============================================================================

-- bookmarks.agencyId → agencies.id (nullable)
-- SET NULL: When agency deleted, preserve bookmark but clear agency reference
ALTER TABLE `bookmarks`
ADD CONSTRAINT `fk_bookmarks_agency`
FOREIGN KEY (`agencyId`)
REFERENCES `agencies`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- agencyMembers.agencyId → agencies.id
-- CASCADE DELETE: When agency deleted, remove all memberships
ALTER TABLE `agency_members`
ADD CONSTRAINT `fk_agency_members_agency`
FOREIGN KEY (`agencyId`)
REFERENCES `agencies`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- protocolVersions.agencyId → agencies.id
-- CASCADE DELETE: When agency deleted, delete their protocol versions
ALTER TABLE `protocol_versions`
ADD CONSTRAINT `fk_protocol_versions_agency`
FOREIGN KEY (`agencyId`)
REFERENCES `agencies`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- integrationLogs.internalAgencyId → agencies.id (nullable)
-- SET NULL: Preserve integration logs even if agency deleted
ALTER TABLE `integration_logs`
ADD CONSTRAINT `fk_integration_logs_agency`
FOREIGN KEY (`internalAgencyId`)
REFERENCES `agencies`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- protocol_access_logs.agencyId → agencies.id (nullable)
-- SET NULL: Preserve access logs even if agency deleted
ALTER TABLE `protocol_access_logs`
ADD CONSTRAINT `fk_protocol_access_logs_agency`
FOREIGN KEY (`agencyId`)
REFERENCES `agencies`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- search_analytics.agencyId → agencies.id (nullable)
-- SET NULL: Preserve analytics even if agency deleted
ALTER TABLE `search_analytics`
ADD CONSTRAINT `fk_search_analytics_agency`
FOREIGN KEY (`agencyId`)
REFERENCES `agencies`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =============================================================================
-- PROTOCOL RELATIONSHIPS
-- =============================================================================

-- protocolUploads.versionId → protocol_versions.id
-- CASCADE DELETE: When protocol version deleted, delete associated uploads
ALTER TABLE `protocol_uploads`
ADD CONSTRAINT `fk_protocol_uploads_version`
FOREIGN KEY (`versionId`)
REFERENCES `protocol_versions`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- protocol_access_logs.protocolChunkId → protocolChunks.id
-- CASCADE DELETE: When protocol chunk deleted, delete access logs
ALTER TABLE `protocol_access_logs`
ADD CONSTRAINT `fk_protocol_access_logs_chunk`
FOREIGN KEY (`protocolChunkId`)
REFERENCES `protocolChunks`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify foreign keys were created:
--
-- SHOW CREATE TABLE bookmarks;
-- SHOW CREATE TABLE users;
-- SHOW CREATE TABLE agencies;
--
-- Or list all foreign keys:
-- SELECT
--   TABLE_NAME,
--   COLUMN_NAME,
--   CONSTRAINT_NAME,
--   REFERENCED_TABLE_NAME,
--   REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
--   AND REFERENCED_TABLE_NAME IS NOT NULL
-- ORDER BY TABLE_NAME, COLUMN_NAME;
-- =============================================================================
