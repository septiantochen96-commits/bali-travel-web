-- RLS policies to allow authenticated users to manage tour data

-- Tours
CREATE POLICY "Authenticated can insert tours" ON public.tours
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update tours" ON public.tours
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete tours" ON public.tours
  FOR DELETE TO authenticated
  USING (true);

-- Tour gallery
CREATE POLICY "Authenticated can insert tour_gallery" ON public.tour_gallery
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update tour_gallery" ON public.tour_gallery
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete tour_gallery" ON public.tour_gallery
  FOR DELETE TO authenticated
  USING (true);

-- Tour prices
CREATE POLICY "Authenticated can insert tour_prices" ON public.tour_prices
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update tour_prices" ON public.tour_prices
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete tour_prices" ON public.tour_prices
  FOR DELETE TO authenticated
  USING (true);

-- Tour inclusions
CREATE POLICY "Authenticated can insert tour_inclusions" ON public.tour_inclusions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update tour_inclusions" ON public.tour_inclusions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete tour_inclusions" ON public.tour_inclusions
  FOR DELETE TO authenticated
  USING (true);
