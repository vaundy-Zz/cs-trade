export type MarketOption = 'global' | 'americas' | 'europe' | 'asia'
export type RarityOption = 'common' | 'rare' | 'epic' | 'legendary'
export type TimeframeOption = '24h' | '7d' | '30d'

export type MarketFilters = {
  market: MarketOption
  rarity: RarityOption
  timeframe: TimeframeOption
}

export type KPI = {
  id: string
  label: string
  value: number
  change: number
}

export type PricePoint = {
  timestamp: string
  price: number
}

export type SupplyDemandPoint = {
  timestamp: string
  supply: number
  demand: number
}

export type TrendingSkin = {
  id: string
  name: string
  rarity: RarityOption
  price: number
  change: number
}

export type MarketSnapshot = {
  filters: MarketFilters
  metrics: {
    marketCap: number
    marketCapChange: number
    volume24h: number
    volumeChange: number
    supplyDemandRatio: number
    supplyDemandChange: number
    averagePrice: number
    averagePriceChange: number
  }
  kpis: KPI[]
  priceSeries: PricePoint[]
  supplyDemandSeries: SupplyDemandPoint[]
  trendingSkins: TrendingSkin[]
  updatedAt: string
}
