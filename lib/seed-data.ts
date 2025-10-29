import { TimeRange } from './types';

export interface MarketSeed {
  slug: string;
  name: string;
}

export interface SkinSeed {
  slug: string;
  name: string;
  imageUrl: string;
  rarityTier: string;
  rarityRank: number;
}

export interface BaseMetricSeed {
  skinSlug: string;
  priceGrowth: number;
  tradingVolume: number;
  demand: number;
}

export const MARKET_SEED: MarketSeed[] = [
  { slug: 'steam-market', name: 'Steam Community Market' },
  { slug: 'skinport', name: 'Skinport' },
  { slug: 'buff163', name: 'BUFF163' }
];

export const SKIN_SEED: SkinSeed[] = [
  {
    slug: 'awp-dragon-lore',
    name: 'AWP | Dragon Lore',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Dragon+Lore',
    rarityTier: 'Legendary',
    rarityRank: 1
  },
  {
    slug: 'm4a4-howl',
    name: 'M4A4 | Howl',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Howl',
    rarityTier: 'Legendary',
    rarityRank: 2
  },
  {
    slug: 'ak47-fire-serpent',
    name: 'AK-47 | Fire Serpent',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Fire+Serpent',
    rarityTier: 'Mythic',
    rarityRank: 3
  },
  {
    slug: 'm4a1s-chantico-fire',
    name: 'M4A1-S | Chantico\'s Fire',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Chantico',
    rarityTier: 'Mythic',
    rarityRank: 4
  },
  {
    slug: 'ak47-vulcan',
    name: 'AK-47 | Vulcan',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Vulcan',
    rarityTier: 'Rare',
    rarityRank: 5
  },
  {
    slug: 'usp-kill-confirmed',
    name: 'USP-S | Kill Confirmed',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Kill+Confirmed',
    rarityTier: 'Rare',
    rarityRank: 6
  },
  {
    slug: 'deagle-printstream',
    name: 'Desert Eagle | Printstream',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Printstream',
    rarityTier: 'Epic',
    rarityRank: 7
  },
  {
    slug: 'ak47-redline',
    name: 'AK-47 | Redline',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Redline',
    rarityTier: 'Epic',
    rarityRank: 8
  },
  {
    slug: 'awp-neo-noir',
    name: 'AWP | Neo-Noir',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Neo-Noir',
    rarityTier: 'Elite',
    rarityRank: 9
  },
  {
    slug: 'glock-water-elemental',
    name: 'Glock-18 | Water Elemental',
    imageUrl: 'https://dummyimage.com/160x90/111827/ffffff&text=Water+Elemental',
    rarityTier: 'Elite',
    rarityRank: 10
  }
];

export const BASE_METRIC_SEED: BaseMetricSeed[] = [
  { skinSlug: 'awp-dragon-lore', priceGrowth: 18.5, tradingVolume: 18250, demand: 98 },
  { skinSlug: 'm4a4-howl', priceGrowth: 16.2, tradingVolume: 16870, demand: 95 },
  { skinSlug: 'ak47-fire-serpent', priceGrowth: 14.8, tradingVolume: 15400, demand: 93 },
  { skinSlug: 'm4a1s-chantico-fire', priceGrowth: 13.1, tradingVolume: 12150, demand: 90 },
  { skinSlug: 'ak47-vulcan', priceGrowth: 12.4, tradingVolume: 11400, demand: 88 },
  { skinSlug: 'usp-kill-confirmed', priceGrowth: 11.6, tradingVolume: 9300, demand: 86 },
  { skinSlug: 'deagle-printstream', priceGrowth: 10.9, tradingVolume: 8750, demand: 84 },
  { skinSlug: 'ak47-redline', priceGrowth: 9.8, tradingVolume: 7450, demand: 80 },
  { skinSlug: 'awp-neo-noir', priceGrowth: 8.6, tradingVolume: 6550, demand: 78 },
  { skinSlug: 'glock-water-elemental', priceGrowth: 7.3, tradingVolume: 6120, demand: 75 }
];

export const SUPPORTED_TIME_RANGES: TimeRange[] = ['24h', '7d', '30d'];

export const PRICE_MULTIPLIERS: Record<TimeRange, number> = {
  '24h': 0.42,
  '7d': 1,
  '30d': 1.65
};

export const VOLUME_MULTIPLIERS: Record<TimeRange, number> = {
  '24h': 0.22,
  '7d': 1,
  '30d': 1.85
};

export const DEMAND_MULTIPLIERS: Record<TimeRange, number> = {
  '24h': 0.55,
  '7d': 1,
  '30d': 1.45
};

export const MARKET_ADJUSTMENTS: Record<
  string,
  {
    price: number;
    volume: number;
    demand: number;
  }
> = {
  'steam-market': { price: 1, volume: 1, demand: 1.02 },
  skinport: { price: 1.12, volume: 0.82, demand: 0.94 },
  buff163: { price: 0.93, volume: 1.18, demand: 1.07 }
};
