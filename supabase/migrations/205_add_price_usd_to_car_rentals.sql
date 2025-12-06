ALTER TABLE public.car_rentals
  ADD COLUMN IF NOT EXISTS price_usd VARCHAR(50);

-- Ensure authenticated can insert/update/delete explicitly
CREATE POLICY "Authenticated insert car_rentals" ON public.car_rentals
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update car_rentals" ON public.car_rentals
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete car_rentals" ON public.car_rentals
  FOR DELETE TO authenticated
  USING (true);
