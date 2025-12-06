import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../../lib/supabase'
import { Upload } from 'lucide-react'

export default function CarForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [priceIdr, setPriceIdr] = useState('')
  const [priceUsd, setPriceUsd] = useState('')
  const [priceOriginalIdr, setPriceOriginalIdr] = useState('')
  const [capacityText, setCapacityText] = useState('')
  const [available, setAvailable] = useState(true)
  const [notesText, setNotesText] = useState('')

  useEffect(() => { if (id) loadCar() }, [id])

  const loadCar = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('car_rentals').select('*').eq('id', id).single()
      if (error) throw error
      if (data) {
        setTitle(data.title)
        setImageUrl(data.image_url || '')
        setPriceIdr(data.price_idr || '')
        setPriceUsd(data.price_usd || '')
        setPriceOriginalIdr(data.price_original_idr || '')
        setCapacityText(data.capacity_text || '')
        setAvailable(!!data.available)
        setNotesText(Array.isArray(data.notes) ? (data.notes as string[]).join('\n') : '')
      }
    } catch (e) {
      console.error('Error loading car', e)
      alert('Failed to load vehicle')
    } finally { setLoading(false) }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      try {
        const fileName = `cars/${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('tours').upload(fileName, file, { contentType: file.type })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('tours').getPublicUrl(fileName)
        setImageUrl(publicUrl)
      } catch (e) {
        console.error('Error uploading image', e)
        alert('Failed to upload image')
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const notesArray = notesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      const payload = {
        title,
        image_url: imageUrl,
        price_idr: priceIdr || null,
        price_usd: priceUsd || null,
        price_original_idr: priceOriginalIdr || null,
        capacity_text: capacityText,
        available,
        notes: notesArray,
      }
      if (id) {
        const { error } = await supabase.from('car_rentals').update(payload).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('car_rentals').insert(payload)
        if (error) throw error
      }
      alert('Vehicle saved successfully')
      navigate('/admin/cars')
    } catch (e) {
      console.error('Error saving vehicle', e)
      alert('Failed to save vehicle')
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900">{id ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity Text</label>
              <input type="text" value={capacityText} onChange={(e) => setCapacityText(e.target.value)} className="input-field" placeholder="e.g., 4 persons with luggage" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (IDR)</label>
              <input type="text" value={priceIdr} onChange={(e) => { setPriceIdr(e.target.value); if (e.target.value) setPriceUsd('') }} className="input-field" />
              <p className="text-xs text-gray-500 mt-1">Isi salah satu: IDR atau USD</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
              <input type="text" value={priceUsd} onChange={(e) => { setPriceUsd(e.target.value); if (e.target.value) setPriceIdr('') }} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (IDR)</label>
              <input type="text" value={priceOriginalIdr} onChange={(e) => setPriceOriginalIdr(e.target.value)} className="input-field" />
            </div>
            <div className="flex items-center mt-6">
              <input id="available" type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="mr-2" />
              <label htmlFor="available" className="text-sm font-medium text-gray-700">Available</label>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Image</h3>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <input {...getInputProps()} />
            {imageUrl ? (
              <img src={imageUrl} alt="Vehicle" className="max-w-full h-48 object-cover mx-auto rounded-lg" />
            ) : (
              <div className="text-gray-500">
                <Upload className="mx-auto h-12 w-12 mb-2" />
                <p>Click to upload vehicle image</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} rows={6} className="textarea-field" placeholder={`For durations exceeding 10 hours, an additional charge of 10%...\nRemote area pickup/drop may incur additional fees`} />
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/admin/cars')} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : (id ? 'Update Vehicle' : 'Add Vehicle')}</button>
        </div>
      </form>
    </div>
  )
}
