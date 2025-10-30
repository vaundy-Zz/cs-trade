import useSWR, { mutate as globalMutate } from 'swr'
import type { MutatorOptions } from 'swr'
import { MarketSnapshot, MarketFilters } from '@/lib/types'

export const POLLING_INTERVAL = 5000

export function buildMarketQueryString(filters: MarketFilters): string {
  const params = new URLSearchParams()
  params.set('market', filters.market)
  params.set('rarity', filters.rarity)
  params.set('timeframe', filters.timeframe)
  return params.toString()
}

export function createMarketKey(filters: MarketFilters): string {
  return `/api/market?${buildMarketQueryString(filters)}`
}

export async function marketFetcher(url: string): Promise<MarketSnapshot> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch market data')
  }
  return res.json()
}

export function useMarketData(filters: MarketFilters, initialData?: MarketSnapshot) {
  const key = createMarketKey(filters)

  const { data, error, isLoading, isValidating, mutate } = useSWR<MarketSnapshot>(
    key,
    marketFetcher,
    {
      fallbackData: initialData,
      refreshInterval: POLLING_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      errorRetryCount: 3,
      errorRetryInterval: 3000,
      keepPreviousData: true,
    }
  )

  const optimisticMutate = (
    updater: () => Promise<MarketSnapshot>,
    optimisticData: MarketSnapshot,
    options?: MutatorOptions<MarketSnapshot>
  ) =>
    mutate(updater, {
      optimisticData,
      rollbackOnError: true,
      populateCache: true,
      ...options,
    })

  return {
    key,
    data,
    error,
    isLoading,
    isValidating,
    mutate: optimisticMutate,
  }
}

export function mutateMarketSnapshot(
  filters: MarketFilters,
  optimisticData: MarketSnapshot,
  updater?: () => Promise<MarketSnapshot>,
  options?: MutatorOptions<MarketSnapshot>
) {
  const key = createMarketKey(filters)
  return globalMutate<MarketSnapshot>(
    key,
    updater ?? (() => marketFetcher(key)),
    {
      optimisticData,
      rollbackOnError: true,
      populateCache: true,
      revalidate: !updater,
      ...options,
    }
  )
}
