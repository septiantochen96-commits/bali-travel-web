ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_bg_url TEXT;
