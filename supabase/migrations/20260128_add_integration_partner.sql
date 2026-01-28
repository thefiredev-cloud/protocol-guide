-- Migration: Add integration_partner column for ImageTrend integration
-- Date: 2026-01-28
-- Author: Jim (CTO)

-- Add integration_partner column
ALTER TABLE public.manus_agencies
ADD COLUMN IF NOT EXISTS integration_partner TEXT DEFAULT 'none';

-- Add constraint for valid values
ALTER TABLE public.manus_agencies
ADD CONSTRAINT chk_integration_partner 
CHECK (integration_partner IN ('imagetrend', 'eso', 'zoll', 'emscloud', 'none'));

-- Create index for filtering by partner
CREATE INDEX IF NOT EXISTS idx_manus_agencies_integration_partner 
ON public.manus_agencies(integration_partner);

-- Update LA County Fire Department to use ImageTrend
UPDATE public.manus_agencies
SET integration_partner = 'imagetrend'
WHERE name ILIKE '%los angeles%' OR name ILIKE '%la county%';

-- Add comment
COMMENT ON COLUMN public.manus_agencies.integration_partner IS 'ePCR integration partner (imagetrend, eso, zoll, emscloud, none)';
