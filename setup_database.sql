-- Create table site_settings and seed initial data
create table if not exists public.site_settings (
  id bigint generated always as identity primary key,
  whatsapp_number text,
  booking_message text,
  email_address text,
  social_facebook_url text,
  social_instagram_url text,
  social_tiktok_url text,
  physical_address text,
  copyright_year integer,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to maintain updated_at
create or replace function public.set_site_settings_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute procedure public.set_site_settings_updated_at();

-- Seed one row (singleton pattern)
insert into public.site_settings (
  whatsapp_number,
  booking_message,
  email_address,
  social_facebook_url,
  social_instagram_url,
  social_tiktok_url,
  physical_address,
  copyright_year
) values (
  '+6281234567890',
  'Hello, can I get more detail about this package?',
  'admin@balitravel.com',
  'https://facebook.com/bali',
  'https://instagram.com/bali',
  'https://www.tiktok.com/@balivoy',
  'Jln mertasari indah no 140',
  2023
)
on conflict do nothing;

-- Temporarily disable Row Level Security for this table
alter table public.site_settings disable row level security;
