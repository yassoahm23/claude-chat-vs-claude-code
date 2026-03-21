'use client'

import '@/lib/chartSetup'
import { Doughnut, Bar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import type { DashboardData } from '@/lib/parseData'
import { COLORS, GRID_COLOR, TICK_COLOR } from '@/lib/chartSetup'

function fmt(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

export default function Section3Customers({ data }: { data: DashboardData }) {
  // Gender donut
  const genderData = {
    labels: data.revenueByGender.map(g => g.gender),
    datasets: [
      {
        data: data.revenueByGender.map(g => g.revenue),
        backgroundColor: [COLORS[0], COLORS[2], COLORS[4]],
        borderColor: ['#0f1117'],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900 },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255,255,255,0.55)',
          usePointStyle: true,
          pointStyleWidth: 8,
          boxHeight: 6,
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'doughnut'>) => {
            const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0)
            const pct = total > 0 ? (((ctx.raw as number) / total) * 100).toFixed(1) : '0'
            return ` ${ctx.label ?? ''}: ${fmt(ctx.raw as number, '₹')} (${pct}%)`
          },
        },
      },
    },
    cutout: '68%',
  }

  // Age group bar
  const ageData = {
    labels: data.revenueByAgeGroup.map(g => g.group),
    datasets: [
      {
        label: 'Revenue',
        data: data.revenueByAgeGroup.map(g => g.revenue),
        backgroundColor: data.revenueByAgeGroup.map((_, i) => `${COLORS[i % COLORS.length]}88`),
        borderColor: data.revenueByAgeGroup.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: data.revenueByAgeGroup.map((_, i) => COLORS[i % COLORS.length]),
      },
    ],
  }

  // City revenue bar
  const cityData = {
    labels: data.revenueByCity.map(c => c.city),
    datasets: [
      {
        label: 'Revenue',
        data: data.revenueByCity.map(c => c.revenue),
        backgroundColor: data.revenueByCity.map((_, i) =>
          i === 0 ? `${COLORS[0]}dd` : `${COLORS[0]}55`
        ),
        borderColor: data.revenueByCity.map((_, i) =>
          i === 0 ? COLORS[0] : `${COLORS[0]}88`
        ),
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: COLORS[0],
      },
    ],
  }

  // Stacked bar: online vs in-store per city
  const stackedData = {
    labels: data.channelByCity.map(c => c.city),
    datasets: [
      {
        label: 'Online',
        data: data.channelByCity.map(c => c.online),
        backgroundColor: `${COLORS[0]}99`,
        borderColor: COLORS[0],
        borderWidth: 1,
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
        stack: 'city',
      },
      {
        label: 'In-store',
        data: data.channelByCity.map(c => c.inStore),
        backgroundColor: `${COLORS[1]}99`,
        borderColor: COLORS[1],
        borderWidth: 1,
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
        stack: 'city',
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) =>
            ` ${ctx.dataset.label ?? ''}: ${fmt(ctx.raw as number, '₹')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: TICK_COLOR, font: { size: 11 } },
        border: { color: 'transparent' },
      },
      y: {
        grid: { color: GRID_COLOR },
        ticks: {
          color: TICK_COLOR,
          font: { size: 11 },
          callback: (v: string | number) => fmt(Number(v), '₹'),
        },
        border: { color: 'transparent' },
      },
    },
  }

  const stackedOptions = {
    ...barOptions,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      ...barOptions.plugins,
      legend: {
        labels: {
          color: 'rgba(255,255,255,0.55)',
          usePointStyle: true,
          pointStyleWidth: 8,
          boxHeight: 6,
          font: { size: 12 },
        },
      },
    },
    scales: {
      ...barOptions.scales,
      x: { ...barOptions.scales.x, stacked: true },
      y: { ...barOptions.scales.y, stacked: true },
    },
  }

  return (
    <section id="section3" className="section-anchor space-y-5 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-cyan-500 to-teal-500" />
        <h2 className="text-xl font-bold text-white">Customer Segments</h2>
      </div>

      {/* AI Summary */}
      <div className="glass-card p-4 flex items-start gap-3 border-l-2 border-l-cyan-500">
        <span className="text-cyan-400 text-lg shrink-0">🤖</span>
        <p className="text-sm text-white/70 leading-relaxed">{data.summary3}</p>
      </div>

      {/* Row 1: Gender donut + Age group bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-1">Revenue by Gender</h3>
          <p className="text-xs text-white/40 mb-5">Share of total net revenue</p>
          <div className="h-64">
            <Doughnut data={genderData} options={donutOptions} />
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-1">Revenue by Age Group</h3>
          <p className="text-xs text-white/40 mb-5">Net revenue across customer age bands</p>
          <div className="h-64">
            <Bar data={ageData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: City revenue + stacked channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-1">Revenue by City</h3>
          <p className="text-xs text-white/40 mb-5">Top cities ranked by net revenue</p>
          <div className="h-64">
            <Bar data={cityData} options={barOptions} />
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-1">Online vs In-store by City</h3>
          <p className="text-xs text-white/40 mb-5">Channel split per city</p>
          <div className="h-64">
            <Bar data={stackedData} options={stackedOptions} />
          </div>
        </div>
      </div>
    </section>
  )
}
