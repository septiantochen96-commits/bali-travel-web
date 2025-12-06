import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../../lib/supabase'
import { Upload } from 'lucide-react'

export default function BrandingForm() {
  const [brandName, setBrandName] = useState('BALI VOYAGER CO')
  const [logoUrl, setLogoUrl] = useState('')
  const [heroBgUrl, setHeroBgUrl] = useState('')
  const [aboutUrl, setAboutUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { ensureBucket().then(loadSettings) }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    if (data) {
      setBrandName(data.brand_name || 'BALI VOYAGER CO')
      setLogoUrl(data.logo_url || '')
      setHeroBgUrl(data.hero_bg_url || '')
    }
  }

  const ensureBucket = async () => {
    try {
      await fetch('http://localhost:3001/api/storage/ensure-branding-bucket', { method: 'POST' })
    } catch (e) {
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      try {
        const fileName = `branding/logo-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('branding').upload(fileName, file, { contentType: file.type, upsert: false })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(fileName)
        setLogoUrl(publicUrl)
      } catch (e) {
        console.error('Error uploading logo', e)
        alert('Failed to upload logo')
      }
    }
  })

  const { getRootProps: getHeroRootProps, getInputProps: getHeroInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      try {
        const fileName = `branding/hero-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('branding').upload(fileName, file, { contentType: file.type, upsert: false })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(fileName)
        setHeroBgUrl(publicUrl)
      } catch (e) {
        console.error('Error uploading hero background', e)
        alert('Failed to upload hero background')
      }
    }
  })

  const { getRootProps: getAboutRootProps, getInputProps: getAboutInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      try {
        const fileName = `about/${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('branding').upload(fileName, file, { contentType: file.type, upsert: false })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(fileName)
        setAboutUrl(publicUrl)
      } catch (e) {
        alert('Failed to upload about image')
      }
    }
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([
          {
            id: 1,
            brand_name: brandName,
            logo_url: logoUrl,
            hero_bg_url: heroBgUrl,
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'id' })
      if (error) throw error
      alert('Brand settings saved')
    } catch (e) {
      console.error('Error saving brand settings', e)
      alert('Failed to save settings')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Branding</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
          <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="input-field" />
        </div>
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <input {...getInputProps()} />
            {logoUrl ? (
              <img src={logoUrl} alt="Company Logo" className="max-w-full h-32 object-contain mx-auto" />
            ) : (
              <div className="text-gray-500">
                <Upload className="mx-auto h-12 w-12 mb-2" />
                <p>Click to upload logo</p>
              </div>
            )}
          </div>
        </div>
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background</label>
          <div {...getHeroRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <input {...getHeroInputProps()} />
            {heroBgUrl ? (
              <img src={heroBgUrl} alt="Hero Background" className="max-w-full h-40 object-cover mx-auto rounded" />
            ) : (
              <div className="text-gray-500">
                <Upload className="mx-auto h-12 w-12 mb-2" />
                <p>Click to upload hero background</p>
              </div>
            )}
          </div>
        </div>
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">About Section Image</label>
          <div {...getAboutRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <input {...getAboutInputProps()} />
            {aboutUrl ? (
              <img src={aboutUrl} alt="About Section" className="max-w-full h-40 object-cover mx-auto rounded" />
            ) : (
              <div className="text-gray-500">
                <Upload className="mx-auto h-12 w-12 mb-2" />
                <p>Click to upload about image</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </form>
    </div>
  )
}
