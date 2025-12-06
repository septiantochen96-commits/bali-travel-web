-- Allow either IDR or USD price to be provided
ALTER TABLE public.car_rentals
  ALTER COLUMN price_idr DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_rentals_price_either'
  ) THEN
    ALTER TABLE public.car_rentals DROP CONSTRAINT car_rentals_price_either;
  END IF;
  ALTER TABLE public.car_rentals
    ADD CONSTRAINT car_rentals_price_either CHECK (
      price_idr IS NOT NULL OR price_usd IS NOT NULL
    );
END$$;
