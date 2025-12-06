import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import { fetchSiteSettings } from '../lib/settings'

export default function Navbar() {
  const [brandName, setBrandName] = useState('BALI VOYAGER CO')
  const [logoUrl, setLogoUrl] = useState('')
  const [waNumber, setWaNumber] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const settings = await fetchSiteSettings()
        if (settings) {
          if (settings.brand_name) setBrandName(settings.brand_name)
          if (settings.logo_url) setLogoUrl(settings.logo_url)
          if (settings.whatsapp_number) setWaNumber(settings.whatsapp_number)
        }
      } catch (e) {
        console.error('Failed to load site settings', e)
      }
    })()
  }, [])

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <div className="flex items-center space-x-4">
                <img src={logoUrl} alt={brandName} className="h-12 md:h-16 p-1 bg-white rounded-md ring-1 ring-emerald-200 shadow-sm" />
                <span className="hidden sm:block text-2xl md:text-3xl font-serif font-bold text-gold-600">{brandName}</span>
              </div>
            ) : (
              <div className="text-2xl font-serif font-bold text-gold-600">
                {brandName}
              </div>
            )}
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link to="/#tours" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Tours
            </Link>
            <Link to="/#car-rental" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Car Rental
            </Link>
            <Link to="/#about" className="text-gray-700 hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Link to="/#contact" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/airport-transfer" className="text-emerald-700 hover:text-emerald-900 font-medium">Airport Transfer</Link>
            <a 
              href={waNumber ? `https://wa.me/${waNumber}` : 'https://wa.me/6281234567890'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Book Now</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
