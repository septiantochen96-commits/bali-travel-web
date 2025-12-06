import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'

export default function SubcategoryManager() {
  const [items, setItems] = useState<{id: string, name: string, display_order: number}[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('oneday_subcategories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
    setItems((data || []) as any)
    setLoading(false)
  }

  const add = async () => {
    const name = newName.trim()
    if (!name) return
    const nextOrder = (items[items.length - 1]?.display_order || 0) + 1
    const { data, error } = await supabase
      .from('oneday_subcategories')
      .insert({ name, display_order: nextOrder })
      .select()
      .single()
    if (!error && data) {
      setItems([...items, data])
      setNewName('')
    }
  }

  const remove = async (id: string) => {
    const { error } = await supabase
      .from('oneday_subcategories')
      .delete()
      .eq('id', id)
    if (!error) setItems(items.filter(i => i.id !== id))
  }

  const updateName = async (id: string, name: string) => {
    setItems(items.map(i => i.id === id ? { ...i, name } : i))
  }

  const saveAll = async () => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      await supabase
        .from('oneday_subcategories')
        .update({ name: it.name, display_order: i + 1, updated_at: new Date().toISOString() })
        .eq('id', it.id)
    }
    alert('Subcategories saved')
    load()
  }

  const onDragStart = (idx: number) => setDragIdx(idx)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const onDrop = (idx: number) => {
    if (dragIdx === null) return
    const arr = [...items]
    const [m] = arr.splice(dragIdx, 1)
    arr.splice(idx, 0, m)
    setItems(arr)
    setDragIdx(null)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900">ONEDAY TOUR Subcategories</h2>
        <button onClick={saveAll} className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Order</span>
        </button>
      </div>

      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Subcategory</label>
        <div className="flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field flex-1" placeholder="e.g., West Bali" />
          <button type="button" onClick={add} className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <ul>
            {items.map((it, idx) => (
              <li key={it.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={onDragOver} onDrop={() => onDrop(idx)} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <input value={it.name} onChange={(e) => updateName(it.id, e.target.value)} className="input-field" />
                </div>
                <button type="button" onClick={() => remove(it.id)} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

