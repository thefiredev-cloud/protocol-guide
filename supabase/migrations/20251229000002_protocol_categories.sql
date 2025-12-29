-- Protocol Categories
-- Migration: 20251229000002
-- Purpose: Protocol categorization for library navigation

-- Protocol Categories table
CREATE TABLE IF NOT EXISTS protocol_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color_class TEXT NOT NULL,
  bg_class TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_id TEXT REFERENCES protocol_categories(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_protocol_categories_order ON protocol_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_protocol_categories_parent ON protocol_categories(parent_id);

-- Insert default categories matching the UI design
INSERT INTO protocol_categories (id, name, icon, color_class, bg_class, sort_order, description) VALUES
  ('cardiac', 'Cardiac', 'cardiology', 'text-red-600 dark:text-red-400', 'bg-red-50 dark:bg-red-500/10', 1, 'Cardiac arrest, STEMI, arrhythmias'),
  ('trauma', 'Trauma / Burns', 'personal_injury', 'text-orange-600 dark:text-orange-400', 'bg-orange-50 dark:bg-orange-500/10', 2, 'Trauma assessment, burns, crush injuries'),
  ('pediatrics', 'Pediatrics', 'child_care', 'text-purple-600 dark:text-purple-400', 'bg-purple-50 dark:bg-purple-500/10', 3, 'Pediatric-specific protocols'),
  ('medical', 'General Medical', 'medical_services', 'text-blue-600 dark:text-blue-400', 'bg-blue-50 dark:bg-blue-500/10', 4, 'Medical emergencies, allergic reactions'),
  ('pharmacology', 'Pharmacology', 'pill', 'text-emerald-600 dark:text-emerald-400', 'bg-emerald-50 dark:bg-emerald-500/10', 5, 'Medication references and dosing'),
  ('procedures', 'Procedures', 'vaccines', 'text-indigo-600 dark:text-indigo-400', 'bg-indigo-50 dark:bg-indigo-500/10', 6, 'Clinical procedures and skills'),
  ('admin', 'Admin Policies', 'policy', 'text-slate-600 dark:text-slate-400', 'bg-slate-100 dark:bg-slate-700/50', 7, 'Department policies and standards')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color_class = EXCLUDED.color_class,
  bg_class = EXCLUDED.bg_class,
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description;

-- Protocol Cross References table
CREATE TABLE IF NOT EXISTS protocol_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_protocol_id TEXT NOT NULL,
  target_protocol_id TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'related', -- 'related', 'supersedes', 'requires'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(source_protocol_id, target_protocol_id)
);

CREATE INDEX IF NOT EXISTS idx_cross_refs_source ON protocol_cross_references(source_protocol_id);
CREATE INDEX IF NOT EXISTS idx_cross_refs_target ON protocol_cross_references(target_protocol_id);

-- Enable RLS on categories (read-only for all authenticated)
ALTER TABLE protocol_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are readable by authenticated users"
  ON protocol_categories FOR SELECT
  TO authenticated
  USING (true);

-- Cross references are readable by authenticated users
ALTER TABLE protocol_cross_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cross references are readable by authenticated users"
  ON protocol_cross_references FOR SELECT
  TO authenticated
  USING (true);

-- Function to get category with protocol count
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
  id TEXT,
  name TEXT,
  icon TEXT,
  color_class TEXT,
  bg_class TEXT,
  sort_order INTEGER,
  description TEXT,
  protocol_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.icon,
    c.color_class,
    c.bg_class,
    c.sort_order,
    c.description,
    COALESCE(COUNT(tp.id), 0) AS protocol_count
  FROM protocol_categories c
  LEFT JOIN treatment_protocols tp ON tp.category = c.id
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.icon, c.color_class, c.bg_class, c.sort_order, c.description
  ORDER BY c.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION get_categories_with_counts TO authenticated;
