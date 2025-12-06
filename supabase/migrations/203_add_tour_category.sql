-- Add category column with allowed values
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'ONEDAY TOUR';

-- Optional check constraint to restrict values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tours_category_allowed_values'
  ) THEN
    ALTER TABLE public.tours
    ADD CONSTRAINT tours_category_allowed_values CHECK (
      category IN (
        'ONEDAY TOUR',
        'ADVENTURE PACKAGE',
        'HONEYMOON  PACKAGE',
        'FAMILY PACKAGE',
        'AIRPORT TRANSFER',
        'CAR RENTAL'
      )
    );
  END IF;
END$$;
