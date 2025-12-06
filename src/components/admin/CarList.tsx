import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Edit, Trash2, Plus, Copy, GripVertical } from 'lucide-react'

type CarRental = {
  id: string
  title: string
  image_url: string
  price_idr: string
  price_usd: string | null
  price_original_idr: string | null
  available: boolean
  capacity_text: string | null
}

export default function CarList() {
  const [cars, setCars] = useState<CarRental[]>([])
  const [loading, setLoading] = useState(true)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => { fetchCars() }, [])

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('car_rentals')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setCars(data || [])
    } catch (e) {
      console.error('Error fetching cars', e)
    } finally {
      setLoading(false)
    }
  }

  const duplicateCar = async (id: string) => {
    try {
      const { data } = await supabase.from('car_rentals').select('*').eq('id', id).single()
      if (!data) return
      const copyTitle = `${data.title} (Copy)`
      const { error } = await supabase.from('car_rentals').insert({
        title: copyTitle,
        image_url: data.image_url,
        price_idr: data.price_idr,
        price_usd: data.price_usd,
        price_original_idr: data.price_original_idr,
        available: data.available,
        capacity_text: data.capacity_text,
        display_order: (cars.length + 1)
      })
      if (error) throw error
      fetchCars()
    } catch (e) {
      console.error('Error duplicating car', e)
      alert('Failed to duplicate vehicle')
    }
  }

  const onDragStart = (index: number) => setDragIndex(index)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = async (index: number) => {
    if (dragIndex === null) return
    const updated = [...cars]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)
    const withOrder = updated.map((c, i) => ({ ...c, display_order: i + 1 }))
    setCars(withOrder)
    setDragIndex(null)
    try {
      for (const c of withOrder) {
        const { error } = await supabase.from('car_rentals').update({ display_order: c.display_order, updated_at: new Date().toISOString() }).eq('id', c.id)
        if (error) throw error
      }
    } catch (e) {
      console.error('Failed to save order', e)
      alert('Failed to save order')
    }
  }

  const deleteCar = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return
    try {
      const { error } = await supabase.from('car_rentals').delete().eq('id', id)
      if (error) throw error
      fetchCars()
    } catch (e) {
      console.error('Error deleting car', e)
      alert('Failed to delete vehicle')
    }
  }

  const toggleAvailable = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('car_rentals')
        .update({ available: !current, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      fetchCars()
    } catch (e) {
      console.error('Error toggling availability', e)
      alert('Failed to toggle availability')
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
        <h2 className="text-2xl font-serif font-bold text-gray-900">Manage Car Rentals</h2>
        <Link to="/admin/cars/new" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No vehicles found</p>
          <Link to="/admin/cars/new" className="btn-primary">Add Your First Vehicle</Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.map((car, idx) => (
                <tr key={car.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={onDragOver} onDrop={() => onDrop(idx)} className="cursor-move">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-16 rounded-lg object-cover mr-3" src={car.image_url} alt={car.title} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{car.title}</div>
                        <div className="mt-2 flex space-x-2 md:hidden">
                          <Link to={`/admin/cars/edit/${car.id}`} className="text-blue-600 hover:text-blue-900" title="Edit">Edit</Link>
                          <button onClick={() => deleteCar(car.id)} className="text-red-600 hover:text-red-900" title="Delete">Delete</button>
                          <button onClick={() => toggleAvailable(car.id, car.available)} className="text-emerald-700 hover:text-emerald-900" title="Toggle">
                            {car.available ? 'Mark Unavailable' : 'Mark Available'}
                          </button>
                        </div>
                      </div>
                      <div className="ml-3 text-gray-400"><GripVertical className="h-5 w-5" /></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.price_idr ? `IDR ${car.price_idr}` : (car.price_usd ? `$${car.price_usd}` : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.capacity_text}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${car.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{car.available ? 'Available' : 'Unavailable'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link to={`/admin/cars/edit/${car.id}`} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => deleteCar(car.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                      <button onClick={() => duplicateCar(car.id)} className="text-gray-700 hover:text-gray-900" title="Duplicate"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => toggleAvailable(car.id, car.available)} className="text-emerald-700 hover:text-emerald-900">{car.available ? 'Mark Unavailable' : 'Mark Available'}</button>
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
