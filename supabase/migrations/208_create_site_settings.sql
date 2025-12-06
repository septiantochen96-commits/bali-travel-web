-- Create site_settings table to store brand info
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view site_settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage site_settings" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create branding bucket if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'branding') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true);
  END IF;
END$$;

-- Storage policies for branding bucket
CREATE POLICY "Public read branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

CREATE POLICY "Authenticated insert branding" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding');

CREATE POLICY "Authenticated update branding" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'branding') WITH CHECK (bucket_id = 'branding');

CREATE POLICY "Authenticated delete branding" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'branding');
