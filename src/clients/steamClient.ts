import { HttpClient } from '@/http/httpClient';
import { HttpClientConfig } from '@/http/types';
import { Logger } from '@/logger';
import { SteamMarketItem, SteamPriceOverviewResponse } from './types';
import { ApiError } from '@/utils/error';

export interface SteamApiConfig {
  apiKey?: string;
  baseURL?: string;
}

export class SteamClient {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;
  private readonly apiKey?: string;

  constructor(config: SteamApiConfig, logger: Logger) {
    const httpConfig: HttpClientConfig = {
      baseURL: config.baseURL ?? 'https://steamcommunity.com',
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 300,
      maxRetryDelay: 5000,
      headers: {
        'User-Agent': 'ApiClient/1.0',
        Accept: 'application/json',
      },
    };

    this.httpClient = new HttpClient(httpConfig, logger);
    this.logger = logger;
    this.apiKey = config.apiKey;
  }

  async getPriceOverview(
    appId: number,
    marketHashName: string,
    currency = 1,
  ): Promise<SteamMarketItem> {
    this.logger.info('Fetching Steam price overview', { appId, marketHashName, currency });

    try {
      const response = await this.httpClient.request<SteamPriceOverviewResponse>({
        method: 'GET',
        url: '/market/priceoverview/',
        params: {
          appid: appId,
          market_hash_name: marketHashName,
          currency,
        },
      });

      if (!response.data.success) {
        throw new ApiError('Steam API returned success: false', 'STEAM_API_ERROR', response.status);
      }

      return this.normalizeMarketItem(appId, marketHashName, response.data, currency);
    } catch (error) {
      this.logger.error('Failed to fetch Steam price overview', { appId, marketHashName, error });
      throw error;
    }
  }

  async getMarketListings(appId: number, start = 0, count = 100): Promise<any> {
    this.logger.info('Fetching Steam market listings', { appId, start, count });

    try {
      const response = await this.httpClient.request({
        method: 'GET',
        url: `/market/search/render/`,
        params: {
          appid: appId,
          start,
          count,
          norender: 1,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch Steam market listings', { appId, error });
      throw error;
    }
  }

  private normalizeMarketItem(
    appId: number,
    marketHashName: string,
    data: SteamPriceOverviewResponse,
    currency: number,
  ): SteamMarketItem {
    const lowestPrice = this.parseSteamPrice(data.lowest_price);
    const medianPrice = this.parseSteamPrice(data.median_price);
    const volume = parseInt(data.volume?.replace(/,/g, '') || '0', 10);

    return {
      appId,
      marketHashName,
      lowestPrice,
      medianPrice,
      volume,
      currency: this.getCurrencyCode(currency),
      updatedAt: new Date().toISOString(),
    };
  }

  private parseSteamPrice(priceString?: string): number {
    if (!priceString) return 0;
    const numericPart = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(numericPart) || 0;
  }

  private getCurrencyCode(currencyId: number): string {
    const currencies: Record<number, string> = {
      1: 'USD',
      2: 'GBP',
      3: 'EUR',
      4: 'CHF',
      5: 'RUB',
      6: 'PLN',
      7: 'BRL',
      8: 'JPY',
      9: 'NOK',
      10: 'IDR',
    };
    return currencies[currencyId] ?? 'USD';
  }
}
