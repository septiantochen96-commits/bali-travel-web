import { useEffect, useState } from 'react'
import { fetchSiteSettings } from '../lib/settings'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { openWhatsApp } from '../lib/utils'

export default function Footer() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
  const [wa, setWa] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [fb, setFb] = useState('')
  const [ig, setIg] = useState('')
  const [tt, setTt] = useState('')
  const [copyrightYear, setCopyrightYear] = useState<number | null>(null)

  useEffect(() => {
    (async () => {
      const s = await fetchSiteSettings()
      if (s?.whatsapp_number) setWa(s.whatsapp_number)
      if (s?.email_address) setEmail(s.email_address)
      if (s?.physical_address) setAddress(s.physical_address)
      if (s?.social_facebook_url) setFb(s.social_facebook_url)
      if (s?.social_instagram_url) setIg(s.social_instagram_url)
      if (s?.social_tiktok_url) setTt(s.social_tiktok_url)
      if (s?.copyright_year) setCopyrightYear(s.copyright_year)
      try {
        const resp = await fetch(`${API_BASE}/api/settings/site-config`)
        const cfg = await resp.json()
        if (cfg.email) setEmail(cfg.email)
        if (cfg.facebook) setFb(cfg.facebook)
        if (cfg.instagram) setIg(cfg.instagram)
        if (cfg.tiktok) setTt(cfg.tiktok)
        if (cfg.address) setAddress(cfg.address)
        if (cfg.copyright_year) setCopyrightYear(parseInt(String(cfg.copyright_year), 10))
      } catch {}
    })()
  }, [])

  const waHref = wa && wa.trim() ? `whatsapp://send?phone=${wa.trim()}` : undefined
  const emailHref = email && email.trim() ? `mailto:${email.trim()}` : undefined

  return (
    <footer className="bg-gray-900 text-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-serif font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            {waHref && (
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a href="#" onClick={(e) => { e.preventDefault(); openWhatsApp('Hello, I would like to get in touch', wa) }}>
                  WhatsApp: {wa}
                </a>
              </li>
            )}
            {emailHref && (
              <li className="flex items-center space-x-2"><Mail className="h-4 w-4" /><a href={emailHref}>{email}</a></li>
            )}
            {address && (
              <li className="flex items-center space-x-2"><MapPin className="h-4 w-4" /><span>{address}</span></li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold mb-3">Follow Us</h3>
          <div className="flex items-center space-x-4">
            {fb && (<a href={fb} target="_blank" rel="noopener noreferrer" className="hover:text-white"><Facebook className="h-5 w-5" /></a>)}
            {ig && (<a href={ig} target="_blank" rel="noopener noreferrer" className="hover:text-white"><Instagram className="h-5 w-5" /></a>)}
            {tt && (
              <a href={tt} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <img
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg"
                  alt="TikTok"
                  className="h-5 w-5"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </a>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-400 md:text-right">© {copyrightYear ?? new Date().getFullYear()} BALI VOYAGER CO</div>
      </div>
    </footer>
  )
}
