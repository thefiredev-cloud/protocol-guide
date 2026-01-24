-- Migration: Add FULLTEXT indexes for search optimization
-- Description: Replaces in-memory filtering with database-level full-text search
-- Date: 2026-01-23

-- Protocol content search
-- Enables fast search across protocol content, titles, and sections
ALTER TABLE protocolChunks
  ADD FULLTEXT INDEX ft_protocol_content (content, protocolTitle, section);

-- Query text search
-- Enables search through user query history
ALTER TABLE queries
  ADD FULLTEXT INDEX ft_query_text (queryText);

-- Feedback search
-- Enables search across feedback submissions
ALTER TABLE feedback
  ADD FULLTEXT INDEX ft_feedback_content (subject, message);
