'use client'

import { MarketFilters, MarketOption, RarityOption, TimeframeOption } from '@/lib/types'

type MarketFiltersProps = {
  filters: MarketFilters
  onFiltersChange: (filters: MarketFilters) => void
  isLoading?: boolean
}

const MARKETS: { value: MarketOption; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'americas', label: 'Americas' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
]

const RARITIES: { value: RarityOption; label: string }[] = [
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
]

const TIMEFRAMES: { value: TimeframeOption; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

export default function MarketFiltersComponent({ filters, onFiltersChange, isLoading }: MarketFiltersProps) {
  const handleMarketChange = (market: MarketOption) => {
    onFiltersChange({ ...filters, market })
  }

  const handleRarityChange = (rarity: RarityOption) => {
    onFiltersChange({ ...filters, rarity })
  }

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    onFiltersChange({ ...filters, timeframe })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Market
        </label>
        <div className="flex gap-2 flex-wrap">
          {MARKETS.map((market) => (
            <button
              key={market.value}
              onClick={() => handleMarketChange(market.value)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.market === market.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {market.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rarity
        </label>
        <div className="flex gap-2 flex-wrap">
          {RARITIES.map((rarity) => (
            <button
              key={rarity.value}
              onClick={() => handleRarityChange(rarity.value)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.rarity === rarity.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {rarity.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timeframe
        </label>
        <div className="flex gap-2 flex-wrap">
          {TIMEFRAMES.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => handleTimeframeChange(timeframe.value)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.timeframe === timeframe.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
