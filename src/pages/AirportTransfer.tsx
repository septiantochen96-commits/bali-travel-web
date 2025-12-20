import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

  useEffect(() => { (async () => {
    const { data } = await supabase.from('airport_transfers').select('*').order('display_order', { ascending: true }).order('destination', { ascending: true })
    setRows((data || []) as Transfer[])
    setLoading(false)
  })() }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const f = (n: number) => new Intl.NumberFormat('id-ID').format(n)

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Bali Airport Transfer Prices - Bali Voyager Co"
        description="Check our competitive rates for airport transfers in Bali. SUV, Elf, and Bus options available for all destinations."
        url="/airport-transfer"
      />
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-800 text-center mb-8">Airport Transfer Prices</h1>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-emerald-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white tracking-wider">SUV (IDR)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white tracking-wider">ELF (IDR)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white tracking-wider">BUS (IDR)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{r.destination}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">IDR {f(r.suv_price_idr)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">IDR {f(r.elf_price_idr)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">IDR {f(r.bus_price_idr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
