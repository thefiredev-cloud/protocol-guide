-- Migration: Add unique constraints to prevent duplicate records
-- Generated: 2026-01-23

-- =============================================================================
-- UNIQUE CONSTRAINTS
-- =============================================================================

-- Prevent duplicate OAuth providers per user
-- A user should only have one record per auth provider (google, github, etc.)
ALTER TABLE `user_auth_providers`
ADD CONSTRAINT `unique_user_provider`
UNIQUE KEY (`userId`, `provider`);

-- Prevent duplicate agency memberships
-- A user should only be a member of an agency once
ALTER TABLE `agency_members`
ADD CONSTRAINT `unique_agency_user`
UNIQUE KEY (`agencyId`, `userId`);

-- Make stripe event ID truly unique (currently just indexed)
-- Prevents duplicate webhook processing
ALTER TABLE `stripe_webhook_events`
ADD CONSTRAINT `unique_stripe_event`
UNIQUE KEY (`eventId`);

-- Prevent duplicate agency slugs
-- Agency slugs must be globally unique for routing
ALTER TABLE `agencies`
ADD CONSTRAINT `unique_agency_slug`
UNIQUE KEY (`slug`);

-- Make users.openId truly unique (currently just indexed)
-- OpenID should be globally unique across all auth methods
ALTER TABLE `users`
DROP INDEX `users_openId_unique`,
ADD CONSTRAINT `unique_user_openid`
UNIQUE KEY (`openId`);

-- Make users.supabaseId truly unique (currently just indexed)
-- Supabase ID should be globally unique
ALTER TABLE `users`
DROP INDEX `users_supabaseId_unique`,
ADD CONSTRAINT `unique_user_supabase`
UNIQUE KEY (`supabaseId`);

-- =============================================================================
-- NOTES
-- =============================================================================
-- These constraints prevent data duplication at the database level
-- Applications can still attempt to create duplicates, but DB will reject them
-- This is critical for data integrity and proper foreign key relationships
-- =============================================================================
