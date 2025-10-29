import axios from 'axios';
import { cacheService } from './cache';
import type { SkinDetailData, MarketListing, PriceHistory, ComparableSkin } from '../types/skin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

class ApiService {
  private batchQueue: Map<string, Array<(data: any) => void>>;
  private batchTimeout: NodeJS.Timeout | null;

  constructor() {
    this.batchQueue = new Map();
    this.batchTimeout = null;
  }

  async fetchSkinDetails(skinId: string): Promise<SkinDetailData> {
    const cacheKey = `skin-details-${skinId}`;
    const cached = cacheService.get<SkinDetailData>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await axios.get(`${API_BASE_URL}/skins/${skinId}`);
    const data = response.data;

    cacheService.set(cacheKey, data, 5 * 60 * 1000);

    return data;
  }

  async fetchMarketListings(skinId: string): Promise<MarketListing[]> {
    const cacheKey = `market-listings-${skinId}`;
    const cached = cacheService.get<MarketListing[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await axios.get(`${API_BASE_URL}/skins/${skinId}/listings`);
    const data = response.data;

    cacheService.set(cacheKey, data, 2 * 60 * 1000);

    return data;
  }

  async fetchPriceHistory(skinId: string, days: number = 30): Promise<PriceHistory[]> {
    const cacheKey = `price-history-${skinId}-${days}`;
    const cached = cacheService.get<PriceHistory[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await axios.get(`${API_BASE_URL}/skins/${skinId}/price-history`, {
      params: { days },
    });
    const data = response.data;

    cacheService.set(cacheKey, data, 10 * 60 * 1000);

    return data;
  }

  async fetchComparableSkins(skinId: string): Promise<ComparableSkin[]> {
    const cacheKey = `comparable-skins-${skinId}`;
    const cached = cacheService.get<ComparableSkin[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await axios.get(`${API_BASE_URL}/skins/${skinId}/comparable`);
    const data = response.data;

    cacheService.set(cacheKey, data, 15 * 60 * 1000);

    return data;
  }

  async batchFetch<T>(endpoint: string, ids: string[]): Promise<Map<string, T>> {
    return new Promise((resolve) => {
      const queueKey = `batch-${endpoint}`;
      const existingQueue = this.batchQueue.get(queueKey) || [];

      existingQueue.push(resolve);
      this.batchQueue.set(queueKey, existingQueue);

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(async () => {
        const queue = this.batchQueue.get(queueKey) || [];
        this.batchQueue.delete(queueKey);

        const response = await axios.post(`${API_BASE_URL}/${endpoint}/batch`, {
          ids: ids,
        });

        const resultMap = new Map(Object.entries(response.data));

        queue.forEach((resolver) => resolver(resultMap));
      }, 50);
    });
  }

  async trackInteraction(skinId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/analytics/track`, {
        skinId,
        action,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }
}

export const apiService = new ApiService();
