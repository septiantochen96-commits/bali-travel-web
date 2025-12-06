ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS copyright_year INTEGER;

-- Backfill with current year if null
UPDATE public.site_settings
SET copyright_year = EXTRACT(YEAR FROM NOW())::INTEGER
WHERE copyright_year IS NULL;
