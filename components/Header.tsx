'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const RANGES = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: 'all', label: 'All Time' },
]

interface HeaderProps {
  availableCities: string[]
  selectedCity: string
  selectedRange: string
}

export default function Header({ availableCities, selectedCity, selectedRange }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <header className="shrink-0 bg-[#1a1d2e] border-b border-[rgba(255,255,255,0.07)] px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Retail Business Intelligence
        </h1>
        <p className="text-xs text-white/35 mt-0.5">
          Interactive analytics across revenue, products, customers &amp; payments
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/35 whitespace-nowrap">Period</label>
          <select
            value={selectedRange}
            onChange={e => updateParam('range', e.target.value)}
            className="bg-[#0f1117] border border-[rgba(255,255,255,0.1)] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/60 cursor-pointer hover:border-indigo-500/40 transition-colors"
          >
            {RANGES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/35 whitespace-nowrap">City</label>
          <select
            value={selectedCity}
            onChange={e => updateParam('city', e.target.value)}
            className="bg-[#0f1117] border border-[rgba(255,255,255,0.1)] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/60 cursor-pointer hover:border-indigo-500/40 transition-colors"
          >
            <option value="all">All Cities</option>
            {availableCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Active filter badges */}
        {(selectedRange !== 'all' || selectedCity !== 'all') && (
          <button
            onClick={() => router.push('/')}
            className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Reset filters
          </button>
        )}
      </div>
    </header>
  )
}
