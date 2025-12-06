CREATE TABLE IF NOT EXISTS public.car_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  image_url TEXT,
  price_idr VARCHAR(50) NOT NULL,
  price_original_idr VARCHAR(50),
  available BOOLEAN NOT NULL DEFAULT true,
  capacity_text VARCHAR(255),
  notes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.car_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view car_rentals" ON public.car_rentals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage car_rentals" ON public.car_rentals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_car_rentals_available ON public.car_rentals(available);
