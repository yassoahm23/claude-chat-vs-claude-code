import { Suspense } from 'react'
import { parseData } from '@/lib/parseData'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Section1Revenue from '@/components/Section1_Revenue'
import Section2Products from '@/components/Section2_Products'
import Section3Customers from '@/components/Section3_Customers'
import Section4Payments from '@/components/Section4_Payments'
import RecommendationsPanel from '@/components/RecommendationsPanel'

interface PageProps {
  searchParams: Promise<{ range?: string; city?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const range = params.range ?? 'all'
  const city = params.city ?? 'all'

  const data = parseData(range, city)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar lastUpdated={data.maxDate} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header needs searchParams client-side navigation */}
        <Suspense fallback={<div className="h-16 bg-[#1a1d2e] border-b border-[rgba(255,255,255,0.07)]" />}>
          <HeaderWrapper
            availableCities={data.availableCities}
            selectedCity={data.selectedCity}
            selectedRange={data.selectedRange}
          />
        </Suspense>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
          <Section1Revenue data={data} />
          <Section2Products data={data} />
          <Section3Customers data={data} />
          <Section4Payments data={data} />
        </main>
      </div>

      {/* Fixed bottom recommendations panel */}
      <RecommendationsPanel recommendations={data.recommendations} />
    </div>
  )
}

function HeaderWrapper({
  availableCities,
  selectedCity,
  selectedRange,
}: {
  availableCities: string[]
  selectedCity: string
  selectedRange: string
}) {
  return (
    <Header
      availableCities={availableCities}
      selectedCity={selectedCity}
      selectedRange={selectedRange}
    />
  )
}
