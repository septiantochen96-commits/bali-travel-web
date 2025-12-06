export const TOUR_CATEGORIES = [
  'ONEDAY TOUR',
  'ADVENTURE PACKAGE',
  'HONEYMOON  PACKAGE',
  'FAMILY PACKAGE',
] as const

export type TourCategory = typeof TOUR_CATEGORIES[number]

import { supabase } from './supabase'

export const DEFAULT_ONEDAY_SUBCATEGORIES = [
  'Ubud Tour',
  'Kintamani Tour',
  'Island Tour',
  'South Bali',
  'East Bali',
  'North Bali',
] as const

export type OnedaySubcategory = typeof DEFAULT_ONEDAY_SUBCATEGORIES[number]

export async function fetchOnedaySubcategories(): Promise<string[]> {
  const { data } = await supabase
    .from('oneday_subcategories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (!data || data.length === 0) return [...DEFAULT_ONEDAY_SUBCATEGORIES]
  return data.map((d: any) => String(d.name))
}
