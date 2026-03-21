'use client'

import '@/lib/chartSetup'
import { Line } from 'react-chartjs-2'

interface KPICardProps {
  title: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  isGoodTrend: boolean
  trendLabel: string
  sparkline: number[]
  color: string
  delay?: number
}

export default function KPICard({
  title,
  value,
  trend,
  isGoodTrend,
  trendLabel,
  sparkline,
  color,
  delay = 0,
}: KPICardProps) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'
  const trendColor = trend === 'neutral'
    ? 'text-white/35'
    : isGoodTrend ? 'text-emerald-400' : 'text-red-400'

  const chartData = {
    labels: sparkline.map((_, i) => i.toString()),
    datasets: [
      {
        data: sparkline,
        borderColor: color,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: `${color}20`,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  }

  return (
    <div
      className="glass-card p-5 fade-in-up hover:scale-[1.01] transition-transform duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</span>
        {trendLabel && (
          <span className={`text-xs font-semibold ${trendColor} flex items-center gap-0.5`}>
            <span>{arrow}</span>
            <span>{trendLabel}</span>
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-3">{value}</p>
      <div className="h-10">
        {sparkline.length > 1 && <Line data={chartData} options={options} />}
      </div>
    </div>
  )
}
