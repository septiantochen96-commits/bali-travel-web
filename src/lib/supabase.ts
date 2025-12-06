import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Tour = {
  id: string
  title: string
  slug: string
  description: string
  itinerary_content: string
  location: string
  duration: string
  thumbnail_image: string
  published: boolean
  category: string
  sub_category?: string | null
  created_at: string
  updated_at: string
  display_order?: number
  category_priority?: number
}

export type TourGallery = {
  id: string
  tour_id: string
  image_url: string
  created_at: string
}

export type TourPrice = {
  id: string
  tour_id: string
  label: string
  price_idr: string
  price_usd: string
  created_at: string
}

export type TourInclusion = {
  id: string
  tour_id: string
  item_text: string
  is_included: boolean
  created_at: string
}

export type AdminUser = {
  id: string
  email: string
  created_at: string
}
