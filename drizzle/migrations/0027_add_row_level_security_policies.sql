-- ============================================================================
-- Migration 0027: Comprehensive Row Level Security (RLS) Policies
-- ============================================================================
-- Description: Implements HIPAA-compliant RLS policies for all tables
-- Date: 2026-01-23
-- Priority: CRITICAL - Security and HIPAA compliance
--
-- SECURITY PRINCIPLES:
-- 1. User Isolation: Users can only access their own data
-- 2. Agency Scoping: Agency members access agency data per role
-- 3. Admin Elevation: Admins have elevated access where needed
-- 4. Service Role: Backend has full access for operations
-- 5. Public Safety: Public protocols remain accessible
-- 6. HIPAA Compliance: No unauthorized PHI access
-- ============================================================================


-- ============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Get current user's internal ID from Supabase auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
    SELECT id FROM users WHERE supabase_id = auth.uid()::text LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE supabase_id = auth.uid()::text
        AND role = 'admin'
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is member of agency
CREATE OR REPLACE FUNCTION is_agency_member(agency_id_param INTEGER)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM agency_members am
        JOIN users u ON u.id = am.user_id
        WHERE u.supabase_id = auth.uid()::text
        AND am.agency_id = agency_id_param
        AND am.status = 'active'
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is agency admin or owner
CREATE OR REPLACE FUNCTION is_agency_admin(agency_id_param INTEGER)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM agency_members am
        JOIN users u ON u.id = am.user_id
        WHERE u.supabase_id = auth.uid()::text
        AND am.agency_id = agency_id_param
        AND am.status = 'active'
        AND am.role IN ('owner', 'admin')
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_current_user_id() IS 'Maps Supabase auth.uid() to internal user ID';
COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';
COMMENT ON FUNCTION is_agency_member(INTEGER) IS 'Check if user is active member of agency';
COMMENT ON FUNCTION is_agency_admin(INTEGER) IS 'Check if user is admin/owner of agency';


-- ============================================================================
-- TABLE: users
-- POLICIES: User isolation, self-read/update, admin read-all
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_select_own"
    ON users FOR SELECT
    TO authenticated
    USING (supabase_id = auth.uid()::text);

-- Users can update their own non-critical fields
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    TO authenticated
    USING (supabase_id = auth.uid()::text)
    WITH CHECK (
        supabase_id = auth.uid()::text
        -- Prevent users from elevating their own role
        AND role = (SELECT role FROM users WHERE supabase_id = auth.uid()::text)
    );

-- Users can insert their own record during signup
CREATE POLICY "users_insert_own"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (supabase_id = auth.uid()::text);

-- Admins can read all user profiles (for user management)
CREATE POLICY "users_select_admin"
    ON users FOR SELECT
    TO authenticated
    USING (is_admin());

-- Admins can update any user (including role changes)
CREATE POLICY "users_update_admin"
    ON users FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Service role has full access
CREATE POLICY "users_all_service_role"
    ON users FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE users IS 'User accounts with RLS: self-access + admin oversight';


-- ============================================================================
-- TABLE: queries
-- POLICIES: User isolation, admin analytics
-- HIPAA: Query text may reference patient scenarios - strict isolation required
-- ============================================================================

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Users can read their own query history
CREATE POLICY "queries_select_own"
    ON queries FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can insert their own queries
CREATE POLICY "queries_insert_own"
    ON queries FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_current_user_id());

-- Admins can read all queries (for analytics, no PHI access)
CREATE POLICY "queries_select_admin"
    ON queries FOR SELECT
    TO authenticated
    USING (is_admin());

-- Service role has full access
CREATE POLICY "queries_all_service_role"
    ON queries FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE queries IS 'HIPAA: User query history with strict isolation';


-- ============================================================================
-- TABLE: bookmarks
-- POLICIES: User isolation
-- ============================================================================

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookmarks
CREATE POLICY "bookmarks_select_own"
    ON bookmarks FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can create their own bookmarks
CREATE POLICY "bookmarks_insert_own"
    ON bookmarks FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_current_user_id());

-- Users can delete their own bookmarks
CREATE POLICY "bookmarks_delete_own"
    ON bookmarks FOR DELETE
    TO authenticated
    USING (user_id = get_current_user_id());

-- Service role has full access
CREATE POLICY "bookmarks_all_service_role"
    ON bookmarks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE bookmarks IS 'User bookmarks with strict user isolation';


-- ============================================================================
-- TABLE: search_history
-- POLICIES: User isolation
-- HIPAA: Search terms may contain clinical context - strict isolation
-- ============================================================================

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own search history
CREATE POLICY "search_history_select_own"
    ON search_history FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can create their own search history
