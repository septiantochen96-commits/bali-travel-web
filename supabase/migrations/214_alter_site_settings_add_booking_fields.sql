ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS booking_message TEXT;
