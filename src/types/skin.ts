export type SkinRarity = 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert' | 'Contraband';

export type WearCondition = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  collection: string;
  rarity: SkinRarity;
  imageUrl: string;
  model3dUrl?: string;
  description: string;
}

export interface WearData {
  condition: WearCondition;
  floatValue: number;
  minFloat: number;
  maxFloat: number;
  paintSeed?: number;
  patternIndex?: number;
}

export interface MarketListing {
  provider: string;
  price: number;
  currency: string;
  availableQuantity: number;
  lastUpdated: string;
  url: string;
}

export interface PriceHistory {
  date: string;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  volume: number;
}

export interface PerformanceMetrics {
  last7Days: {
    priceChange: number;
    percentageChange: number;
    volume: number;
  };
  last30Days: {
    priceChange: number;
    percentageChange: number;
    volume: number;
  };
  allTime: {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
  };
}

export interface ROICalculation {
  purchasePrice: number;
  currentPrice: number;
  profit: number;
  roi: number;
  holdingDays: number;
}

export interface ComparableSkin {
  id: string;
  name: string;
  weapon: string;
  rarity: SkinRarity;
  imageUrl: string;
  currentPrice: number;
  priceChange7d: number;
  similarity: number;
}

export interface SkinDetailData {
  skin: Skin;
  wearData: WearData;
  marketListings: MarketListing[];
  priceHistory: PriceHistory[];
  performanceMetrics: PerformanceMetrics;
  comparableSkins: ComparableSkin[];
}
