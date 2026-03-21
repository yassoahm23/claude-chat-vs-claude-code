import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Global dark-mode defaults
Chart.defaults.color = 'rgba(255,255,255,0.5)'
Chart.defaults.font.family = 'Inter, sans-serif'
Chart.defaults.plugins.tooltip.backgroundColor = '#1a1d2e'
Chart.defaults.plugins.tooltip.borderColor = 'rgba(99,102,241,0.4)'
Chart.defaults.plugins.tooltip.borderWidth = 1
Chart.defaults.plugins.tooltip.titleColor = '#fff'
Chart.defaults.plugins.tooltip.bodyColor = 'rgba(255,255,255,0.7)'
Chart.defaults.plugins.tooltip.padding = 10
Chart.defaults.plugins.tooltip.cornerRadius = 8

export const COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16',
]

export const GRID_COLOR = 'rgba(255,255,255,0.05)'
export const TICK_COLOR = 'rgba(255,255,255,0.45)'

export const baseScales = {
  x: {
    grid: { color: GRID_COLOR },
    ticks: { color: TICK_COLOR },
    border: { color: 'transparent' },
  },
  y: {
    grid: { color: GRID_COLOR },
    ticks: { color: TICK_COLOR },
    border: { color: 'transparent' },
  },
}
