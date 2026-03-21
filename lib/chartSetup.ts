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
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

// ── Do NOT set Chart.defaults colors here — colors are theme-derived per component ──

export const COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16',
]
