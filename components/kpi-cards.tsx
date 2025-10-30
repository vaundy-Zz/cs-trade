'use client'

import { KPI } from '@/lib/types'

type KPICardsProps = {
  items: KPI[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function KPICards({ items }: KPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</div>
          <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatNumber(item.value)}</div>
          <div
            className={`mt-2 text-sm font-medium ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
          >
            {item.change >= 0 ? '+' : ''}
            {item.change.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  )
}
