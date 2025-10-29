import type { SkinDetailData } from '../types/skin';

export const skinDetails: Record<string, SkinDetailData> = {
  'awp-dragon-lore': {
    skin: {
      id: 'awp-dragon-lore',
      name: 'AWP | Dragon Lore',
      weapon: 'AWP',
      collection: 'Cobblestone Collection',
      rarity: 'Covert',
      imageUrl:
        'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=900&q=80',
      description:
        'The iconic Dragon Lore features a knight slaying a dragon on a pearlized basecoat. It is one of the most sought-after skins due to its rarity and timeless design.',
    },
    wearData: {
      condition: 'Factory New',
      floatValue: 0.0213,
      minFloat: 0.0,
      maxFloat: 0.07,
      paintSeed: 387,
      patternIndex: 64,
    },
    marketListings: [
      {
        provider: 'Steam Community Market',
        price: 1925.75,
        currency: 'USD',
        availableQuantity: 2,
        lastUpdated: new Date(new Date().getTime() - 5 * 60 * 1000).toISOString(),
        url: 'https://steamcommunity.com/market/listings/730/AWP%20%7C%20Dragon%20Lore%20%28Factory%20New%29',
      },
      {
        provider: 'BUFF163',
        price: 1820.4,
        currency: 'USD',
        availableQuantity: 5,
        lastUpdated: new Date(new Date().getTime() - 12 * 60 * 1000).toISOString(),
        url: 'https://buff.163.com/market/goods?goods_id=12345',
      },
      {
        provider: 'SkinPort',
        price: 1779.99,
        currency: 'USD',
        availableQuantity: 3,
        lastUpdated: new Date(new Date().getTime() - 48 * 60 * 1000).toISOString(),
        url: 'https://skinport.com/item/awp-dragon-lore-fn',
      },
    ],
    priceHistory: Array.from({ length: 12 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - index));
      const basePrice = 1500 + index * 35;
      return {
        date: date.toISOString(),
        averagePrice: parseFloat((basePrice + Math.random() * 40).toFixed(2)),
        lowestPrice: parseFloat((basePrice - 45 + Math.random() * 20).toFixed(2)),
        highestPrice: parseFloat((basePrice + 55 + Math.random() * 25).toFixed(2)),
        volume: Math.floor(20 + Math.random() * 15),
      };
    }),
    performanceMetrics: {
      last7Days: {
        priceChange: 85.5,
        percentageChange: 4.6,
        volume: 14,
      },
      last30Days: {
        priceChange: 212.75,
        percentageChange: 12.4,
        volume: 57,
      },
      allTime: {
        lowestPrice: 785.0,
        highestPrice: 1985.25,
        averagePrice: 1290.43,
      },
    },
    comparableSkins: [
      {
        id: 'awp-medusa',
        name: 'AWP | Medusa',
        weapon: 'AWP',
        rarity: 'Covert',
        imageUrl: 'https://images.unsplash.com/photo-1583523476000-26666f2d6f61?auto=format&fit=crop&w=900&q=80',
        currentPrice: 1325.65,
        priceChange7d: 2.1,
        similarity: 0.92,
      },
      {
        id: 'm4a4-how',
        name: 'M4A4 | Howl',
        weapon: 'M4A4',
        rarity: 'Contraband',
        imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=900&q=80',
        currentPrice: 1598.49,
        priceChange7d: -1.7,
        similarity: 0.81,
      },
      {
        id: 'ak-47-fire-serpent',
        name: 'AK-47 | Fire Serpent',
        weapon: 'AK-47',
        rarity: 'Covert',
        imageUrl: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=900&q=80',
        currentPrice: 689.22,
        priceChange7d: 3.9,
        similarity: 0.76,
      },
    ],
  },
};

export const getSkinIds = (): string[] => Object.keys(skinDetails);

export const getSkinDetail = (skinId: string): SkinDetailData | null => {
  return skinDetails[skinId] ?? null;
};

export const getMarketListings = (skinId: string) => {
  const detail = getSkinDetail(skinId);
  return detail ? detail.marketListings : null;
};

export const getPriceHistory = (skinId: string) => {
  const detail = getSkinDetail(skinId);
  return detail ? detail.priceHistory : null;
};

export const getComparableSkins = (skinId: string) => {
  const detail = getSkinDetail(skinId);
  return detail ? detail.comparableSkins : null;
};
