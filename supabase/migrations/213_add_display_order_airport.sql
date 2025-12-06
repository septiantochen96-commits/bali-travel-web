ALTER TABLE public.airport_transfers
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Initialize display_order sequentially by destination if currently zero
WITH ord AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY destination ASC) AS rn
  FROM public.airport_transfers
)
UPDATE public.airport_transfers a
SET display_order = ord.rn
FROM ord
WHERE a.id = ord.id AND (a.display_order IS NULL OR a.display_order = 0);
