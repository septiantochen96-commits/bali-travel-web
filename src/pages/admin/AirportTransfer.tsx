import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Save, Trash2 } from 'lucide-react'

type Transfer = {
  id: string
  destination: string
  suv_price_idr: number
  elf_price_idr: number
  bus_price_idr: number
  display_order?: number
}

export default function AirportTransfer() {
  const [rows, setRows] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newDest, setNewDest] = useState('')
  const [newPrice, setNewPrice] = useState<number>(0)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('airport_transfers').select('*').order('display_order', { ascending: true }).order('destination', { ascending: true })
    setRows((data || []) as Transfer[])
    setLoading(false)
  }

  const updateRow = (index: number, field: keyof Transfer, value: any) => {
    const updated = [...rows]
    const row = { ...updated[index] } as any
    row[field] = value
    if (field === 'suv_price_idr') {
      row.elf_price_idr = Number(value) + 300000
      row.bus_price_idr = Number(value) + 600000
    }
    updated[index] = row
    setRows(updated)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      for (const r of rows) {
        const { error } = await supabase
          .from('airport_transfers')
          .update({
            destination: r.destination,
            suv_price_idr: r.suv_price_idr,
            elf_price_idr: r.elf_price_idr,
            bus_price_idr: r.bus_price_idr,
            display_order: r.display_order ?? null,
            updated_at: new Date().toISOString()
          })
          .eq('id', r.id)
        if (error) throw error
      }
      alert('Prices saved')
    } catch (e) {
      console.error('Save failed', e)
      alert('Failed to save')
    } finally { setSaving(false) }
  }

  const addNew = async () => {
    if (!newDest || !newPrice) return
    const { error } = await supabase.from('airport_transfers').insert({
      destination: newDest,
      suv_price_idr: newPrice,
      elf_price_idr: newPrice + 300000,
      bus_price_idr: newPrice + 600000,
      display_order: (rows.length + 1)
    })
    if (error) { alert('Failed to add'); return }
    setNewDest(''); setNewPrice(0); load()
  }

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const onDragStart = (index: number) => setDragIndex(index)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = async (index: number) => {
    if (dragIndex === null) return
    const updated = [...rows]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)
    // reassign display_order
    const withOrder = updated.map((r, i) => ({ ...r, display_order: i + 1 }))
    setRows(withOrder)
    setDragIndex(null)
    // persist
    try {
      for (const r of withOrder) {
        const { error } = await supabase.from('airport_transfers').update({ display_order: r.display_order, updated_at: new Date().toISOString() }).eq('id', r.id)
        if (error) throw error
      }
    } catch (e) {
      console.error('Order save failed', e)
      alert('Failed to save order')
    }
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Delete this destination?')) return
    try {
      const { error } = await supabase.from('airport_transfers').delete().eq('id', id)
      if (error) throw error
      await load()
    } catch (e) {
      console.error('Delete failed', e)
      alert('Failed to delete destination')
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
        <h2 className="text-2xl font-serif font-bold text-gray-900">Airport Transfer Prices</h2>
        <button onClick={saveAll} disabled={saving} className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={newDest} onChange={(e) => setNewDest(e.target.value)} placeholder="Destination" className="input-field" />
          <input type="number" value={newPrice || ''} onChange={(e) => setNewPrice(parseInt(e.target.value || '0', 10))} placeholder="SUV price IDR" className="input-field" />
          <button onClick={addNew} className="btn-secondary flex items-center justify-center space-x-2"><Plus className="h-4 w-4" /><span>Add</span></button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUV (IDR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ELF (IDR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BUS (IDR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r, i) => (
              <tr key={r.id} draggable onDragStart={() => onDragStart(i)} onDragOver={onDragOver} onDrop={() => onDrop(i)} className="cursor-move">
                <td className="px-6 py-3 text-sm text-gray-900">
                  <input value={r.destination} onChange={(e) => updateRow(i, 'destination', e.target.value)} className="input-field" />
                </td>
                <td className="px-6 py-3 text-sm text-gray-900">
                  <input type="number" value={r.suv_price_idr} onChange={(e) => updateRow(i, 'suv_price_idr', parseInt(e.target.value || '0', 10))} className="input-field" />
                </td>
                <td className="px-6 py-3 text-sm text-gray-900">
                  <input type="number" value={r.elf_price_idr} onChange={(e) => updateRow(i, 'elf_price_idr', parseInt(e.target.value || '0', 10))} className="input-field" />
                </td>
                <td className="px-6 py-3 text-sm text-gray-900">
                  <input type="number" value={r.bus_price_idr} onChange={(e) => updateRow(i, 'bus_price_idr', parseInt(e.target.value || '0', 10))} className="input-field" />
                </td>
                <td className="px-6 py-3 text-sm text-gray-900">
                  <button onClick={() => deleteRow(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
