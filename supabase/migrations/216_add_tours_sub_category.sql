ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Optional: set default NULL values where not provided
UPDATE public.tours SET sub_category = NULL WHERE sub_category IS NULL;
