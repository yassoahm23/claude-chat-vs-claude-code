'use client'

import '@/lib/chartSetup'
import { Line } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import KPICard from './KPICard'
import type { DashboardData } from '@/lib/parseData'
import { COLORS } from '@/lib/chartSetup'
import { useTheme } from '@/components/ThemeProvider'

function fmt(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

export default function Section1Revenue({ data }: { data: DashboardData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'
  const tickColor   = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)'
  const legendColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)'
  const tooltipPlugin = {
    backgroundColor: isDark ? '#1a1d2e' : '#ffffff',
    borderColor: 'rgba(99,102,241,0.4)',
    borderWidth: 1,
    titleColor: isDark ? '#ffffff' : '#0f172a',
    bodyColor:  isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
    padding: 10,
    cornerRadius: 8,
  }

  const { totalRevenue, avgOrderValue, totalTransactions, returnRate } = data

  const lineData = {
    labels: data.monthlyRevenue.map(m => m.month),
    datasets: [
      {
        label: 'Gross Revenue',
        data: data.monthlyRevenue.map(m => m.gross),
        borderColor: COLORS[0],
        backgroundColor: `${COLORS[0]}18`,
        fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
        pointBackgroundColor: COLORS[0], borderWidth: 2,
      },
      {
        label: 'Net Revenue',
        data: data.monthlyRevenue.map(m => m.net),
        borderColor: COLORS[3],
        backgroundColor: `${COLORS[3]}18`,
        fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
        pointBackgroundColor: COLORS[3], borderWidth: 2,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 1000 },
    plugins: {
      legend: { labels: { color: legendColor, usePointStyle: true, pointStyleWidth: 8, boxHeight: 6, font: { size: 12 } } },
      tooltip: { ...tooltipPlugin, callbacks: { label: (ctx: TooltipItem<'line'>) => ` ${ctx.dataset.label ?? ''}: ${fmt(ctx.raw as number, '₹')}` } },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor, maxTicksLimit: 12, font: { size: 11 } }, border: { color: 'transparent' } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: (v: string | number) => fmt(Number(v), '₹') }, border: { color: 'transparent' } },
    },
  }

  return (
    <section id="section1" className="section-anchor space-y-5 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue &amp; Sales Overview</h2>
      </div>

      <div className="glass-card p-4 flex items-start gap-3 border-l-2 border-l-indigo-500">
        <span className="text-indigo-400 text-lg shrink-0">🤖</span>
        <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">{data.summary1}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue"      value={fmt(totalRevenue.value, '₹')}           trend={totalRevenue.trend}      isGoodTrend={totalRevenue.trend === 'up'}      trendLabel={totalRevenue.trendLabel}      sparkline={totalRevenue.sparkline}      color={COLORS[0]} delay={0}   />
        <KPICard title="Avg. Order Value"   value={fmt(avgOrderValue.value, '₹')}          trend={avgOrderValue.trend}     isGoodTrend={avgOrderValue.trend === 'up'}     trendLabel={avgOrderValue.trendLabel}     sparkline={avgOrderValue.sparkline}     color={COLORS[2]} delay={80}  />
        <KPICard title="Total Transactions" value={totalTransactions.value.toLocaleString()} trend={totalTransactions.trend} isGoodTrend={totalTransactions.trend === 'up'} trendLabel={totalTransactions.trendLabel} sparkline={totalTransactions.sparkline} color={COLORS[3]} delay={160} />
        <KPICard title="Return Rate"        value={`${returnRate.value.toFixed(1)}%`}       trend={returnRate.trend}        isGoodTrend={returnRate.trend === 'up'}        trendLabel={returnRate.trendLabel}        sparkline={returnRate.sparkline}        color={COLORS[5]} delay={240} />
      </div>

      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl shrink-0">📉</div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Discount Leakage</p>
            <p className="text-xs text-gray-400 dark:text-white/45 mt-0.5">Total discount value given away to customers</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{fmt(data.discountLeakage, '₹')}</p>
            <p className="text-xs text-gray-400 dark:text-white/40">Total discounts</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-500 dark:text-red-400">{data.discountLeakagePct.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 dark:text-white/40">of gross revenue</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Revenue</h3>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Gross vs net revenue after discounts</p>
          </div>
          {data.bestMonth && (
            <div className="flex gap-4 text-xs text-right">
              <div>
                <span className="text-gray-400 dark:text-white/35 block">Best month</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{data.bestMonth}</span>
              </div>
              {data.worstMonth && data.worstMonth !== data.bestMonth && (
                <div>
                  <span className="text-gray-400 dark:text-white/35 block">Weakest month</span>
                  <span className="text-red-500 dark:text-red-400 font-semibold">{data.worstMonth}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="h-72">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </section>
  )
}
