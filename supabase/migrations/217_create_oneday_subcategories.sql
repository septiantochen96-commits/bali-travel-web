CREATE TABLE IF NOT EXISTS public.oneday_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.oneday_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view oneday_subcategories" ON public.oneday_subcategories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage oneday_subcategories" ON public.oneday_subcategories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Initialize default values if table is empty
INSERT INTO public.oneday_subcategories (name, display_order)
SELECT v.name, v.ordinal
FROM (
  VALUES
    ('Ubud Tour', 1),
    ('Kintamani Tour', 2),
    ('Island Tour', 3),
    ('South Bali', 4),
    ('East Bali', 5),
    ('North Bali', 6)
) AS v(name, ordinal)
WHERE NOT EXISTS (SELECT 1 FROM public.oneday_subcategories);
