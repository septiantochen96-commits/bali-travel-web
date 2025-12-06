import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Tour, TourGallery, TourPrice, TourInclusion } from '../lib/supabase'
import { generateWhatsAppMessage, openWhatsApp } from '../lib/utils'
import { fetchSiteSettings } from '../lib/settings'
import { MapPin, Clock, Phone, Star, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TourDetail() {
  const { slug } = useParams()
  const [tour, setTour] = useState<Tour | null>(null)
  const [gallery, setGallery] = useState<TourGallery[]>([])
  const [prices, setPrices] = useState<TourPrice[]>([])
  const [inclusions, setInclusions] = useState<TourInclusion[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [waNumber, setWaNumber] = useState<string>('')
  const [openingMsg, setOpeningMsg] = useState<string>('Hello, can I get more detail about this package?')

  useEffect(() => {
    if (slug) {
      fetchTourData()
    }
  }, [slug])

  useEffect(() => {
    (async () => {
      const s = await fetchSiteSettings()
      if (s?.whatsapp_number) setWaNumber(s.whatsapp_number)
      if (s?.booking_message) setOpeningMsg(s.booking_message)
    })()
  }, [])

  const fetchTourData = async () => {
    try {
      // Fetch tour
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .single()

      if (tourError) throw tourError
      setTour(tourData)

      if (tourData) {
        // Fetch gallery
        const { data: galleryData, error: galleryError } = await supabase
          .from('tour_gallery')
          .select('*')
          .eq('tour_id', tourData.id)

        if (galleryData) setGallery(galleryData)
        if (galleryError) throw galleryError

        // Fetch prices
        const { data: pricesData, error: pricesError } = await supabase
          .from('tour_prices')
          .select('*')
          .eq('tour_id', tourData.id)

        if (pricesData) setPrices(pricesData)
        if (pricesError) throw pricesError

        // Fetch inclusions
        const { data: inclusionsData, error: inclusionsError } = await supabase
          .from('tour_inclusions')
          .select('*')
          .eq('tour_id', tourData.id)

        if (inclusionsData) setInclusions(inclusionsData)
        if (inclusionsError) throw inclusionsError
      }
    } catch (error) {
      console.error('Error fetching tour data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === gallery.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? gallery.length - 1 : prev - 1
    )
  }

  const handleWhatsAppBooking = () => {
    if (tour) {
      const base = openingMsg || generateWhatsAppMessage(tour.title)
      const message = `${base}\nTour: ${tour.title}`
      const num = waNumber && waNumber.trim() ? waNumber : '6281234567890'
      openWhatsApp(message, num)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Tour not found</h1>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    )
  }

  const allImages = [tour.thumbnail_image, ...gallery.map(g => g.image_url)]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 md:h-screen">
        <img
          src={tour.thumbnail_image}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{tour.location}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
              {tour.title}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-5 w-5" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-gold-400" />
                ))}
                <span className="ml-2">(5.0)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="card p-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="card p-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.slice(0, 6).map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <img
                        src={image.image_url}
                        alt={`${tour.title} gallery ${index + 1}`}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            <div className="card p-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Itinerary</h2>
              <div className="prose prose-emerald max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ 
                    __html: tour.itinerary_content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            </div>

            {/* Inclusions */}
            <div className="card p-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inclusions
                  .filter(inc => inc.is_included)
                  .map((inclusion) => (
                    <div key={inclusion.id} className="flex items-start space-x-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{inclusion.item_text}</span>
                    </div>
                  ))
                }
              </div>
              
              {inclusions.filter(inc => !inc.is_included).length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Not Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inclusions
                      .filter(inc => !inc.is_included)
                      .map((inclusion) => (
                        <div key={inclusion.id} className="flex items-start space-x-3">
                          <div className="bg-red-100 rounded-full p-1 mt-1">
                            <X className="h-4 w-4 text-red-600" />
                          </div>
                          <span className="text-gray-700">{inclusion.item_text}</span>
                        </div>
                      ))
                    }
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing */}
              <div className="card p-6">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  {prices.map((price) => {
                    const idrRaw = price.price_idr && String(price.price_idr).trim()
                    const usdRaw = price.price_usd && String(price.price_usd).trim()
                    const hasIDR = !!idrRaw
                    const hasUSD = !!usdRaw
                    const idrFormatted = hasIDR ? new Intl.NumberFormat('id-ID').format(parseInt(String(idrRaw).replace(/\D/g, ''), 10)) : ''
                    return (
                      <div key={price.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700">{price.label}</span>
                        <div className="text-right">
                          {hasIDR && (
                            <div className="font-semibold text-emerald-600">Rp {idrFormatted}</div>
                          )}
                          {hasUSD && (
                            <div className="text-sm text-gray-500">${usdRaw}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Booking CTA */}
              <div className="card p-6 bg-gradient-to-br from-emerald-50 to-gold-50 border-emerald-200">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Book This Tour</h3>
                <p className="text-gray-600 mb-6">
                  Ready to experience {tour.title}? Contact us now to secure your spot!
                </p>
                <button
                  onClick={handleWhatsAppBooking}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Book via WhatsApp</span>
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Quick response within 2 hours
                </p>
              </div>

              {/* Quick Info */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-700">{tour.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-700">{tour.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-gold-500" />
                    <span className="text-gray-700">5.0 Rating (127 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            
            <img
              src={allImages[currentImageIndex]}
              alt={`${tour.title} image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
