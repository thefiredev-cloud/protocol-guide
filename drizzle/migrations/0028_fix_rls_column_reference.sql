-- ============================================================================
-- Migration 0028: Fix RLS Column Reference
-- ============================================================================
-- Description: Fix RLS helper functions to use correct column name (auth_id)
-- The schema uses 'auth_id' but migration 0027 referenced 'supabase_id'
-- Date: 2026-01-26
-- Priority: CRITICAL - Auth is broken without this fix
-- ============================================================================

-- Drop and recreate helper functions with correct column name

-- Get current user's internal ID from Supabase auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
    SELECT id FROM manus_users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM manus_users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is member of agency
CREATE OR REPLACE FUNCTION is_agency_member(agency_id_param INTEGER)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM agency_members am
        JOIN manus_users u ON u.id = am.user_id
        WHERE u.auth_id = auth.uid()
        AND am.agency_id = agency_id_param
        AND am.status = 'active'
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is agency admin or owner
CREATE OR REPLACE FUNCTION is_agency_admin(agency_id_param INTEGER)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM agency_members am
        JOIN manus_users u ON u.id = am.user_id
        WHERE u.auth_id = auth.uid()
        AND am.agency_id = agency_id_param
        AND am.role IN ('admin', 'owner')
        AND am.status = 'active'
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is service role (backend operations)
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