CREATE POLICY "search_history_insert_own"
    ON search_history FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_current_user_id());

-- Users can delete their own search history
CREATE POLICY "search_history_delete_own"
    ON search_history FOR DELETE
    TO authenticated
    USING (user_id = get_current_user_id());

-- Service role has full access
CREATE POLICY "search_history_all_service_role"
    ON search_history FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE search_history IS 'HIPAA: User search history with strict isolation';


-- ============================================================================
-- TABLE: feedback
-- POLICIES: User isolation, admin moderation
-- ============================================================================

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own feedback
CREATE POLICY "feedback_select_own"
    ON feedback FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can create feedback
CREATE POLICY "feedback_insert_own"
    ON feedback FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_current_user_id());

-- Users can update their own pending feedback
CREATE POLICY "feedback_update_own_pending"
    ON feedback FOR UPDATE
    TO authenticated
    USING (
        user_id = get_current_user_id()
        AND status = 'pending'
    )
    WITH CHECK (
        user_id = get_current_user_id()
        AND status = 'pending'
    );

-- Admins can read all feedback
CREATE POLICY "feedback_select_admin"
    ON feedback FOR SELECT
    TO authenticated
    USING (is_admin());

-- Admins can update feedback status and admin notes
CREATE POLICY "feedback_update_admin"
    ON feedback FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Service role has full access
CREATE POLICY "feedback_all_service_role"
    ON feedback FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE feedback IS 'User feedback with moderation workflow';


-- ============================================================================
-- TABLE: audit_logs
-- POLICIES: Admin read-only, service write
-- HIPAA: Audit logs required for compliance - admin access only
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "audit_logs_select_admin"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (is_admin());

-- Service role can insert and read all
CREATE POLICY "audit_logs_all_service_role"
    ON audit_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE audit_logs IS 'HIPAA: Audit trail - admin read-only, service write';


-- ============================================================================
-- TABLE: agencies
-- POLICIES: Public read, member write, admin full
-- ============================================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Public read access to agencies
CREATE POLICY "agencies_select_public"
    ON agencies FOR SELECT
    TO public
    USING (true);

-- Agency admins can update their agency
CREATE POLICY "agencies_update_admin"
    ON agencies FOR UPDATE
    TO authenticated
    USING (is_agency_admin(id))
    WITH CHECK (is_agency_admin(id));

-- System admins can do anything
CREATE POLICY "agencies_all_admin"
    ON agencies FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Service role has full access
CREATE POLICY "agencies_all_service_role"
    ON agencies FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE agencies IS 'Public agency directory with admin management';


-- ============================================================================
-- TABLE: agency_members
-- POLICIES: Agency-scoped access, admin management
-- ============================================================================

ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

-- Users can read members of their agencies
CREATE POLICY "agency_members_select_member"
    ON agency_members FOR SELECT
    TO authenticated
    USING (is_agency_member(agency_id));

-- Users can read their own memberships
CREATE POLICY "agency_members_select_own"
    ON agency_members FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Agency admins can manage members (invite, update roles, remove)
CREATE POLICY "agency_members_all_agency_admin"
    ON agency_members FOR ALL
    TO authenticated
    USING (is_agency_admin(agency_id))
    WITH CHECK (is_agency_admin(agency_id));

-- System admins can manage all
CREATE POLICY "agency_members_all_admin"
    ON agency_members FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Service role has full access
CREATE POLICY "agency_members_all_service_role"
    ON agency_members FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE agency_members IS 'Agency membership with role-based access';


-- ============================================================================
-- TABLE: protocol_versions
-- POLICIES: Agency-scoped, role-based contributions
-- ============================================================================

ALTER TABLE protocol_versions ENABLE ROW LEVEL SECURITY;

-- Public can read published protocols
CREATE POLICY "protocol_versions_select_published"
    ON protocol_versions FOR SELECT
    TO public
    USING (status = 'published');

-- Agency members can read their agency's protocols
CREATE POLICY "protocol_versions_select_member"
    ON protocol_versions FOR SELECT
    TO authenticated
    USING (is_agency_member(agency_id));

-- Protocol authors can create drafts for their agency
CREATE POLICY "protocol_versions_insert_author"
    ON protocol_versions FOR INSERT
    TO authenticated
    WITH CHECK (
        is_agency_member(agency_id)
        AND created_by = get_current_user_id()
    );

-- Authors can update their own drafts
CREATE POLICY "protocol_versions_update_author"
    ON protocol_versions FOR UPDATE
    TO authenticated
    USING (
        created_by = get_current_user_id()
        AND status IN ('draft', 'review')
    )
    WITH CHECK (
        created_by = get_current_user_id()
    );

