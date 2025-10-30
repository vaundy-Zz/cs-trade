import { MarketSnapshot, MarketFilters, PricePoint, SupplyDemandPoint, TrendingSkin, KPI } from './types'

function generatePriceData(timeframe: string): PricePoint[] {
  const now = Date.now()
  const points: PricePoint[] = []
  const intervals = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 * 24 : 30 * 24
  const intervalMs = timeframe === '24h' ? 3600000 : 3600000
  
  let basePrice = 1000
  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs).toISOString()
    basePrice += (Math.random() - 0.5) * 100
    points.push({
      timestamp,
      price: Math.max(500, basePrice),
    })
  }
  
  return points
}

function generateSupplyDemandData(timeframe: string): SupplyDemandPoint[] {
  const now = Date.now()
  const points: SupplyDemandPoint[] = []
  const intervals = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 * 24 : 30 * 24
  const intervalMs = timeframe === '24h' ? 3600000 : 3600000
  
  let baseSupply = 10000
  let baseDemand = 9500
  
  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs).toISOString()
    baseSupply += (Math.random() - 0.5) * 500
    baseDemand += (Math.random() - 0.5) * 600
    points.push({
      timestamp,
      supply: Math.max(5000, baseSupply),
      demand: Math.max(5000, baseDemand),
    })
  }
  
  return points
}

function generateTrendingSkins(): TrendingSkin[] {
  const rarities = ['common', 'rare', 'epic', 'legendary'] as const
  const names = [
    'Dragon Scale', 'Cyber Punk', 'Neon Warrior', 'Galaxy Explorer',
    'Mystic Shadow', 'Flame Burst', 'Ice Phoenix', 'Thunder Strike'
  ]
  
  return names.slice(0, 5).map((name, idx) => ({
    id: `skin-${idx}`,
    name,
    rarity: rarities[Math.floor(Math.random() * rarities.length)],
    price: 100 + Math.random() * 1000,
    change: (Math.random() - 0.4) * 50,
  }))
}

function generateKPIs(filters: MarketFilters): KPI[] {
  const marketMultiplier = filters.market === 'global' ? 1 : 0.3
  const rarityMultiplier = filters.rarity === 'legendary' ? 2 : filters.rarity === 'epic' ? 1.5 : filters.rarity === 'rare' ? 1.2 : 1
  
  return [
    {
      id: 'market-cap',
      label: 'Market Cap',
      value: 125000000 * marketMultiplier * rarityMultiplier,
      change: 3.5 + (Math.random() - 0.5) * 5,
    },
    {
      id: 'volume',
      label: '24h Volume',
      value: 12500000 * marketMultiplier * rarityMultiplier,
      change: -1.2 + (Math.random() - 0.5) * 5,
    },
    {
      id: 'avg-price',
      label: 'Avg Price',
      value: 890 * rarityMultiplier,
      change: 2.8 + (Math.random() - 0.5) * 5,
    },
    {
      id: 'listings',
      label: 'Active Listings',
      value: 45620 * marketMultiplier,
      change: 5.1 + (Math.random() - 0.5) * 5,
    },
  ]
}

export async function fetchMarketData(filters: MarketFilters): Promise<MarketSnapshot> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 200))
  
  const priceSeries = generatePriceData(filters.timeframe)
  const supplyDemandSeries = generateSupplyDemandData(filters.timeframe)
  const trendingSkins = generateTrendingSkins()
  const kpis = generateKPIs(filters)
  
  const latestPricePoint = priceSeries[priceSeries.length - 1]
  const previousPricePoint = priceSeries[priceSeries.length - 2] ?? priceSeries[priceSeries.length - 1]
  const oldestPrice = priceSeries[0].price
  const priceChange = ((latestPricePoint.price - oldestPrice) / oldestPrice) * 100
  
  const latestSupplyDemand = supplyDemandSeries[supplyDemandSeries.length - 1]
  const previousSupplyDemand = supplyDemandSeries[supplyDemandSeries.length - 2] ?? latestSupplyDemand
  const latestRatio = latestSupplyDemand.demand === 0 ? 0 : latestSupplyDemand.supply / latestSupplyDemand.demand
  const previousRatio = previousSupplyDemand.demand === 0 ? latestRatio : previousSupplyDemand.supply / previousSupplyDemand.demand
  const supplyDemandChange = previousRatio === 0 ? 0 : ((latestRatio - previousRatio) / previousRatio) * 100
  
  const marketCap = latestPricePoint.price * 100000
  const volumeKpi = kpis.find((k) => k.id === 'volume')
  const averagePriceKpi = kpis.find((k) => k.id === 'avg-price')
  
  return {
    filters,
    metrics: {
      marketCap,
      marketCapChange: ((latestPricePoint.price - previousPricePoint.price) / previousPricePoint.price) * 100,
      volume24h: volumeKpi?.value ?? 0,
      volumeChange: volumeKpi?.change ?? 0,
      supplyDemandRatio: Number.isFinite(latestRatio) ? latestRatio : 0,
      supplyDemandChange: Number.isFinite(supplyDemandChange) ? supplyDemandChange : 0,
      averagePrice: averagePriceKpi?.value ?? latestPricePoint.price,
      averagePriceChange: averagePriceKpi?.change ?? priceChange,
    },
    kpis,
    priceSeries,
    supplyDemandSeries,
    trendingSkins,
    updatedAt: new Date().toISOString(),
  }
}
