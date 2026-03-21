'use client'

import '@/lib/chartSetup'
import { Bar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import DataTable from './DataTable'
import type { DashboardData } from '@/lib/parseData'
import { COLORS } from '@/lib/chartSetup'
import { useTheme } from '@/components/ThemeProvider'

function fmt(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

export default function Section2Products({ data }: { data: DashboardData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'
  const tickColor   = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)'
  const tooltipPlugin = {
    backgroundColor: isDark ? '#1a1d2e' : '#ffffff',
    borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
    titleColor: isDark ? '#ffffff' : '#0f172a',
    bodyColor:  isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
    padding: 10, cornerRadius: 8,
  }

  const topProdData = {
    labels: data.topProducts.map(p => p.name),
    datasets: [{
      label: 'Revenue',
      data: data.topProducts.map(p => p.revenue),
      backgroundColor: data.topProducts.map((_, i) => i === 0 ? `${COLORS[0]}dd` : `${COLORS[0]}66`),
      borderColor: data.topProducts.map((_, i) => i === 0 ? COLORS[0] : `${COLORS[0]}88`),
      borderWidth: 1, borderRadius: 6, borderSkipped: false,
      hoverBackgroundColor: COLORS[0],
    }],
  }

  const topProdOptions = {
    indexAxis: 'y' as const,
    responsive: true, maintainAspectRatio: false, animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipPlugin, callbacks: { label: (ctx: TooltipItem<'bar'>) => ` Revenue: ${fmt(ctx.raw as number, '₹')}` } },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: (v: string | number) => fmt(Number(v), '₹') }, border: { color: 'transparent' } },
      y: { grid: { display: false }, ticks: { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)', font: { size: 12 } }, border: { color: 'transparent' } },
    },
  }

  const retRateData = {
    labels: data.categoryReturnRates.map(c => c.category),
    datasets: [{
      label: 'Return Rate %',
      data: data.categoryReturnRates.map(c => c.returnRate),
      backgroundColor: data.categoryReturnRates.map(c => c.returnRate > 30 ? '#ef444488' : `${COLORS[1]}66`),
      borderColor:     data.categoryReturnRates.map(c => c.returnRate > 30 ? '#ef4444' : COLORS[1]),
      borderWidth: 1, borderRadius: 6,
      hoverBackgroundColor: data.categoryReturnRates.map(c => c.returnRate > 30 ? '#ef4444' : COLORS[1]),
    }],
  }

  const retRateOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipPlugin,
        callbacks: {
          label:      (ctx: TooltipItem<'bar'>) => ` Return Rate: ${(ctx.raw as number).toFixed(1)}%`,
          afterLabel: (ctx: TooltipItem<'bar'>) => (ctx.raw as number) > 30 ? ' ⚠️ Above 30% threshold' : '',
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } }, border: { color: 'transparent' } },
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 11 }, callback: (v: string | number) => `${Number(v).toFixed(0)}%` },
        border: { color: 'transparent' },
        max: Math.ceil(Math.max(...data.categoryReturnRates.map(c => c.returnRate)) / 10) * 10 + 5,
      },
    },
  }

  return (
    <section id="section2" className="section-anchor space-y-5 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-violet-500 to-pink-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Performance</h2>
      </div>

      <div className="glass-card p-4 flex items-start gap-3 border-l-2 border-l-violet-500">
        <span className="text-violet-400 text-lg shrink-0">🤖</span>
        <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">{data.summary2}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Top 10 Products by Revenue</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-5">Ranked by net revenue generated</p>
          <div className="h-80"><Bar data={topProdData} options={topProdOptions} /></div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Return Rate by Category</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              Red = above 30% threshold
            </span>
          </p>
          <div className="h-64"><Bar data={retRateData} options={retRateOptions} /></div>
          {data.highReturnCategory && data.highReturnCategoryRate > 30 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-500 dark:text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
              <span>⚠️</span>
              <span><strong>{data.highReturnCategory}</strong> has a {data.highReturnCategoryRate.toFixed(0)}% return rate — review product quality or descriptions.</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Category Breakdown</h3>
        <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5 mb-4">Click any column header to sort</p>
        <DataTable data={data.categoryTable} />
      </div>
    </section>
  )
}