-- Agency admins can approve and publish
CREATE POLICY "protocol_versions_update_admin"
    ON protocol_versions FOR UPDATE
    TO authenticated
    USING (is_agency_admin(agency_id))
    WITH CHECK (is_agency_admin(agency_id));

-- Service role has full access
CREATE POLICY "protocol_versions_all_service_role"
    ON protocol_versions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE protocol_versions IS 'Protocol versioning with approval workflow';


-- ============================================================================
-- TABLE: protocol_uploads
-- POLICIES: Agency-scoped uploads
-- ============================================================================

ALTER TABLE protocol_uploads ENABLE ROW LEVEL SECURITY;

-- Agency members can read their agency's uploads
CREATE POLICY "protocol_uploads_select_member"
    ON protocol_uploads FOR SELECT
    TO authenticated
    USING (is_agency_member(agency_id));

-- Agency members can create uploads
CREATE POLICY "protocol_uploads_insert_member"
    ON protocol_uploads FOR INSERT
    TO authenticated
    WITH CHECK (
        is_agency_member(agency_id)
        AND user_id = get_current_user_id()
    );

-- Users can update their own uploads
CREATE POLICY "protocol_uploads_update_own"
    ON protocol_uploads FOR UPDATE
    TO authenticated
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- Agency admins can manage all uploads
CREATE POLICY "protocol_uploads_all_agency_admin"
    ON protocol_uploads FOR ALL
    TO authenticated
    USING (is_agency_admin(agency_id))
    WITH CHECK (is_agency_admin(agency_id));

-- Service role has full access
CREATE POLICY "protocol_uploads_all_service_role"
    ON protocol_uploads FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE protocol_uploads IS 'Protocol file uploads with agency scoping';


-- ============================================================================
-- TABLE: user_auth_providers
-- POLICIES: User isolation, sensitive auth data
-- ============================================================================

ALTER TABLE user_auth_providers ENABLE ROW LEVEL SECURITY;

-- Users can read their own auth providers
CREATE POLICY "user_auth_providers_select_own"
    ON user_auth_providers FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Service role manages auth provider linking
CREATE POLICY "user_auth_providers_all_service_role"
    ON user_auth_providers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE user_auth_providers IS 'OAuth provider tokens - strict user isolation';


-- ============================================================================
-- TABLE: user_counties
-- POLICIES: User isolation
-- ============================================================================

ALTER TABLE user_counties ENABLE ROW LEVEL SECURITY;

-- Users can read their own county selections
CREATE POLICY "user_counties_select_own"
    ON user_counties FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can manage their own counties
CREATE POLICY "user_counties_all_own"
    ON user_counties FOR ALL
    TO authenticated
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- Service role has full access
CREATE POLICY "user_counties_all_service_role"
    ON user_counties FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE user_counties IS 'User county preferences with isolation';


-- ============================================================================
-- TABLE: user_states
-- POLICIES: User isolation
-- ============================================================================

ALTER TABLE user_states ENABLE ROW LEVEL SECURITY;

-- Users can read their own state access
CREATE POLICY "user_states_select_own"
    ON user_states FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can manage their own state subscriptions
CREATE POLICY "user_states_all_own"
    ON user_states FOR ALL
    TO authenticated
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- Service role has full access
CREATE POLICY "user_states_all_service_role"
    ON user_states FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE user_states IS 'User state subscriptions with isolation';


-- ============================================================================
-- TABLE: user_agencies
-- POLICIES: User isolation, agency visibility
-- ============================================================================

ALTER TABLE user_agencies ENABLE ROW LEVEL SECURITY;

-- Users can read their own agency access
CREATE POLICY "user_agencies_select_own"
    ON user_agencies FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Agency admins can see all users with access to their agency
CREATE POLICY "user_agencies_select_agency_admin"
    ON user_agencies FOR SELECT
    TO authenticated
    USING (is_agency_admin(agency_id));

-- Users can manage their own subscriptions
CREATE POLICY "user_agencies_all_own"
    ON user_agencies FOR ALL
    TO authenticated
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- Service role has full access
CREATE POLICY "user_agencies_all_service_role"
    ON user_agencies FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE user_agencies IS 'User agency subscriptions with isolation';


-- ============================================================================
-- TABLE: contact_submissions
-- POLICIES: Admin only (contains PII)
-- ============================================================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Admins can read all contact submissions
CREATE POLICY "contact_submissions_select_admin"
    ON contact_submissions FOR SELECT
    TO authenticated
    USING (is_admin());

-- Admins can update submission status
CREATE POLICY "contact_submissions_update_admin"
    ON contact_submissions FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Service role can insert (from public form) and has full access
CREATE POLICY "contact_submissions_all_service_role"
    ON contact_submissions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE contact_submissions IS 'Contact form with PII - admin access only';


