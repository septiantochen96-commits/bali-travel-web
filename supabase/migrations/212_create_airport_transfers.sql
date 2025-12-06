CREATE TABLE IF NOT EXISTS public.airport_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination TEXT UNIQUE NOT NULL,
  suv_price_idr INTEGER NOT NULL,
  elf_price_idr INTEGER NOT NULL,
  bus_price_idr INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.airport_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read airport_transfers" ON public.airport_transfers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage airport_transfers" ON public.airport_transfers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.airport_transfers_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.elf_price_idr IS NULL THEN
    NEW.elf_price_idr := NEW.suv_price_idr + 300000;
  END IF;
  IF NEW.bus_price_idr IS NULL THEN
    NEW.bus_price_idr := NEW.suv_price_idr + 600000;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS airport_transfers_defaults_trg ON public.airport_transfers;
CREATE TRIGGER airport_transfers_defaults_trg
BEFORE INSERT OR UPDATE ON public.airport_transfers
FOR EACH ROW EXECUTE FUNCTION public.airport_transfers_defaults();

INSERT INTO public.airport_transfers (destination, suv_price_idr, elf_price_idr, bus_price_idr)
VALUES
  ('Kuta', 175000, 175000 + 300000, 175000 + 600000),
  ('Legian', 200000, 200000 + 300000, 200000 + 600000),
  ('Sanur', 200000, 200000 + 300000, 200000 + 600000),
  ('Seminyak', 250000, 250000 + 300000, 250000 + 600000),
  ('Jimbaran', 250000, 250000 + 300000, 250000 + 600000),
  ('Nusa Dua', 250000, 250000 + 300000, 250000 + 600000),
  ('Canggu', 350000, 350000 + 300000, 350000 + 600000),
  ('Ubud', 400000, 400000 + 300000, 400000 + 600000),
  ('Uluwatu', 400000, 400000 + 300000, 400000 + 600000),
  ('Padang Bai', 500000, 500000 + 300000, 500000 + 600000),
  ('Tanah Lot', 400000, 400000 + 300000, 400000 + 600000),
  ('Candidasa', 600000, 600000 + 300000, 600000 + 600000),
  ('Kintamani', 750000, 750000 + 300000, 750000 + 600000)
ON CONFLICT (destination) DO NOTHING;
