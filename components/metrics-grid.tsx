'use client'

import { MarketSnapshot } from '@/lib/types'

type MetricsGridProps = {
  metrics: MarketSnapshot['metrics']
  updatedAt?: string
  isRefreshing?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDelta(value: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
  })
  return formatter.format(value / 100)
}

export default function MetricsGrid({ metrics, updatedAt, isRefreshing }: MetricsGridProps) {
  const items = [
    {
      label: 'Market Cap',
      value: formatCurrency(metrics.marketCap),
      delta: formatDelta(metrics.marketCapChange),
      positive: metrics.marketCapChange >= 0,
    },
    {
      label: '24h Volume',
      value: formatCurrency(metrics.volume24h),
      delta: formatDelta(metrics.volumeChange),
      positive: metrics.volumeChange >= 0,
    },
    {
      label: 'Avg Price',
      value: formatCurrency(metrics.averagePrice),
      delta: formatDelta(metrics.averagePriceChange),
      positive: metrics.averagePriceChange >= 0,
    },
    {
      label: 'Supply / Demand',
      value: metrics.supplyDemandRatio.toFixed(2),
      delta: formatDelta(metrics.supplyDemandChange),
      positive: metrics.supplyDemandChange >= 0,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, delta, positive }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>{label}</span>
            {isRefreshing && <span className="animate-pulse text-xs text-emerald-500">Refreshing</span>}
          </div>
          <div className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
          <div
            className={`mt-2 text-sm font-medium ${
              positive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {positive ? '+' : ''}
            {delta}
          </div>
        </div>
      ))}
      {updatedAt && (
        <div className="sm:col-span-2 xl:col-span-1">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            <span className="font-medium">Last updated</span>
            <span>{new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}
    </div>
  )
}