-- ============================================================================
-- TABLE: counties
-- POLICIES: Public read (geographic reference data)
-- ============================================================================

ALTER TABLE counties ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "counties_select_public"
    ON counties FOR SELECT
    TO public
    USING (true);

-- Admins can manage counties
CREATE POLICY "counties_all_admin"
    ON counties FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Service role has full access
CREATE POLICY "counties_all_service_role"
    ON counties FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE counties IS 'Public county reference data';


-- ============================================================================
-- TABLE: protocol_chunks
-- POLICIES: Public read (medical protocols are public safety data)
-- ============================================================================

ALTER TABLE protocol_chunks ENABLE ROW LEVEL SECURITY;

-- Public read access to all protocols
CREATE POLICY "protocol_chunks_select_public"
    ON protocol_chunks FOR SELECT
    TO public
    USING (true);

-- Service role manages protocol ingestion
CREATE POLICY "protocol_chunks_all_service_role"
    ON protocol_chunks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE protocol_chunks IS 'Public medical protocols - read access for safety';


-- ============================================================================
-- TABLE: integration_logs
-- POLICIES: Service role only (contains analytics data)
-- HIPAA: No PHI after migration 0012, but still restricted
-- ============================================================================

ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read integration logs for analytics
CREATE POLICY "integration_logs_select_admin"
    ON integration_logs FOR SELECT
    TO authenticated
    USING (is_admin());

-- Service role has full access
CREATE POLICY "integration_logs_all_service_role"
    ON integration_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE integration_logs IS 'HIPAA: Partner integration analytics - no PHI';


-- ============================================================================
-- TABLE: stripe_webhook_events
-- POLICIES: Service role only (payment processing)
-- ============================================================================

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "stripe_webhook_events_all_service_role"
    ON stripe_webhook_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE stripe_webhook_events IS 'Stripe webhook processing - service role only';


-- ============================================================================
-- TABLE: push_tokens
-- POLICIES: User isolation
-- ============================================================================

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read their own tokens
CREATE POLICY "push_tokens_select_own"
    ON push_tokens FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Users can manage their own tokens
CREATE POLICY "push_tokens_all_own"
    ON push_tokens FOR ALL
    TO authenticated
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- Service role has full access
CREATE POLICY "push_tokens_all_service_role"
    ON push_tokens FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE push_tokens IS 'Push notification tokens with user isolation';


-- ============================================================================
-- TABLE: drip_emails_sent
-- POLICIES: User read own, service write
-- ============================================================================

ALTER TABLE drip_emails_sent ENABLE ROW LEVEL SECURITY;

-- Users can read their own email history
CREATE POLICY "drip_emails_sent_select_own"
    ON drip_emails_sent FOR SELECT
    TO authenticated
    USING (user_id = get_current_user_id());

-- Service role manages email sending
CREATE POLICY "drip_emails_sent_all_service_role"
    ON drip_emails_sent FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE drip_emails_sent IS 'Email campaign tracking with user visibility';


-- ============================================================================
-- GRANT TABLE PERMISSIONS TO ROLES
-- ============================================================================

-- Grant appropriate permissions to anon role (public access)
GRANT SELECT ON counties TO anon;
GRANT SELECT ON protocol_chunks TO anon;
GRANT SELECT ON agencies TO anon;

-- Grant permissions to authenticated role (controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON queries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON search_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON feedback TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT, UPDATE ON agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agency_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON protocol_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON protocol_uploads TO authenticated;
GRANT SELECT ON user_auth_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_counties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_states TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_agencies TO authenticated;
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;
GRANT SELECT ON counties TO authenticated;
GRANT SELECT ON protocol_chunks TO authenticated;
GRANT SELECT ON integration_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_tokens TO authenticated;
GRANT SELECT ON drip_emails_sent TO authenticated;

-- Service role has full access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
    tables_without_rls TEXT[];
BEGIN
    SELECT ARRAY_AGG(tablename)
    INTO tables_without_rls
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'drizzle%'
    AND rowsecurity = false;

    IF tables_without_rls IS NOT NULL THEN
        RAISE WARNING 'Tables without RLS: %', tables_without_rls;
    ELSE
        RAISE NOTICE 'All tables have RLS enabled';
    END IF;
END $$;

-- Count policies per table
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Verify helper functions exist
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_current_user_id',
    'is_admin',
    'is_agency_member',
    'is_agency_admin'
)
ORDER BY routine_name;


-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/*
To rollback this migration:

-- Drop all RLS policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'drizzle%'
    ) LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_agency_member(INTEGER);
DROP FUNCTION IF EXISTS is_agency_admin(INTEGER);

-- Revoke permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
*/
