-- Migration: Create manus_agencies table
-- Description: Core agencies table for Protocol Guide Manus
-- Date: 2026-01-20

-- Create the agencies table
CREATE TABLE IF NOT EXISTS public.manus_agencies (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    state_code CHAR(2) NOT NULL,
    state_name TEXT NOT NULL,
    protocol_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add table comments for documentation
COMMENT ON TABLE public.manus_agencies IS 'Stores state EMS/fire agencies and their protocol counts';
COMMENT ON COLUMN public.manus_agencies.id IS 'Primary key, auto-incrementing integer';
COMMENT ON COLUMN public.manus_agencies.name IS 'Agency name (e.g., "California EMS Authority")';
COMMENT ON COLUMN public.manus_agencies.state_code IS 'Two-letter state code (e.g., "CA", "NY")';
COMMENT ON COLUMN public.manus_agencies.state_name IS 'Full state name (e.g., "California")';
COMMENT ON COLUMN public.manus_agencies.protocol_count IS 'Number of protocols associated with this agency';
COMMENT ON COLUMN public.manus_agencies.created_at IS 'Timestamp when agency was added to the system';

-- Create indexes for fast filtering
CREATE INDEX idx_manus_agencies_state_code ON public.manus_agencies(state_code);
CREATE INDEX idx_manus_agencies_name ON public.manus_agencies(name);
CREATE INDEX idx_manus_agencies_state_name ON public.manus_agencies(state_name);

-- Composite index for common query pattern (filter by state, order by name)
CREATE INDEX idx_manus_agencies_state_code_name ON public.manus_agencies(state_code, name);

-- Add constraints
ALTER TABLE public.manus_agencies
    ADD CONSTRAINT chk_state_code_uppercase CHECK (state_code = UPPER(state_code));

ALTER TABLE public.manus_agencies
    ADD CONSTRAINT chk_state_code_length CHECK (LENGTH(state_code) = 2);

ALTER TABLE public.manus_agencies
    ADD CONSTRAINT chk_protocol_count_positive CHECK (protocol_count >= 0);

ALTER TABLE public.manus_agencies
    ADD CONSTRAINT uq_agency_name_state UNIQUE (name, state_code);

-- Enable Row Level Security
ALTER TABLE public.manus_agencies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all users to read agencies (public data)
CREATE POLICY "Allow public read access to agencies"
    ON public.manus_agencies
    FOR SELECT
    TO PUBLIC
    USING (true);

-- RLS Policy: Only authenticated users can insert agencies
CREATE POLICY "Allow authenticated users to insert agencies"
    ON public.manus_agencies
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Only authenticated users can update agencies
CREATE POLICY "Allow authenticated users to update agencies"
    ON public.manus_agencies
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Only authenticated users can delete agencies
CREATE POLICY "Allow authenticated users to delete agencies"
    ON public.manus_agencies
    FOR DELETE
    TO authenticated
    USING (true);

-- Create a function to update protocol_count
CREATE OR REPLACE FUNCTION public.update_agency_protocol_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.manus_agencies
        SET protocol_count = protocol_count + 1
        WHERE id = NEW.agency_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.manus_agencies
        SET protocol_count = protocol_count - 1
        WHERE id = OLD.agency_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.agency_id != OLD.agency_id THEN
        UPDATE public.manus_agencies
        SET protocol_count = protocol_count - 1
        WHERE id = OLD.agency_id;
        UPDATE public.manus_agencies
        SET protocol_count = protocol_count + 1
        WHERE id = NEW.agency_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to the function
COMMENT ON FUNCTION public.update_agency_protocol_count() IS 'Automatically updates protocol_count when protocol_chunks are added/removed/modified';

-- Note: Create this trigger on manus_protocol_chunks table after it exists:
-- CREATE TRIGGER trg_update_agency_protocol_count
--     AFTER INSERT OR UPDATE OR DELETE ON public.manus_protocol_chunks
--     FOR EACH ROW
--     EXECUTE FUNCTION public.update_agency_protocol_count();

-- Grant permissions
GRANT SELECT ON public.manus_agencies TO anon;
GRANT ALL ON public.manus_agencies TO authenticated;
GRANT ALL ON public.manus_agencies TO service_role;

-- Sample data (optional - remove in production)
-- INSERT INTO public.manus_agencies (name, state_code, state_name, protocol_count) VALUES
-- ('California EMS Authority', 'CA', 'California', 0),
-- ('New York State Department of Health', 'NY', 'New York', 0),
-- ('Texas Department of State Health Services', 'TX', 'Texas', 0),
-- ('Florida Department of Health', 'FL', 'Florida', 0);
