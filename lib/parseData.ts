import fs from 'fs'
import path from 'path'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface KPIData {
  value: number
  prev: number
  trend: 'up' | 'down' | 'neutral'
  trendLabel: string
  sparkline: number[]
}

export interface MonthlyRevenue {
  month: string
  gross: number
  net: number
}

export interface CategoryData {
  category: string
  revenue: number
  units: number
  avgPrice: number
  returnRate: number
}

export interface DashboardData {
  // KPIs
  totalRevenue: KPIData
  avgOrderValue: KPIData
  totalTransactions: KPIData
  returnRate: KPIData
  // Section 1
  monthlyRevenue: MonthlyRevenue[]
  discountLeakage: number
  discountLeakagePct: number
  bestMonth: string
  worstMonth: string
  // Section 2
  topProducts: { name: string; revenue: number; category: string }[]
  categoryReturnRates: { category: string; returnRate: number }[]
  categoryTable: CategoryData[]
  highReturnCategory: string
  highReturnCategoryRate: number
  // Section 3
  revenueByGender: { gender: string; revenue: number }[]
  revenueByAgeGroup: { group: string; revenue: number }[]
  revenueByCity: { city: string; revenue: number }[]
  channelByCity: { city: string; online: number; inStore: number }[]
  topSegmentSummary: string
  // Section 4
  paymentSplit: { method: string; revenue: number; count: number }[]
  channelRevenue: { channel: string; revenue: number; count: number }[]
  discountByPayment: { method: string; avgDiscount: number }[]
  topPaymentByAOV: string
  topPaymentAOV: number
  // Meta
  availableCities: string[]
  selectedCity: string
  selectedRange: string
  maxDate: string
  // AI Summaries
  summary1: string
  summary2: string
  summary3: string
  summary4: string
  recommendations: { icon: string; text: string }[]
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const record: Record<string, string> = {}
    headers.forEach((h, i) => {
      record[h] = (values[i] || '').trim().replace(/\r/g, '')
    })
    return record
  })
}

function parseDDMMYYYY(str: string): Date | null {
  try {
    const parts = str.split('-')
    if (parts.length !== 3) return null
    const [dd, mm, yyyy] = parts
    const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd))
    if (isNaN(d.getTime())) return null
    return d
  } catch {
    return null
  }
}

