'use client'

import '@/lib/chartSetup'
import { Doughnut, Bar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import type { DashboardData } from '@/lib/parseData'
import { COLORS } from '@/lib/chartSetup'
import { useTheme } from '@/components/ThemeProvider'

function fmt(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

export default function Section4Payments({ data }: { data: DashboardData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'
  const tickColor   = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)'
  const legendColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)'
  const tooltipPlugin = {
    backgroundColor: isDark ? '#1a1d2e' : '#ffffff',
    borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
    titleColor: isDark ? '#ffffff' : '#0f172a',
    bodyColor:  isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
    padding: 10, cornerRadius: 8,
  }

  const paymentDonutData = {
    labels: data.paymentSplit.map(p => p.method),
    datasets: [{
      data: data.paymentSplit.map(p => p.revenue),
      backgroundColor: data.paymentSplit.map((_, i) => `${COLORS[i % COLORS.length]}cc`),
      borderColor: isDark ? '#0f1117' : '#f1f4f9',
      borderWidth: 3, hoverOffset: 8,
    }],
  }

  const legendLabels = { color: legendColor, usePointStyle: true, pointStyleWidth: 8, boxHeight: 6, padding: 16, font: { size: 12 } }

  const donutOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, cutout: '68%',
    plugins: {
      legend: { position: 'bottom' as const, labels: legendLabels },
      tooltip: {
        ...tooltipPlugin,
        callbacks: {
          label: (ctx: TooltipItem<'doughnut'>) => {
            const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0)
            const pct = total > 0 ? (((ctx.raw as number) / total) * 100).toFixed(1) : '0'
            return ` ${ctx.label ?? ''}: ${fmt(ctx.raw as number, '₹')} (${pct}%)`
          },
        },
      },
    },
  }

  const channelRevData = {
    labels: data.channelRevenue.map(c => c.channel),
    datasets: [{
      label: 'Revenue',
      data: data.channelRevenue.map(c => c.revenue),
      backgroundColor: [`${COLORS[0]}99`, `${COLORS[1]}99`],
      borderColor: [COLORS[0], COLORS[1]],
      borderWidth: 1, borderRadius: 8,
      yAxisID: 'y',
    }],
  }

  const channelOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipPlugin, callbacks: { label: (ctx: TooltipItem<'bar'>) => ` ${ctx.dataset.label ?? ''}: ${fmt(ctx.raw as number, '₹')}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } }, border: { color: 'transparent' } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: (v: string | number) => fmt(Number(v), '₹') }, border: { color: 'transparent' } },
    },
  }

  const discountData = {
    labels: data.discountByPayment.map(d => d.method),
    datasets: [{
      label: 'Avg. Discount per Order',
      data: data.discountByPayment.map(d => d.avgDiscount),
      backgroundColor: data.discountByPayment.map((_, i) => `${COLORS[i % COLORS.length]}77`),
      borderColor: data.discountByPayment.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 1, borderRadius: 6,
      hoverBackgroundColor: data.discountByPayment.map((_, i) => COLORS[i % COLORS.length]),
    }],
  }

  const discountOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipPlugin, callbacks: { label: (ctx: TooltipItem<'bar'>) => ` Avg. Discount: ${fmt(ctx.raw as number, '₹')}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } }, border: { color: 'transparent' } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: (v: string | number) => fmt(Number(v), '₹') }, border: { color: 'transparent' } },
    },
  }

  return (
    <section id="section4" className="section-anchor space-y-5 fade-in-up pb-20">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment &amp; Channel Behaviour</h2>
      </div>

      <div className="glass-card p-4 flex items-start gap-3 border-l-2 border-l-amber-400">
        <span className="text-amber-400 text-lg shrink-0">🤖</span>
        <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">{data.summary4}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Payment Method Split</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-5">Revenue share by payment type</p>
          <div className="h-72"><Doughnut data={paymentDonutData} options={donutOptions} /></div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Online vs In-store Revenue</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-5">Net revenue by purchase channel</p>
          <div className="h-64"><Bar data={channelRevData} options={channelOptions} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.channelRevenue.map((c, i) => (
              <div key={c.channel} className="bg-black/[0.02] dark:bg-white/[0.03] rounded-xl p-3 border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-gray-500 dark:text-white/50">{c.channel}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(c.revenue, '₹')}</p>
                <p className="text-xs text-gray-400 dark:text-white/35">{c.count.toLocaleString()} orders</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Avg. Discount by Payment Method</h3>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Average discount amount per order</p>
          </div>
          {data.topPaymentByAOV && (
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-white/35">Highest AOV method</p>
              <p className="text-sm font-semibold text-amber-500 dark:text-amber-400">
                {data.topPaymentByAOV} — {fmt(data.topPaymentAOV, '₹')} avg
              </p>
            </div>
          )}
        </div>
        <div className="h-56"><Bar data={discountData} options={discountOptions} /></div>
      </div>
    </section>
  )
}
