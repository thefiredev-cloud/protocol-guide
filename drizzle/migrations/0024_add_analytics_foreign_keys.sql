-- Migration: Add foreign keys for analytics protocol references
-- These use SET NULL because we want to preserve analytics even if protocols are deleted
-- Generated: 2026-01-23

-- =============================================================================
-- ANALYTICS FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Add foreign key for top result protocol reference
ALTER TABLE `search_analytics`
ADD CONSTRAINT `fk_search_analytics_top_protocol`
FOREIGN KEY (`topResultProtocolId`)
REFERENCES `protocolChunks`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add foreign key for selected protocol reference
ALTER TABLE `search_analytics`
ADD CONSTRAINT `fk_search_analytics_selected_protocol`
FOREIGN KEY (`selectedProtocolId`)
REFERENCES `protocolChunks`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;
