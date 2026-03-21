'use client'

import { useState } from 'react'
import type { CategoryData } from '@/lib/parseData'

type SortKey = keyof CategoryData
type SortDir = 'asc' | 'desc'

function fmt(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

export default function DataTable({ data }: { data: CategoryData[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number
    const bv = b[sortKey] as number
    return sortDir === 'desc' ? bv - av : av - bv
  })

  const cols: { key: SortKey; label: string; render: (row: CategoryData) => string }[] = [
    { key: 'category', label: 'Category', render: r => r.category },
    { key: 'revenue', label: 'Total Revenue', render: r => fmt(r.revenue, '₹') },
    { key: 'units', label: 'Units Sold', render: r => r.units.toLocaleString() },
    { key: 'avgPrice', label: 'Avg. Price', render: r => fmt(r.avgPrice, '₹') },
    { key: 'returnRate', label: 'Return %', render: r => `${r.returnRate.toFixed(1)}%` },
  ]

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.06)]">
            {cols.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-white/40 cursor-pointer hover:text-white/70 select-none transition-colors whitespace-nowrap"
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-indigo-400">{sortDir === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.category}
              className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.03] transition-colors"
            >
              {cols.map(col => (
                <td key={col.key} className="py-3 px-4">
                  {col.key === 'returnRate' ? (
                    <span
                      className={`font-medium ${
                        row.returnRate > 30 ? 'text-red-400' : 'text-white/80'
                      }`}
                    >
                      {col.render(row)}
                      {row.returnRate > 30 && (
                        <span className="ml-1.5 text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">
                          HIGH
                        </span>
                      )}
                    </span>
                  ) : col.key === 'category' ? (
                    <span className="font-medium text-white">{col.render(row)}</span>
                  ) : (
                    <span className="text-white/70">{col.render(row)}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
