-- Reassign any tours categorized as CAR RENTAL
UPDATE public.tours SET category = 'ONEDAY TOUR' WHERE category = 'CAR RENTAL';

-- Drop and recreate allowed values constraint without CAR RENTAL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tours_category_allowed_values'
  ) THEN
    ALTER TABLE public.tours DROP CONSTRAINT tours_category_allowed_values;
  END IF;
  ALTER TABLE public.tours
  ADD CONSTRAINT tours_category_allowed_values CHECK (
    category IN (
      'ONEDAY TOUR',
      'ADVENTURE PACKAGE',
      'HONEYMOON  PACKAGE',
      'FAMILY PACKAGE',
      'AIRPORT TRANSFER'
    )
  );
END$$;
