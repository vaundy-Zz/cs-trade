'use client'

import { TrendingSkin } from '@/lib/types'

type TrendingSkinsProps = {
  skins: TrendingSkin[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

const rarityColors: Record<string, string> = {
  common: 'bg-gray-400 dark:bg-gray-600',
  rare: 'bg-blue-500 dark:bg-blue-600',
  epic: 'bg-purple-500 dark:bg-purple-600',
  legendary: 'bg-amber-500 dark:bg-amber-600',
}

export default function TrendingSkins({ skins }: TrendingSkinsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trending Skins</h2>
        <span className="text-sm text-slate-600 dark:text-slate-400">Top movers</span>
      </div>
      <div className="space-y-3">
        {skins.map((skin, idx) => (
          <div
            key={skin.id}
            className="flex items-center justify-between rounded-lg bg-slate-50 p-4 transition-all hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                #{idx + 1}
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{skin.name}</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                      rarityColors[skin.rarity] || rarityColors.common
                    }`}
                  >
                    {skin.rarity.charAt(0).toUpperCase() + skin.rarity.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(skin.price)}</div>
              <div
                className={`text-sm font-medium ${
                  skin.change >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {skin.change >= 0 ? '+' : ''}
                {skin.change.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
