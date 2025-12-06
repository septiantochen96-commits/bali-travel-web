ALTER TABLE public.car_rentals
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

WITH ord AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM public.car_rentals
)
UPDATE public.car_rentals c
SET display_order = ord.rn
FROM ord
WHERE c.id = ord.id AND (c.display_order IS NULL OR c.display_order = 0);
