import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase, Tour } from '../lib/supabase'
import { TOUR_CATEGORIES, fetchOnedaySubcategories, DEFAULT_ONEDAY_SUBCATEGORIES } from '../lib/categories'
import { MapPin, Clock, DollarSign, Phone, Star, Users, Calendar } from 'lucide-react'
import { fetchSiteSettings } from '../lib/settings'
import { openWhatsApp } from '../lib/utils'
import SEO from '../components/SEO'

export default function Home() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
  const [tours, setTours] = useState<(Tour & { min_usd?: number; min_idr?: number })[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ONEDAY TOUR')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All')
  const [onedayOptions, setOnedayOptions] = useState<string[]>(['All', ...DEFAULT_ONEDAY_SUBCATEGORIES])
  const [loading, setLoading] = useState(true)
  const [cars, setCars] = useState<CarRental[]>([])
  const [heroBgUrl, setHeroBgUrl] = useState<string>('')
  const [aboutImageUrl, setAboutImageUrl] = useState<string>('')
  const location = useLocation()
  const navigate = useNavigate()
  const [waNumber, setWaNumber] = useState<string>('')
  const [emailAddress, setEmailAddress] = useState<string>('')

  useEffect(() => {
    fetchTours()
  }, [selectedCategory, selectedSubCategory])

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const opts = await fetchOnedaySubcategories()
        if (Array.isArray(opts) && opts.length > 0) setOnedayOptions(['All', ...opts])
      } catch {}
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const settings = await fetchSiteSettings()
      if (settings?.hero_bg_url) setHeroBgUrl(settings.hero_bg_url)
      if (settings?.whatsapp_number) setWaNumber(settings.whatsapp_number)
      if (settings?.email_address) setEmailAddress(settings.email_address || '')
      try {
        const resp = await fetch(`${API_BASE}/api/settings/site-config`)
        const cfg = await resp.json()
        if (cfg?.email) setEmailAddress(cfg.email)
      } catch {}
      try {
        const resp = await fetch(`${API_BASE}/api/branding/about-image`)
        const json = await resp.json()
        if (json?.url) setAboutImageUrl(json.url)
      } catch {}
      const params = new URLSearchParams(location.search)
      const cat = params.get('category')
      const sub = params.get('subcategory')
      if (cat && TOUR_CATEGORIES.includes(cat as any)) {
        setSelectedCategory(cat)
        if (cat === 'ONEDAY TOUR') {
          const sc = sub && onedayOptions.includes(sub) ? sub : 'All'
          setSelectedSubCategory(sc)
        } else {
          setSelectedSubCategory('All')
        }
        const el = document.getElementById('tours')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    })()
  }, [location.search])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  const fetchTours = async () => {
    try {
      let query = supabase
        .from('tours')
        .select('*')
        .eq('published', true)
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }
      if (selectedCategory === 'ONEDAY TOUR' && selectedSubCategory !== 'All') {
        query = query.eq('sub_category', selectedSubCategory)
      }
      const { data, error } = await query
        .order('category_priority', { ascending: true })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      const toursData = (data || []) as Tour[]
      const ids = toursData.map(t => t.id)
      let pricesMap: Record<string, { min_usd?: number; min_idr?: number }> = {}
      if (ids.length > 0) {
        const { data: prices } = await supabase
          .from('tour_prices')
          .select('tour_id, price_usd, price_idr')
          .in('tour_id', ids)
        if (prices) {
          for (const p of prices as any[]) {
            const usd = p.price_usd ? parseFloat(String(p.price_usd).replace(/[^0-9.]/g, '')) : NaN
            const idr = p.price_idr ? parseInt(String(p.price_idr).replace(/\D/g, ''), 10) : NaN
            const current = pricesMap[p.tour_id] || {}
            if (!isNaN(usd)) current.min_usd = current.min_usd === undefined ? usd : Math.min(current.min_usd, usd)
            if (!isNaN(idr)) current.min_idr = current.min_idr === undefined ? idr : Math.min(current.min_idr, idr)
            pricesMap[p.tour_id] = current
          }
        }
      }
      setTours(toursData.map(t => ({ ...t, min_usd: pricesMap[t.id]?.min_usd, min_idr: pricesMap[t.id]?.min_idr })))
    } catch (error) {
      console.error('Error fetching tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('car_rentals')
        .select('*')
        .eq('available', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setCars(data || [])
    } catch (error) {
      console.error('Error fetching cars:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Bali Voyager Co - Luxury Travel & Tours in Bali"
        description="Experience the best of Bali with our premium tour packages, private car rentals, and personalized services. Book your dream vacation today."
        image={heroBgUrl || undefined}
      />
      
      {/* Hero Section */}
      <section className={`relative h-screen ${heroBgUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-emerald-900 via-emerald-700 to-gold-600'} flex items-center justify-center text-white`} style={heroBgUrl ? { backgroundImage: `url(${heroBgUrl})` } : undefined}>
        <div className="absolute inset-0 bg-black opacity-30 pointer-events-none"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Discover Bali's
            <span className="block text-gold-300">Hidden Treasures</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-emerald-100">
            Experience the magic of Bali with our luxury guided tours. From ancient temples 
            to pristine beaches, create memories that will last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => { setSelectedCategory('ONEDAY TOUR'); navigate('/?category=ONEDAY%20TOUR#tours'); const el = document.getElementById('tours'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
              className="btn-secondary text-base md:text-lg px-6 py-3 mx-auto"
            >
              Explore Tours
            </button>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); openWhatsApp('Hello, can I get more detail about this package?', waNumber || '6281234567890') }}
              className="btn-primary text-base md:text-lg px-6 py-3 flex items-center justify-center space-x-2 mx-auto"
            >
              <Phone className="h-5 w-5" />
              <span>Book via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Private Tours</h3>
              <p className="text-gray-600">Personalized experiences with expert local guides</p>
            </div>
            <div className="text-center">
              <div className="bg-gold-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Luxury Experience</h3>
              <p className="text-gray-600">Premium transportation and exclusive locations</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Flexible Booking</h3>
              <p className="text-gray-600">Customizable itineraries to suit your preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Signature Tours
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked experiences that showcase the best of Bali's natural beauty, 
              cultural heritage, and adventure opportunities.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {TOUR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full border font-semibold tracking-wide uppercase transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500' : 'bg-white text-gray-800 border-gray-300 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-sm'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {selectedCategory === 'ONEDAY TOUR' && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {onedayOptions.map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedSubCategory(sc)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${selectedSubCategory === sc ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-800 border-gray-300 hover:border-emerald-400'}`}
                >
                  {sc}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* Car Rental Section */}
      <section id="car-rental" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">Best Car Rental with Driver in Bali</h2>
            <p className="text-xl text-gray-600">Comfortable vehicles with professional drivers. Book via WhatsApp.</p>
          </div>

          {cars.length === 0 ? (
            <div className="text-center text-gray-600">No vehicles available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {cars.map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
                  {car.image_url && (
                    <div className="relative h-48">
                      <img src={car.image_url} alt={car.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-serif font-semibold text-gray-900">{car.title}</h3>
                    <div className="text-sm text-gray-500">Start From</div>
                    <div className="text-xl font-bold">
                      {car.price_idr ? `IDR ${car.price_idr}` : (car.price_usd ? `$${car.price_usd}` : '-')}
                    </div>
                    {Array.isArray((car as any).notes) && (car as any).notes.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-blue-700 font-semibold">Notes :</div>
                        <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                          {(car as any).notes.map((n: string, i: number) => (<li key={i}>{n}</li>))}
                        </ul>
                      </div>
                    )}
                    {car.capacity_text && (
                      <div className="text-sm text-gray-600 mt-2">{car.capacity_text}</div>
                    )}
                    <button
                      onClick={() => {
                        const num = waNumber && waNumber.trim() ? waNumber : '6281234567890'
                        openWhatsApp(`Hello! I want to book ${car.title} car rental with driver in Bali.`, num)
                      }}
                      className="mt-auto w-full btn-primary flex items-center justify-center space-x-2"
                    >
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

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
                Why Choose BALI VOYAGER CO?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 rounded-full p-2 mt-1">
                    <Star className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Expert Local Guides</h3>
                    <p className="text-gray-600">Our passionate guides are born and raised in Bali, 
                    offering authentic insights and hidden gems.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gold-100 rounded-full p-2 mt-1">
                    <Users className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Personalized Service</h3>
                    <p className="text-gray-600">Every tour is tailored to your interests, 
                    pace, and travel style for a perfect experience.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 rounded-full p-2 mt-1">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Premium Transportation</h3>
                    <p className="text-gray-600">Travel in comfort with our fleet of luxury vehicles 
                    and professional drivers.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={aboutImageUrl || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20travel%20experience%20in%20Bali%2C%20happy%20tourists%20with%20local%20guide%2C%20beautiful%20temple%20background%2C%20professional%20photography%2C%20warm%20lighting%2C%20luxury%20travel%20atmosphere&image_size=square'}
                alt="BALI VOYAGER CO Experience"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold mb-4">
            Ready for Your Bali Adventure?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Contact us today to plan your perfect Bali experience. Our team is ready to 
            create unforgettable memories for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={waNumber ? `https://wa.me/${waNumber}` : 'https://wa.me/6281234567890'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>{waNumber ? `WhatsApp: +${waNumber}` : 'WhatsApp: +62 812-3456-7890'}</span>
            </a>
            <a
              href={emailAddress ? `mailto:${emailAddress}` : 'mailto:info@baliluxurytravel.com'}
              className="bg-white text-emerald-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {emailAddress ? `Email: ${emailAddress}` : 'Email: info@baliluxurytravel.com'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

interface TourCardProps { tour: Tour & { min_usd?: number; min_idr?: number } }

function TourCard({ tour }: TourCardProps) {
  const priceLabel = tour.min_usd !== undefined
    ? `Start From $${Math.round(tour.min_usd)}`
    : (tour.min_idr !== undefined ? `Start From IDR ${new Intl.NumberFormat('id-ID').format(tour.min_idr)}` : 'Start From -')
  return (
    <div className="group">
      <div className="card hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={tour.thumbnail_image}
            alt={tour.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {tour.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
            {tour.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
              {tour.location}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2 text-emerald-600" />
              {tour.duration}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gold-600">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-2 text-sm text-gray-600">(5.0)</span>
            </div>
            
            <div className="flex items-center text-emerald-600 font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>{priceLabel}</span>
            </div>
          </div>
          <div className="mt-4">
            <Link to={`/tour/${tour.slug}`} className="btn-secondary w-full text-center">View Detail</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
interface CarRental {
  id: string
  title: string
  image_url: string
  price_idr: string | null
  price_usd: string | null
  capacity_text: string | null
  notes?: string[] | null
}