function fmtYM(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function fmtMonthLabel(ym: string): string {
  const [yyyy, mm] = ym.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(mm) - 1]} ${yyyy}`
}

function getAgeGroup(age: number): string {
  if (age <= 25) return '18–25'
  if (age <= 35) return '26–35'
  if (age <= 50) return '36–50'
  return '50+'
}

function computeTrendLabel(curr: number, prev: number, hasPrev: boolean): string {
  if (!hasPrev || prev === 0) return ''
  const pct = ((curr - prev) / prev) * 100
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function parseData(
  rangeParam = 'all',
  cityParam = 'all'
): DashboardData {
  const dataDir = path.join(process.cwd(), 'data')

  const txRaw = parseCSV(fs.readFileSync(path.join(dataDir, 'transactions.csv'), 'utf-8'))
  const custRaw = parseCSV(fs.readFileSync(path.join(dataDir, 'customers.csv'), 'utf-8'))

  // Customer lookup map
  const custMap = new Map<number, Record<string, string>>()
  custRaw.forEach(c => custMap.set(parseInt(c.Customer_ID), c))

  // Parse and join
  interface Rec {
    date: Date
    month: string
    category: string
    product: string
    units: number
    price: number
    discounts: number
    returned: boolean
    payment: string
    channel: string
    revenue: number
    gross: number
    discountAmt: number
    age: number
    gender: string
    location: string
    ageGroup: string
  }

  const allRecs: Rec[] = []
  for (const tx of txRaw) {
    const cust = custMap.get(parseInt(tx.Customer_ID))
    if (!cust) continue
    const date = parseDDMMYYYY(tx.Date_of_Purchase)
    if (!date) continue
    const price = parseFloat(tx.Price) || 0
    const discounts = parseFloat(tx.Discounts) || 0
    const units = parseInt(tx.Units) || 1
    const age = parseInt(cust.Age) || 25
    allRecs.push({
      date,
      month: fmtYM(date),
      category: tx.Product_Category,
      product: tx.Product_Name,
      units,
      price,
      discounts,
      returned: tx.Returned === 'TRUE',
      payment: tx.Mode_of_Payment,
      channel: tx.Purchase_Channel,
      revenue: (price - discounts) * units,
      gross: price * units,
      discountAmt: discounts * units,
      age,
      gender: cust.Gender,
      location: cust.Location,
      ageGroup: getAgeGroup(age),
    })
  }

  const availableCities = [...new Set(allRecs.map(r => r.location))].sort()

  // Max date as "current" reference
  const maxDate = allRecs.reduce((m, r) => r.date > m ? r.date : m, allRecs[0].date)

  // Date range cutoff
  let cutoff: Date | null = null
  if (rangeParam === '30d') cutoff = new Date(maxDate.getTime() - 30 * 86400000)
  else if (rangeParam === '90d') cutoff = new Date(maxDate.getTime() - 90 * 86400000)
  else if (rangeParam === '6m') cutoff = new Date(maxDate.getTime() - 180 * 86400000)

  // Prior period for trend comparison
  let prevCutoff: Date | null = null
  let prevEnd: Date | null = null
  if (cutoff) {
    const span = maxDate.getTime() - cutoff.getTime()
    prevEnd = new Date(cutoff.getTime() - 1)
    prevCutoff = new Date(cutoff.getTime() - span)
  }

  function filter(recs: Rec[], from: Date | null, to: Date | null, city: string): Rec[] {
    return recs.filter(r => {
      if (from && r.date < from) return false
      if (to && r.date > to) return false
      if (city !== 'all' && r.location !== city) return false
      return true
    })
  }

  const curr = filter(allRecs, cutoff, null, cityParam)
  const prev = (cutoff && prevCutoff && prevEnd)
    ? filter(allRecs, prevCutoff, prevEnd, cityParam)
    : []
  const hasPrev = prev.length > 0

  // ── KPI computation ──────────────────────────────────────────────────────────
  function kpis(recs: Rec[]) {
    const rev = recs.reduce((s, r) => s + r.revenue, 0)
    const tx = recs.length
    const aov = tx > 0 ? rev / tx : 0
    const ret = recs.filter(r => r.returned).length
    const rr = tx > 0 ? (ret / tx) * 100 : 0
    return { rev, tx, aov, rr }
  }
  const cK = kpis(curr)
  const pK = kpis(prev)

  function trend(c: number, p: number): 'up' | 'down' | 'neutral' {
    if (!hasPrev) return 'neutral'
    return c > p ? 'up' : c < p ? 'down' : 'neutral'
  }

  // Sparklines: monthly buckets within current range
  const mRevMap = new Map<string, { rev: number; tx: number; ret: number; gross: number }>()
  curr.forEach(r => {
    const e = mRevMap.get(r.month) || { rev: 0, tx: 0, ret: 0, gross: 0 }
    mRevMap.set(r.month, {
      rev: e.rev + r.revenue,
      tx: e.tx + 1,
      ret: e.ret + (r.returned ? 1 : 0),
      gross: e.gross + r.gross,
    })
  })
  const sortedMonths = [...mRevMap.keys()].sort()
  const revSparkline = sortedMonths.map(m => mRevMap.get(m)!.rev)
  const txSparkline = sortedMonths.map(m => mRevMap.get(m)!.tx)
  const aovSparkline = sortedMonths.map(m => {
    const e = mRevMap.get(m)!
    return e.tx > 0 ? e.rev / e.tx : 0
  })
  const rrSparkline = sortedMonths.map(m => {
    const e = mRevMap.get(m)!
    return e.tx > 0 ? (e.ret / e.tx) * 100 : 0
  })

  // ── Section 1: Monthly revenue ───────────────────────────────────────────────
  const monthlyRevenue: MonthlyRevenue[] = sortedMonths.map(m => ({
    month: fmtMonthLabel(m),
    gross: mRevMap.get(m)!.gross,
    net: mRevMap.get(m)!.rev,
  }))

  const discountLeakage = curr.reduce((s, r) => s + r.discountAmt, 0)
  const grossTotal = curr.reduce((s, r) => s + r.gross, 0)
  const discountLeakagePct = grossTotal > 0 ? (discountLeakage / grossTotal) * 100 : 0

  const monthNetList = sortedMonths.map(m => ({ m, net: mRevMap.get(m)!.rev }))
  const bestMonthEntry = monthNetList.length > 0
    ? monthNetList.reduce((a, b) => a.net > b.net ? a : b)
    : null
  const worstMonthEntry = monthNetList.length > 0
    ? monthNetList.reduce((a, b) => a.net < b.net ? a : b)
    : null

  // ── Section 2: Products ───────────────────────────────────────────────────────
  const productMap = new Map<string, { revenue: number; category: string }>()
  curr.forEach(r => {
    const e = productMap.get(r.product) || { revenue: 0, category: r.category }
    productMap.set(r.product, { revenue: e.revenue + r.revenue, category: r.category })
  })
  const topProducts = [...productMap.entries()]
    .map(([name, v]) => ({ name, revenue: v.revenue, category: v.category }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const catMap = new Map<string, { rev: number; units: number; gross: number; ret: number; total: number }>()
  curr.forEach(r => {
    const e = catMap.get(r.category) || { rev: 0, units: 0, gross: 0, ret: 0, total: 0 }
    catMap.set(r.category, {
      rev: e.rev + r.revenue,
      units: e.units + r.units,
      gross: e.gross + r.gross,
      ret: e.ret + (r.returned ? 1 : 0),
      total: e.total + 1,
    })
  })
  const categoryTable: CategoryData[] = [...catMap.entries()]
    .map(([category, v]) => ({
      category,
      revenue: v.rev,
      units: v.units,
      avgPrice: v.units > 0 ? v.gross / v.units : 0,
      returnRate: v.total > 0 ? (v.ret / v.total) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)

  const categoryReturnRates = [...categoryTable]
    .map(c => ({ category: c.category, returnRate: c.returnRate }))
    .sort((a, b) => b.returnRate - a.returnRate)

  const highReturnCat = categoryTable.length > 0
    ? categoryTable.reduce((a, b) => a.returnRate > b.returnRate ? a : b)
    : null

  // ── Section 3: Customer segments ─────────────────────────────────────────────
  const genderMap = new Map<string, number>()
  curr.forEach(r => genderMap.set(r.gender, (genderMap.get(r.gender) || 0) + r.revenue))
  const revenueByGender = [...genderMap.entries()]
    .map(([gender, revenue]) => ({ gender, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const ageOrder = ['18–25', '26–35', '36–50', '50+']
  const ageMap = new Map<string, number>()
  curr.forEach(r => ageMap.set(r.ageGroup, (ageMap.get(r.ageGroup) || 0) + r.revenue))
  const revenueByAgeGroup = ageOrder.map(g => ({ group: g, revenue: ageMap.get(g) || 0 }))

  const cityRevMap = new Map<string, number>()
  curr.forEach(r => cityRevMap.set(r.location, (cityRevMap.get(r.location) || 0) + r.revenue))
  const revenueByCity = [...cityRevMap.entries()]
    .map(([city, revenue]) => ({ city, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const channelCityMap = new Map<string, { online: number; inStore: number }>()
  curr.forEach(r => {
    const e = channelCityMap.get(r.location) || { online: 0, inStore: 0 }
    channelCityMap.set(r.location, {
      online: e.online + (r.channel === 'Online' ? r.revenue : 0),
      inStore: e.inStore + (r.channel === 'In-store' ? r.revenue : 0),
    })
  })
  const channelByCity = revenueByCity.map(c => ({
    city: c.city,
    ...(channelCityMap.get(c.city) || { online: 0, inStore: 0 }),
  }))

  // Top segment (gender + ageGroup + city)
  const segMap = new Map<string, number>()
  curr.forEach(r => {
    const k = `${r.gender}|${r.ageGroup}|${r.location}`
    segMap.set(k, (segMap.get(k) || 0) + r.revenue)
  })
  const topSeg = segMap.size > 0
    ? [...segMap.entries()].reduce((a, b) => a[1] > b[1] ? a : b)
    : null
  let topSegmentSummary = ''
  if (topSeg) {
    const [gender, ageGroup, city] = topSeg[0].split('|')
    topSegmentSummary = `${gender}s aged ${ageGroup} in ${city} generate the highest revenue — consider targeting this segment in campaigns.`
  }

  // ── Section 4: Payments ───────────────────────────────────────────────────────
  const payMap = new Map<string, { rev: number; count: number }>()
  curr.forEach(r => {
    const e = payMap.get(r.payment) || { rev: 0, count: 0 }
    payMap.set(r.payment, { rev: e.rev + r.revenue, count: e.count + 1 })
  })
  const paymentSplit = [...payMap.entries()]
    .map(([method, v]) => ({ method, revenue: v.rev, count: v.count }))
    .sort((a, b) => b.revenue - a.revenue)

  const topPayEntry = payMap.size > 0
    ? [...payMap.entries()].reduce((a, b) => {
        const aAov = a[1].count > 0 ? a[1].rev / a[1].count : 0
        const bAov = b[1].count > 0 ? b[1].rev / b[1].count : 0
        return aAov > bAov ? a : b
      })
    : null
  const topPaymentByAOV = topPayEntry ? topPayEntry[0] : ''
  const topPaymentAOV = topPayEntry
    ? (topPayEntry[1].count > 0 ? topPayEntry[1].rev / topPayEntry[1].count : 0)
    : 0

  const chanMap = new Map<string, { rev: number; count: number }>()
  curr.forEach(r => {
    const e = chanMap.get(r.channel) || { rev: 0, count: 0 }
    chanMap.set(r.channel, { rev: e.rev + r.revenue, count: e.count + 1 })
  })
  const channelRevenue = [...chanMap.entries()]
    .map(([channel, v]) => ({ channel, revenue: v.rev, count: v.count }))

  const discPayMap = new Map<string, { total: number; count: number }>()
  curr.forEach(r => {
    const e = discPayMap.get(r.payment) || { total: 0, count: 0 }
    discPayMap.set(r.payment, { total: e.total + r.discountAmt, count: e.count + 1 })
  })
  const discountByPayment = [...discPayMap.entries()]
    .map(([method, v]) => ({ method, avgDiscount: v.count > 0 ? v.total / v.count : 0 }))
    .sort((a, b) => b.avgDiscount - a.avgDiscount)

  // ── AI Summaries ──────────────────────────────────────────────────────────────
  const onlineRev = chanMap.get('Online')?.rev || 0
  const onlinePct = cK.rev > 0 ? Math.round((onlineRev / cK.rev) * 100) : 0
  const topCity = revenueByCity[0]?.city || ''
  const bestMonth = bestMonthEntry ? fmtMonthLabel(bestMonthEntry.m) : ''
  const worstMonth = worstMonthEntry ? fmtMonthLabel(worstMonthEntry.m) : ''

  const summary1 = `Online sales account for ${onlinePct}% of revenue${topCity ? `, with ${topCity} leading all cities` : ''}. ${bestMonth ? `${bestMonth} was the strongest month` : ''}.`
  const summary2 = highReturnCat
    ? `${highReturnCat.category} has a ${highReturnCat.returnRate.toFixed(0)}% return rate — consider reviewing product quality, sizing guides, or descriptions to reduce returns and protect margins.`
    : ''
  const summary3 = topSegmentSummary || 'Analysing customer segments across gender, age, and location.'
  const summary4 = topPaymentByAOV
    ? `${topPaymentByAOV} correlates with the highest average order value of ₹${topPaymentAOV.toFixed(0)} — consider incentivising this payment method through cashback or exclusive offers.`
    : ''

  // ── Recommendations ───────────────────────────────────────────────────────────
  const recommendations: { icon: string; text: string }[] = []
  if (highReturnCat && highReturnCat.returnRate > 30) {
    recommendations.push({
      icon: '⚠️',
      text: `${highReturnCat.category} has a ${highReturnCat.returnRate.toFixed(0)}% return rate — audit product quality, descriptions, and fulfilment for this category.`,
    })
  }
  if (topSeg) {
    const [gender, ageGroup, city] = topSeg[0].split('|')
    recommendations.push({
      icon: '💡',
      text: `${gender}s aged ${ageGroup} in ${city} are your highest-value segment — invest in targeted campaigns and loyalty offers for this group.`,
    })
  }
  recommendations.push({
    icon: onlinePct > 50 ? '📈' : '💡',
    text: onlinePct > 50
      ? `Online drives ${onlinePct}% of revenue — strengthen digital marketing, UX, and fast-checkout flows.`
      : `In-store drives ${100 - onlinePct}% of revenue — optimise store layouts, staff training, and in-person promotions.`,
  })
  if (discountLeakagePct > 20) {
    recommendations.push({
      icon: '⚠️',
      text: `Discounts are consuming ${discountLeakagePct.toFixed(1)}% of gross revenue — introduce discount caps or loyalty-based discounting to protect margins.`,
    })
  }
  if (topCity) {
    recommendations.push({
      icon: '📈',
      text: `${topCity} is your top city — consider expanding SKU breadth, exclusive city launches, or loyalty events there.`,
    })
  }

  return {
    totalRevenue: {
      value: cK.rev,
      prev: pK.rev,
      trend: trend(cK.rev, pK.rev),
      trendLabel: computeTrendLabel(cK.rev, pK.rev, hasPrev),
      sparkline: revSparkline,
    },
    avgOrderValue: {
      value: cK.aov,
      prev: pK.aov,
      trend: trend(cK.aov, pK.aov),
      trendLabel: computeTrendLabel(cK.aov, pK.aov, hasPrev),
      sparkline: aovSparkline,
    },
    totalTransactions: {
      value: cK.tx,
      prev: pK.tx,
      trend: trend(cK.tx, pK.tx),
      trendLabel: computeTrendLabel(cK.tx, pK.tx, hasPrev),
      sparkline: txSparkline,
    },
    returnRate: {
      value: cK.rr,
      prev: pK.rr,
      // Invert: higher return rate = worse, so 'up' becomes 'down' for coloring
      trend: !hasPrev ? 'neutral' : cK.rr < pK.rr ? 'up' : cK.rr > pK.rr ? 'down' : 'neutral',
      trendLabel: computeTrendLabel(cK.rr, pK.rr, hasPrev),
      sparkline: rrSparkline,
    },
    monthlyRevenue,
    discountLeakage,
    discountLeakagePct,
    bestMonth,
    worstMonth,
    topProducts,
    categoryReturnRates,
    categoryTable,
    highReturnCategory: highReturnCat?.category || '',
    highReturnCategoryRate: highReturnCat?.returnRate || 0,
    revenueByGender,
    revenueByAgeGroup,
    revenueByCity,
    channelByCity,
    topSegmentSummary,
    paymentSplit,
    channelRevenue,
    discountByPayment,
    topPaymentByAOV,
    topPaymentAOV,
    availableCities,
    selectedCity: cityParam,
    selectedRange: rangeParam,
    maxDate: maxDate.toISOString().split('T')[0],
    summary1,
    summary2,
    summary3,
    summary4,
    recommendations,
  }
}
