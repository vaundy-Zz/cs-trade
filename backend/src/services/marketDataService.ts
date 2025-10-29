export interface MarketData {
  symbol: string;
  price: number;
  volatility: number;
  roi: number;
  timestamp: Date;
}

const marketDataCache = new Map<string, MarketData>();

export function simulateMarketData(symbol: string): MarketData {
  const cached = marketDataCache.get(symbol);
  const basePrice = cached?.price || 100 + Math.random() * 100;
  
  const priceChange = (Math.random() - 0.5) * 10;
  const price = Math.max(1, basePrice + priceChange);
  
  const volatility = Math.abs(priceChange / basePrice) * 100;
  
  const roi = ((price - basePrice) / basePrice) * 100;

  const data: MarketData = {
    symbol,
    price,
    volatility,
    roi,
    timestamp: new Date(),
  };

  marketDataCache.set(symbol, data);

  return data;
}

export function getMarketData(symbol: string): MarketData {
  return simulateMarketData(symbol);
}

export function clearMarketDataCache(): void {
  marketDataCache.clear();
}
