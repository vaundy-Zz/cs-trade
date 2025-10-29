export type TimeRange = '24h' | '7d' | '30d';
export type Category = 'price_growth' | 'trading_volume' | 'demand' | 'rarity';

export interface Market {
  id: number;
  slug: string;
  name: string;
  createdAt: Date;
}

export interface Skin {
  id: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  rarityTier: string;
  rarityRank: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  skin: {
    id: number;
    slug: string;
    name: string;
    imageUrl: string | null;
    rarityTier: string;
    rarityRank: number;
  };
  metricValue: number;
  computedAt: Date | null;
}

export interface LeaderboardResponse {
  category: Category;
  market: {
    slug: string;
    name: string;
  };
  timeRange: TimeRange;
  entries: LeaderboardEntry[];
  updatedAt: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface LeaderboardQuery {
  category: Category;
  marketSlug?: string;
  timeRange?: TimeRange;
  page?: number;
  pageSize?: number;
}
