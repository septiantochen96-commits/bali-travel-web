import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Phone, BadgeCheck } from 'lucide-react'
import { openWhatsApp } from '../lib/utils'
import { fetchSiteSettings } from '../lib/settings'

type CarRental = {
  id: string
  title: string
  image_url: string
  price_idr: string
  price_usd: string | null
  price_original_idr: string | null
  available: boolean
  capacity_text: string | null
  notes: string[] | null
}

export default function CarRental() {
  const [cars, setCars] = useState<CarRental[]>([])
  const [loading, setLoading] = useState(true)
  const [showAvailableOnly, setShowAvailableOnly] = useState(true)
  const [waNumber, setWaNumber] = useState<string>('')

  useEffect(() => { fetchCars() }, [showAvailableOnly])
  useEffect(() => { (async () => { const s = await fetchSiteSettings(); if (s?.whatsapp_number) setWaNumber(s.whatsapp_number) })() }, [])

  const fetchCars = async () => {
    try {
      let query = supabase
        .from('car_rentals')
        .select('*')
      if (showAvailableOnly) {
        query = query.eq('available', true)
      }
      const { data, error } = await query.order('display_order', { ascending: true }).order('created_at', { ascending: false })
      if (error) throw error
      setCars(data || [])
    } catch (e) {
      console.error('Error loading cars', e)
    } finally { setLoading(false) }
  }

  const handleBooking = (title: string) => {
    const message = `Hello! I want to book ${title} car rental with driver in Bali.`
    const num = waNumber && waNumber.trim() ? waNumber : '6281234567890'
    openWhatsApp(message, num)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-800 text-center mb-8">Best Car Rental with Driver in Bali</h1>
          <div className="flex justify-center mb-6">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" checked={showAvailableOnly} onChange={(e) => setShowAvailableOnly(e.target.checked)} />
              <span>Show only available</span>
            </label>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center text-gray-600">No vehicles found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                  {car.image_url && (
                    <div className="relative h-56 md:h-64">
                      <img src={car.image_url} alt={car.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-serif font-semibold text-gray-900">{car.title}</h3>
                      {car.available && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center">
                          <BadgeCheck className="h-3 w-3 mr-1" /> Available
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Start From</div>
                    {car.price_original_idr && (
                      <div className="text-sm text-gray-400 line-through">IDR {car.price_original_idr}</div>
                    )}
                    <div className="text-xl font-bold">
                      {car.price_idr ? `IDR ${car.price_idr}` : (car.price_usd ? `$${car.price_usd}` : '-')}
                    </div>
                    {car.capacity_text && (
                      <div className="text-sm text-gray-600 mt-2">{car.capacity_text}</div>
                    )}
                    {Array.isArray(car.notes) && car.notes.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-blue-700 font-semibold">Notes :</div>
                        <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                          {car.notes.map((n, i) => (<li key={i}>{n}</li>))}
                        </ul>
                      </div>
                    )}
                    <button onClick={() => handleBooking(car.title)} className="mt-auto w-full btn-primary flex items-center justify-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Booking via WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
