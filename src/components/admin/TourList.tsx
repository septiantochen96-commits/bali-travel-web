import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Tour } from '../../lib/supabase'
import { Edit, Trash2, Eye, Plus, Copy, GripVertical } from 'lucide-react'
import { TOUR_CATEGORIES, fetchOnedaySubcategories, DEFAULT_ONEDAY_SUBCATEGORIES } from '../../lib/categories'

export default function TourList() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All')
  const [onedayOptions, setOnedayOptions] = useState<string[]>(['All', ...DEFAULT_ONEDAY_SUBCATEGORIES])

  useEffect(() => {
    fetchTours()
  }, [selectedCategory, selectedSubCategory])

  useEffect(() => {
    (async () => {
      try {
        const opts = await fetchOnedaySubcategories()
        if (Array.isArray(opts) && opts.length > 0) setOnedayOptions(['All', ...opts])
      } catch {}
    })()
  }, [])

  const fetchTours = async () => {
    try {
      let query = supabase
        .from('tours')
        .select('*')
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
      setTours(data || [])
    } catch (error) {
      console.error('Error fetching tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDragStart = (index: number) => { setDragIndex(index) }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault() }

  const onDrop = async (index: number) => {
    if (dragIndex === null) return
    const updated = [...tours]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)
    setTours(updated)
    setDragIndex(null)
    await saveOrder(updated)
  }

  const saveOrder = async (ordered: Tour[] = tours) => {
    try {
      const updates = ordered.map((t, i) => ({ id: t.id, display_order: i + 1 }))
      for (const u of updates) {
        const { error } = await supabase.from('tours').update({ display_order: u.display_order, updated_at: new Date().toISOString() }).eq('id', u.id)
        if (error) throw error
      }
      fetchTours()
    } catch (e) {
      console.error('Save order failed', e)
      alert('Failed to save order')
    }
  }

  const deleteTour = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTours()
    } catch (error) {
      console.error('Error deleting tour:', error)
      alert('Failed to delete tour')
    }
  }

  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let candidate = baseSlug
    let suffix = 2
    // Try candidate; if exists, append numeric suffix
    while (true) {
      const { data, error } = await supabase
        .from('tours')
        .select('id')
        .eq('slug', candidate)
        .limit(1)
      if (error) throw error
      if (!data || data.length === 0) return candidate
      candidate = `${baseSlug}-${suffix}`
      suffix += 1
    }
  }

  const duplicateTour = async (id: string) => {
    try {
      // Load original tour
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single()
      if (tourError) throw tourError

      // Prepare new title and unique slug
      const newTitle = `${tour.title} (Copy)`
      const baseSlug = (tour.slug || '').trim() ? `${tour.slug}-copy` : newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const newSlug = await ensureUniqueSlug(baseSlug)

      // Create duplicated tour
      const { data: created, error: createError } = await supabase
        .from('tours')
        .insert({
          title: newTitle,
          slug: newSlug,
          description: tour.description,
          itinerary_content: tour.itinerary_content,
          location: tour.location,
          duration: tour.duration,
          thumbnail_image: tour.thumbnail_image,
          category: tour.category,
          sub_category: tour.sub_category ?? null,
        })
        .select()
        .single()
      if (createError) throw createError

      const newId = created.id

      // Load related data in parallel
      const [{ data: gallery }, { data: prices }, { data: inclusions }] = await Promise.all([
        supabase.from('tour_gallery').select('*').eq('tour_id', id),
        supabase.from('tour_prices').select('*').eq('tour_id', id),
        supabase.from('tour_inclusions').select('*').eq('tour_id', id),
      ])

      // Insert related data
      if (gallery && gallery.length > 0) {
        await supabase
          .from('tour_gallery')
          .insert(gallery.map((g: any) => ({ tour_id: newId, image_url: g.image_url })))
      }
      if (prices && prices.length > 0) {
        await supabase
          .from('tour_prices')
          .insert(prices.map((p: any) => ({ tour_id: newId, label: p.label, price_idr: p.price_idr, price_usd: p.price_usd })))
      }
      if (inclusions && inclusions.length > 0) {
        await supabase
          .from('tour_inclusions')
          .insert(inclusions.map((i: any) => ({ tour_id: newId, item_text: i.item_text, is_included: i.is_included })))
      }

      alert('Tour duplicated successfully')
      fetchTours()
    } catch (error) {
      console.error('Error duplicating tour:', error)
      alert('Failed to duplicate tour')
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Manage Tours</h2>
        <Link
          to="/admin/tours/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Tour</span>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['All', ...TOUR_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full border ${selectedCategory === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      {selectedCategory === 'ONEDAY TOUR' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {onedayOptions.map((sc) => (
            <button
              key={sc}
              onClick={() => setSelectedSubCategory(sc)}
              className={`px-3 py-1 rounded-full border ${selectedSubCategory === sc ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              {sc}
            </button>
          ))}
        </div>
      )}

      {tours.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tours found</p>
          <Link to="/admin/tours/new" className="btn-primary">
            Create Your First Tour
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.map((tour, idx) => (
                <tr key={tour.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={onDragOver} onDrop={() => onDrop(idx)} className={'cursor-move'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                        src={tour.thumbnail_image}
                        alt={tour.title}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                        <div className="text-sm text-gray-500">{tour.slug}</div>
                        <div className="mt-2 flex space-x-2 md:hidden">
                          <Link
                            to={`/tour/${tour.slug}`}
                            target="_blank"
                            className="text-emerald-600 hover:text-emerald-900"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/tours/edit/${tour.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteTour(tour.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('tours')
                                  .update({ published: !tour.published, updated_at: new Date().toISOString() })
                                  .eq('id', tour.id)
                                if (error) throw error
                                fetchTours()
                              } catch (e) {
                                console.error('Toggle publish failed', e)
                                alert('Failed to toggle publish')
                              }
                            }}
                            className="text-emerald-700 hover:text-emerald-900"
                            title={tour.published ? 'Unpublish' : 'Publish'}
                          >
                            {tour.published ? 'Unpub' : 'Pub'}
                          </button>
                          <button
                            onClick={() => duplicateTour(tour.id)}
                            className="text-gray-700 hover:text-gray-900"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="ml-3 text-gray-400">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tour.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tour.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tour.sub_category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tour.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${tour.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {tour.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/tour/${tour.slug}`}
                        target="_blank"
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/tours/edit/${tour.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteTour(tour.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('tours')
                              .update({ published: !tour.published, updated_at: new Date().toISOString() })
                              .eq('id', tour.id)
                            if (error) throw error
                            fetchTours()
                          } catch (e) {
                            console.error('Toggle publish failed', e)
                            alert('Failed to toggle publish')
                          }
                        }}
                        className="text-emerald-700 hover:text-emerald-900"
                        title={tour.published ? 'Unpublish' : 'Publish'}
                      >
                        {tour.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => duplicateTour(tour.id)}
                        className="text-gray-700 hover:text-gray-900"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
