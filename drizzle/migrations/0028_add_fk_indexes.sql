-- Migration: Add indexes on foreign key columns that are missing indexes
-- These improve JOIN performance and CASCADE operations 10-100x
-- Reference: PostgreSQL best practice Section 4.2

-- audit_logs.user_id references auth.users
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- reference_changes.ref_id references reference_documents
CREATE INDEX IF NOT EXISTS idx_reference_changes_ref_id ON reference_changes(ref_id);

-- treatment_protocols.ref_id references reference_documents
CREATE INDEX IF NOT EXISTS idx_treatment_protocols_ref_id ON treatment_protocols(ref_id);

-- mcg_entries.ref_id references reference_documents
CREATE INDEX IF NOT EXISTS idx_mcg_entries_ref_id ON mcg_entries(ref_id);

-- daily_research.topic_id references research_topics
CREATE INDEX IF NOT EXISTS idx_daily_research_topic_id ON daily_research(topic_id);

-- manus_users.selected_agency_id references agencies
CREATE INDEX IF NOT EXISTS idx_manus_users_selected_agency_id ON manus_users(selected_agency_id);

-- manus_queries.agency_id references agencies
CREATE INDEX IF NOT EXISTS idx_manus_queries_agency_id ON manus_queries(agency_id);
