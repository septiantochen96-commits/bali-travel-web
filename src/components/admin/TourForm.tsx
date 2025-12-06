import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { supabase, TourPrice, TourInclusion } from '../../lib/supabase'
import { TOUR_CATEGORIES, fetchOnedaySubcategories, DEFAULT_ONEDAY_SUBCATEGORIES } from '../../lib/categories'
import { slugify } from '../../lib/utils'
import { Upload, X, Plus, Trash2 } from 'lucide-react'

export default function TourForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [itineraryContent, setItineraryContent] = useState('')
  const [location, setLocation] = useState('')
  const [duration, setDuration] = useState('')
  const [thumbnailImage, setThumbnailImage] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [prices, setPrices] = useState<TourPrice[]>([])
  const [inclusions, setInclusions] = useState<TourInclusion[]>([])
  const [published, setPublished] = useState(false)
  const [bulkIncludedText, setBulkIncludedText] = useState('')
  const [bulkExcludedText, setBulkExcludedText] = useState('')
  const [category, setCategory] = useState<string>('ONEDAY TOUR')
  const [subCategory, setSubCategory] = useState<string>('')
  const [onedayOptions, setOnedayOptions] = useState<string[]>([...DEFAULT_ONEDAY_SUBCATEGORIES])
  const [displayOrder, setDisplayOrder] = useState<number>(0)
  const [categoryPriority, setCategoryPriority] = useState<number>(0)

  // Load tour data if editing
  useEffect(() => {
    if (id) {
      loadTour()
    }
  }, [id])

  useEffect(() => {
    (async () => {
      try {
        const opts = await fetchOnedaySubcategories()
        if (Array.isArray(opts) && opts.length > 0) setOnedayOptions(opts)
      } catch {}
    })()
  }, [])

  const loadTour = async () => {
    setLoading(true)
    try {
      // Load tour
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single()

      if (tourError) throw tourError

      if (tourData) {
        setTitle(tourData.title)
        setSlug(tourData.slug)
        setSlugEdited(tourData.slug !== slugify(tourData.title))
        setDescription(tourData.description)
        setItineraryContent(tourData.itinerary_content)
        setLocation(tourData.location)
        setDuration(tourData.duration)
        setThumbnailImage(tourData.thumbnail_image)
        setPublished(!!tourData.published)
        setCategory(tourData.category || 'ONEDAY TOUR')
        setSubCategory(tourData.sub_category || '')
        setDisplayOrder(tourData.display_order ?? 0)
        setCategoryPriority(tourData.category_priority ?? 0)
      }

      // Load gallery images
      const { data: galleryData, error: galleryError } = await supabase
        .from('tour_gallery')
        .select('*')
        .eq('tour_id', id)

      if (galleryData) {
        setGalleryImages(galleryData.map(item => item.image_url))
      }
      if (galleryError) throw galleryError

      // Load prices
      const { data: pricesData, error: pricesError } = await supabase
        .from('tour_prices')
        .select('*')
        .eq('tour_id', id)

      if (pricesData) {
        setPrices(pricesData)
      }
      if (pricesError) throw pricesError

      // Load inclusions
      const { data: inclusionsData, error: inclusionsError } = await supabase
        .from('tour_inclusions')
        .select('*')
        .eq('tour_id', id)

      if (inclusionsData) {
        setInclusions(inclusionsData)
      }
      if (inclusionsError) throw inclusionsError
    } catch (error) {
      console.error('Error loading tour:', error)
      alert('Failed to load tour')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from title (unless manually edited)
  useEffect(() => {
    if (title && !slugEdited) {
      setSlug(slugify(title))
    }
  }, [title, slugEdited])

  // Thumbnail upload
  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        await uploadThumbnail(file)
      }
    }
  })

  // Gallery upload
  const { getRootProps: getGalleryRootProps, getInputProps: getGalleryInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadGalleryImage(file)
      }
    }
  })

  const uploadThumbnail = async (file: File) => {
    try {
      const fileName = `tours/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('tours')
        .upload(fileName, file, { contentType: file.type, upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('tours')
        .getPublicUrl(fileName)

      setThumbnailImage(publicUrl)
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      const msg = (error as any)?.message || 'Failed to upload thumbnail'
      alert(msg)
    }
  }

  const uploadGalleryImage = async (file: File) => {
    try {
      const fileName = `tours/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('tours')
        .upload(fileName, file, { contentType: file.type, upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('tours')
        .getPublicUrl(fileName)

      setGalleryImages(prev => [...prev, publicUrl])
    } catch (error) {
      console.error('Error uploading gallery image:', error)
      const msg = (error as any)?.message || 'Failed to upload gallery image'
      alert(msg)
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  // Price management
  const addPrice = () => {
    setPrices(prev => [...prev, {
      id: '',
      tour_id: id || '',
      label: '',
      price_idr: '',
      price_usd: '',
      created_at: ''
    }])
  }

  const updatePrice = (index: number, field: keyof TourPrice, value: string) => {
    setPrices(prev => prev.map((price, i) => 
      i === index ? { ...price, [field]: value } : price
    ))
  }

  const removePrice = (index: number) => {
    setPrices(prev => prev.filter((_, i) => i !== index))
  }

  // Inclusion management
  const addInclusion = (isIncluded: boolean = true) => {
    setInclusions(prev => [...prev, {
      id: '',
      tour_id: id || '',
      item_text: '',
      is_included: isIncluded,
      created_at: ''
    }])
  }

  const updateInclusion = (index: number, field: keyof TourInclusion, value: any) => {
    setInclusions(prev => prev.map((inclusion, i) => 
      i === index ? { ...inclusion, [field]: value } : inclusion
    ))
  }

  const removeInclusion = (index: number) => {
    setInclusions(prev => prev.filter((_, i) => i !== index))
  }

  const normalizeLine = (line: string) => {
    return line
      .replace(/^\s*\d+\.?\s*/,'')
      .replace(/^\s*[-*•–]\s*/,'')
      .trim()
  }

  const applyBulkInclusions = () => {
    const includedLines = bulkIncludedText.split(/\r?\n/).map(normalizeLine).filter(Boolean)
    const excludedLines = bulkExcludedText.split(/\r?\n/).map(normalizeLine).filter(Boolean)
    const mappedIncluded: TourInclusion[] = includedLines.map(text => ({
      id: '', tour_id: id || '', item_text: text, is_included: true, created_at: ''
    }))
    const mappedExcluded: TourInclusion[] = excludedLines.map(text => ({
      id: '', tour_id: id || '', item_text: text, is_included: false, created_at: ''
    }))
    setInclusions([...mappedIncluded, ...mappedExcluded])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const tourData = {
        title,
        slug,
        description,
        itinerary_content: itineraryContent,
        location,
        duration,
        thumbnail_image: thumbnailImage,
        published,
        category,
        sub_category: subCategory || null,
        display_order: displayOrder,
        category_priority: categoryPriority
      }

      let tourId = id

      if (id) {
        // Update tour
        const { error } = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', id)

        if (error) throw error
      } else {
        // Create new tour
        const { data, error } = await supabase
          .from('tours')
          .insert(tourData)
          .select()
          .single()

        if (error) throw error
        tourId = data.id
      }

      // Update gallery images
      if (galleryImages.length > 0) {
        // Delete existing gallery images
        await supabase
          .from('tour_gallery')
          .delete()
          .eq('tour_id', tourId)

        // Insert new gallery images
        const galleryData = galleryImages.map(url => ({
          tour_id: tourId,
          image_url: url
        }))

        await supabase
          .from('tour_gallery')
          .insert(galleryData)
      }

      // Update prices
      if (prices.length > 0) {
        // Delete existing prices
        await supabase
          .from('tour_prices')
          .delete()
          .eq('tour_id', tourId)

        // Insert new prices
        const pricesData = prices.map(price => ({
          tour_id: tourId,
          label: price.label,
          price_idr: price.price_idr,
          price_usd: price.price_usd
        }))

        await supabase
          .from('tour_prices')
          .insert(pricesData)
      }

      // Build inclusions from bulk text if provided
      const includedLines = bulkIncludedText.split(/\r?\n/).map(normalizeLine).filter(Boolean)
      const excludedLines = bulkExcludedText.split(/\r?\n/).map(normalizeLine).filter(Boolean)
      const bulkIncluded = includedLines.map(text => ({ id: '', tour_id: tourId || '', item_text: text, is_included: true, created_at: '' }))
      const bulkExcluded = excludedLines.map(text => ({ id: '', tour_id: tourId || '', item_text: text, is_included: false, created_at: '' }))
      const effectiveInclusions = (bulkIncluded.length + bulkExcluded.length) > 0 ? [...bulkIncluded, ...bulkExcluded] : inclusions

      // Update inclusions
      if (effectiveInclusions.length > 0) {
        // Delete existing inclusions
        await supabase
          .from('tour_inclusions')
          .delete()
          .eq('tour_id', tourId)

        // Insert new inclusions
        const inclusionsData = effectiveInclusions.map(inclusion => ({
          tour_id: tourId,
          item_text: inclusion.item_text,
          is_included: inclusion.is_included
        }))

        await supabase
          .from('tour_inclusions')
          .insert(inclusionsData)
      }

      alert('Tour saved successfully!')
      navigate('/admin/tours')
    } catch (error) {
      console.error('Error saving tour:', error)
      alert('Failed to save tour')
    } finally {
      setSaving(false)
    }
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
        <h2 className="text-2xl font-serif font-bold text-gray-900">
          {id ? 'Edit Tour' : 'Add New Tour'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter tour title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
                onBlur={() => setSlug((s) => slugify(s))}
                className="input-field"
                placeholder="tour-slug"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                placeholder="e.g., Ubud, Bali"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field"
                placeholder="e.g., 8-10 hours"
              />
            </div>
            
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => { const v = e.target.value; setCategory(v); if (v !== 'ONEDAY TOUR') setSubCategory('') }}
              className="input-field"
              required
            >
              {TOUR_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="input-field"
              disabled={category !== 'ONEDAY TOUR'}
            >
              <option value="">All</option>
              {onedayOptions.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
          
        <div className="flex items-center mt-6">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
        </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="textarea-field"
              placeholder="Enter tour description"
            />
          </div>
        </div>

        {category === 'ONEDAY TOUR' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subcategory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Subcategory</label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">All</option>
                  {onedayOptions.map((sc) => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Pick</label>
                <div className="flex flex-wrap gap-2">
                  {onedayOptions.filter(o => o !== 'All').map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setSubCategory(sc)}
                      className={`px-3 py-2 rounded-lg border text-sm ${subCategory === sc ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-800 border-gray-300 hover:border-emerald-400'}`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
          
          {/* Thumbnail */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image *
            </label>
            <div
              {...getThumbnailRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
            >
              <input {...getThumbnailInputProps()} />
              {thumbnailImage ? (
                <img src={thumbnailImage} alt="Thumbnail" className="max-w-full h-48 object-cover mx-auto rounded-lg" />
              ) : (
                <div className="text-gray-500">
                  <Upload className="mx-auto h-12 w-12 mb-2" />
                  <p>Click to upload thumbnail image</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <div
              {...getGalleryRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors mb-4"
            >
              <input {...getGalleryInputProps()} />
              <div className="text-gray-500">
                <Upload className="mx-auto h-12 w-12 mb-2" />
                <p>Click to upload gallery images (multiple)</p>
              </div>
            </div>
            
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Itinerary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h3>
          <textarea
            value={itineraryContent}
            onChange={(e) => setItineraryContent(e.target.value)}
            rows={8}
            className="textarea-field"
            placeholder="Enter detailed itinerary (supports markdown)"
          />
        </div>

        {/* Pricing */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
            <button
              type="button"
              onClick={addPrice}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Price</span>
            </button>
          </div>
          
          {prices.map((price, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <input
                type="text"
                placeholder="Label (e.g., 2-3 Pax)"
                value={price.label}
                onChange={(e) => updatePrice(index, 'label', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Price in IDR"
                value={price.price_idr}
                onChange={(e) => updatePrice(index, 'price_idr', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Price in USD"
                value={price.price_usd}
                onChange={(e) => updatePrice(index, 'price_usd', e.target.value)}
                className="input-field"
              />
              <button
                type="button"
                onClick={() => removePrice(index)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Inclusions */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inclusions</h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => addInclusion(true)}
                className="btn-primary"
              >
                Add Included Item
              </button>
              <button
                type="button"
                onClick={() => addInclusion(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Excluded Item
              </button>
            </div>
          </div>

          {/* Bulk Paste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Included (one per line)</label>
              <textarea
                value={bulkIncludedText}
                onChange={(e) => setBulkIncludedText(e.target.value)}
                rows={6}
                className="textarea-field"
                placeholder={`Hotel pickup and drop-off\nAll entrance fees\nMineral water`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Excluded (one per line)</label>
              <textarea
                value={bulkExcludedText}
                onChange={(e) => setBulkExcludedText(e.target.value)}
                rows={6}
                className="textarea-field"
                placeholder={`Personal expenses\nTips for the guide`}
              />
            </div>
          </div>
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={applyBulkInclusions}
              className="btn-secondary"
            >
              Apply Bulk Inclusions
            </button>
          </div>
          
          {inclusions.map((inclusion, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${inclusion.is_included ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <input
                type="text"
                placeholder={inclusion.is_included ? "Included item" : "Excluded item"}
                value={inclusion.item_text}
                onChange={(e) => updateInclusion(index, 'item_text', e.target.value)}
                className="flex-1 input-field"
              />
              <button
                type="button"
                onClick={() => updateInclusion(index, 'is_included', !inclusion.is_included)}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Toggle
              </button>
              <button
                type="button"
                onClick={() => removeInclusion(index)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/tours')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : (id ? 'Update Tour' : 'Create Tour')}
          </button>
        </div>
      </form>
    </div>
  )
}
