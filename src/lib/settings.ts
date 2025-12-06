import { supabase } from './supabase'

export type SiteSettings = {
  id: string
  brand_name: string | null
  logo_url: string | null
  hero_bg_url?: string | null
  whatsapp_number?: string | null
  booking_message?: string | null
  email_address?: string | null
  social_facebook_url?: string | null
  social_instagram_url?: string | null
  social_tiktok_url?: string | null
  physical_address?: string | null
  copyright_year?: number | null
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase.from('site_settings').select('*').limit(1)
  return data && data.length > 0 ? (data[0] as SiteSettings) : null
}
