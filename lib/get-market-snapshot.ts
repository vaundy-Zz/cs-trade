import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchMarketData } from './api'
import { MarketFilters, MarketSnapshot } from './types'

export const DEFAULT_FILTERS: MarketFilters = {
  market: 'global',
  rarity: 'legendary',
  timeframe: '24h',
}

const cachedMarketSnapshot = unstable_cache(
  async (filters: MarketFilters): Promise<MarketSnapshot> => {
    return fetchMarketData(filters)
  },
  ['market-dashboard-snapshot'],
  {
    revalidate: 30,
    tags: ['market-dashboard'],
  }
)

export async function getInitialMarketSnapshot(
  filters: MarketFilters = DEFAULT_FILTERS
): Promise<MarketSnapshot> {
  return cachedMarketSnapshot({ ...filters })
}
