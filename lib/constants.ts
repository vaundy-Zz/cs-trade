import { Category, TimeRange } from './types';

export const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    description: string;
    metricLabel: string;
    unit: string;
    direction: 'desc' | 'asc';
  }
> = {
  price_growth: {
    label: 'Price Growth',
    description: 'Skins with the highest percentage increase in price over the selected period.',
    metricLabel: 'Growth',
    unit: '%',
    direction: 'desc'
  },
  trading_volume: {
    label: 'Trading Volume',
    description: "Most traded skins ranked by volume across the selected market.",
    metricLabel: 'Volume',
    unit: 'units',
    direction: 'desc'
  },
  demand: {
    label: 'Demand Score',
    description: 'Skins attracting the most attention based on demand signals.',
    metricLabel: 'Demand',
    unit: 'score',
    direction: 'desc'
  },
  rarity: {
    label: 'Rarity Tier',
    description: 'The rarest skins available in the chosen market.',
    metricLabel: 'Tier Rank',
    unit: 'rank',
    direction: 'asc'
  }
};

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_CONFIG) as Category[]).map((value) => ({
  value,
  label: CATEGORY_CONFIG[value].label
}));

export const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' }
];

export const DEFAULT_MARKET_SLUG = 'steam-market';
export const DEFAULT_CATEGORY: Category = 'price_growth';
export const DEFAULT_TIME_RANGE: TimeRange = '7d';
export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 20;
