'use client'

import { useMemo, useState, useTransition } from 'react'
import { MarketSnapshot, MarketFilters } from '@/lib/types'
import { useMarketData, mutateMarketSnapshot } from '@/hooks/use-market-data'
import MarketFiltersComponent from './market-filters'
import MetricsGrid from './metrics-grid'
import PriceChart from './price-chart'
import SupplyDemandChart from './supply-demand-chart'
import TrendingSkins from './trending-skins'
import KPICards from './kpi-cards'
import ErrorBoundary from './error-boundary'

type DashboardClientProps = {
  initialSnapshot: MarketSnapshot
}

export default function DashboardClient({ initialSnapshot }: DashboardClientProps) {
  const [filters, setFilters] = useState<MarketFilters>(initialSnapshot.filters)
  const [isPending, startTransition] = useTransition()

  const { data, error, isValidating } = useMarketData(filters, initialSnapshot)

  const snapshot = useMemo(() => data ?? initialSnapshot, [data, initialSnapshot])

  const handleFiltersChange = (newFilters: MarketFilters) => {
    if (
      newFilters.market === filters.market &&
      newFilters.rarity === filters.rarity &&
      newFilters.timeframe === filters.timeframe
    ) {
      return
    }

    startTransition(() => {
      const optimisticSnapshot: MarketSnapshot = {
        ...snapshot,
        filters: newFilters,
      }

      setFilters(newFilters)
      void mutateMarketSnapshot(newFilters, optimisticSnapshot)
    })
  }

  if (error) {
    return <ErrorBoundary error={error} reset={() => window.location.reload()} />
  }

  const isRefreshing = isValidating && !isPending

  return (
    <div className="space-y-8">
      <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <MarketFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isLoading={isPending}
        />
      </div>

      <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <MetricsGrid
          metrics={snapshot.metrics}
          updatedAt={snapshot.updatedAt}
          isRefreshing={isRefreshing}
        />
      </div>

      <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <KPICards items={snapshot.kpis} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <PriceChart data={snapshot.priceSeries} timeframe={snapshot.filters.timeframe} />
        </div>
        <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <SupplyDemandChart data={snapshot.supplyDemandSeries} />
        </div>
      </div>

      <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <TrendingSkins skins={snapshot.trendingSkins} />
      </div>

      {isRefreshing && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Live updating...
        </div>
      )}
    </div>
  )
}
