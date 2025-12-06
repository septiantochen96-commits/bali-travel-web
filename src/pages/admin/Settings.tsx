import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save } from 'lucide-react'

export default function Settings() {
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('Hello, can I get more detail about this package?')
  const [email, setEmail] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [address, setAddress] = useState('')
  const [copyrightYear, setCopyrightYear] = useState<string>(String(new Date().getFullYear()))
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])
  useEffect(() => { loadExtra() }, [])

  const load = async () => {
    const { data } = await supabase.from('site_settings').select('*').limit(1)
    if (data && data.length > 0) {
      setWhatsapp(data[0].whatsapp_number || '')
      setMessage(data[0].booking_message || 'Hello, can I get more detail about this package?')
      setEmail(data[0].email_address || '')
      setFacebook(data[0].social_facebook_url || '')
      setInstagram(data[0].social_instagram_url || '')
      setTiktok(data[0].social_tiktok_url || '')
      setAddress(data[0].physical_address || '')
      if (data[0].copyright_year) setCopyrightYear(String(data[0].copyright_year))
    }
  }

  const loadExtra = async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/settings/site-config')
      const cfg = await resp.json()
      if (cfg.email) setEmail(cfg.email)
      if (cfg.facebook) setFacebook(cfg.facebook)
      if (cfg.instagram) setInstagram(cfg.instagram)
      if (cfg.tiktok) setTiktok(cfg.tiktok)
      if (cfg.address) setAddress(cfg.address)
      if (cfg.copyright_year) setCopyrightYear(String(cfg.copyright_year))
    } catch {}
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await supabase.from('site_settings').select('id').limit(1)
      if (data && data.length > 0) {
        const id = data[0].id
        const { error } = await supabase.from('site_settings').update({
          whatsapp_number: whatsapp,
          booking_message: message,
          email_address: email,
          social_facebook_url: facebook,
          social_instagram_url: instagram,
          social_tiktok_url: tiktok,
          physical_address: address,
          copyright_year: parseInt(copyrightYear || String(new Date().getFullYear()), 10),
          updated_at: new Date().toISOString()
        }).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('site_settings').insert({
          whatsapp_number: whatsapp,
          booking_message: message,
          email_address: email,
          social_facebook_url: facebook,
          social_instagram_url: instagram,
          social_tiktok_url: tiktok,
          physical_address: address,
          copyright_year: parseInt(copyrightYear || String(new Date().getFullYear()), 10)
        })
        if (error) throw error
      }
      try {
        await fetch('http://localhost:3001/api/storage/ensure-branding-bucket', { method: 'POST' })
        await fetch('http://localhost:3001/api/settings/site-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, facebook, instagram, tiktok, address, copyright_year: parseInt(copyrightYear || String(new Date().getFullYear()), 10) })
        })
      } catch {}
      alert('Settings saved')
    } catch (e) {
      console.error('Save settings failed', e)
      alert('Failed to save settings')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Settings</h2>
      <form onSubmit={save} className="space-y-6">
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number (e.g., 6281234567890)</label>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-field" placeholder="628xxxxxxxxxx" />
        </div>
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Opening Message Template</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="textarea-field" placeholder="Hello, can I get more detail about this package?" />
          <p className="text-sm text-gray-500 mt-2">Tour name will be appended automatically.</p>
        </div>
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="info@yourcompany.com" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
            <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="input-field" placeholder="https://facebook.com/yourpage" />
          </div>
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input-field" placeholder="https://instagram.com/yourhandle" />
          </div>
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">TikTok URL</label>
            <input type="url" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="input-field" placeholder="https://tiktok.com/@yourhandle" />
          </div>
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Year</label>
            <input type="number" value={copyrightYear} onChange={(e) => setCopyrightYear(e.target.value)} className="input-field" placeholder="2025" />
          </div>
          <div className="card p-6 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="textarea-field" placeholder="Street, City, Country" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center space-x-2 px-6 py-3">
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  )
}
