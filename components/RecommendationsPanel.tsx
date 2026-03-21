'use client'

import { useState } from 'react'

interface Rec { icon: string; text: string }

export default function RecommendationsPanel({ recommendations }: { recommendations: Rec[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="fixed bottom-0 left-60 right-0 z-40 transition-all duration-300 ease-in-out"
      style={{ transform: open ? 'translateY(0)' : 'translateY(calc(100% - 48px))' }}
    >
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full h-12 bg-[var(--bg-sidebar)] border-t border-[var(--border)] flex items-center justify-between px-6 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <span className="text-indigo-400">💡</span>
          Key Recommendations
          <span className="ml-1 text-[11px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">
            {recommendations.length}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Panel content */}
      <div className="bg-[var(--bg-sidebar)] border-t border-[var(--border)] px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl p-3 border border-[var(--border)] hover:border-indigo-500/20 transition-colors"
            >
              <span className="text-xl shrink-0 mt-0.5">{rec.icon}</span>
              <p className="text-sm text-gray-600 dark:text-white/65 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
