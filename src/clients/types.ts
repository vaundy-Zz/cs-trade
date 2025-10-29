export interface SteamMarketItem {
  appId: number;
  marketHashName: string;
  lowestPrice: number;
  medianPrice: number;
  volume: number;
  currency: string;
  updatedAt: string;
}

export interface SteamPriceOverviewResponse {
  success: boolean;
  lowest_price?: string;
  volume?: string;
  median_price?: string;
}

export interface ThirdPartyMarketItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  updatedAt: string;
}

export interface MarketOrderBook {
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  spread: number;
  lastUpdated: string;
}

export interface UnifiedMarketQuote {
  source: 'steam' | 'buff';
  itemName: string;
  buyPrice: number;
  sellPrice: number;
  currency: string;
  volume: number;
  timestamp: string;
}

export interface MarketServiceOptions {
  currency?: string;
  locale?: string;
}
