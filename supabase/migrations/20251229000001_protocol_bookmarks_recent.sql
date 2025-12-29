-- Protocol Bookmarks & Recently Viewed
-- Migration: 20251229000001
-- Purpose: Support offline bookmarks and recently viewed protocols

-- Protocol Bookmarks table
CREATE TABLE IF NOT EXISTS protocol_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id TEXT NOT NULL,
  protocol_title TEXT,
  protocol_code TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ,

  -- Each user can bookmark a protocol once
  UNIQUE(user_id, protocol_id)
);

-- Protocol Views (recently viewed) table
CREATE TABLE IF NOT EXISTS protocol_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id TEXT NOT NULL,
  protocol_title TEXT,
  protocol_code TEXT,
  category TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count INTEGER DEFAULT 1,

  -- Track unique views per user/protocol
  UNIQUE(user_id, protocol_id)
);

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_protocol_bookmarks_user ON protocol_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_protocol_bookmarks_protocol ON protocol_bookmarks(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_views_user ON protocol_views(user_id);
CREATE INDEX IF NOT EXISTS idx_protocol_views_recent ON protocol_views(user_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE protocol_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own bookmarks/views
CREATE POLICY "Users can view own bookmarks"
  ON protocol_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON protocol_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON protocol_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own protocol views"
  ON protocol_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own protocol views"
  ON protocol_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protocol views"
  ON protocol_views FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to toggle bookmark (insert or delete)
CREATE OR REPLACE FUNCTION toggle_protocol_bookmark(
  p_protocol_id TEXT,
  p_protocol_title TEXT DEFAULT NULL,
  p_protocol_code TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if bookmark exists
  SELECT id INTO v_existing
  FROM protocol_bookmarks
  WHERE user_id = v_user_id AND protocol_id = p_protocol_id;

  IF v_existing IS NOT NULL THEN
    -- Remove bookmark
    DELETE FROM protocol_bookmarks WHERE id = v_existing;
    v_result := jsonb_build_object('success', true, 'action', 'removed', 'bookmarked', false);
  ELSE
    -- Add bookmark
    INSERT INTO protocol_bookmarks (user_id, protocol_id, protocol_title, protocol_code, category)
    VALUES (v_user_id, p_protocol_id, p_protocol_title, p_protocol_code, p_category);
    v_result := jsonb_build_object('success', true, 'action', 'added', 'bookmarked', true);
  END IF;

  RETURN v_result;
END;
$$;

-- Function to record protocol view
CREATE OR REPLACE FUNCTION record_protocol_view(
  p_protocol_id TEXT,
  p_protocol_title TEXT DEFAULT NULL,
  p_protocol_code TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Upsert: insert or update view count
  INSERT INTO protocol_views (user_id, protocol_id, protocol_title, protocol_code, category)
  VALUES (v_user_id, p_protocol_id, p_protocol_title, p_protocol_code, p_category)
  ON CONFLICT (user_id, protocol_id) DO UPDATE SET
    viewed_at = NOW(),
    view_count = protocol_views.view_count + 1,
    protocol_title = COALESCE(EXCLUDED.protocol_title, protocol_views.protocol_title),
    protocol_code = COALESCE(EXCLUDED.protocol_code, protocol_views.protocol_code),
    category = COALESCE(EXCLUDED.category, protocol_views.category);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function to get recently viewed protocols
CREATE OR REPLACE FUNCTION get_recently_viewed(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  protocol_id TEXT,
  protocol_title TEXT,
  protocol_code TEXT,
  category TEXT,
  viewed_at TIMESTAMPTZ,
  view_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    pv.protocol_id,
    pv.protocol_title,
    pv.protocol_code,
    pv.category,
    pv.viewed_at,
    pv.view_count
  FROM protocol_views pv
  WHERE pv.user_id = v_user_id
  ORDER BY pv.viewed_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION toggle_protocol_bookmark TO authenticated;
GRANT EXECUTE ON FUNCTION record_protocol_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_recently_viewed TO authenticated;
