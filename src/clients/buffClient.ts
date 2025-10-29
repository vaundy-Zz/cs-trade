import { HttpClient } from '@/http/httpClient';
import { HttpClientConfig } from '@/http/types';
import { Logger } from '@/logger';
import { MarketOrderBook, ThirdPartyMarketItem } from './types';
import { ApiError } from '@/utils/error';

export interface BuffApiConfig {
  apiKey: string;
  baseURL?: string;
}

interface BuffItemResponse {
  code: string;
  data: {
    id: string;
    name: string;
    market_hash_name: string;
    price: number;
    currency: string;
    sell_min_price: number;
    sell_num: number;
    buy_max_price: number;
    buy_num: number;
    updated_at: string;
  };
}

interface BuffOrderBookResponse {
  code: string;
  data: {
    sell_orders: Array<{ price: number; amount: number }>;
    buy_orders: Array<{ price: number; amount: number }>;
    updated_at: string;
  };
}

export class BuffClient {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  constructor(config: BuffApiConfig, logger: Logger) {
    const httpConfig: HttpClientConfig = {
      baseURL: config.baseURL ?? 'https://buff.163.com/api',
      timeout: 8000,
      maxRetries: 3,
      retryDelay: 300,
      maxRetryDelay: 4000,
      headers: {
        'User-Agent': 'ApiClient/1.0',
        Accept: 'application/json',
        'X-Api-Key': config.apiKey,
      },
    };

    this.httpClient = new HttpClient(httpConfig, logger);
    this.logger = logger;
  }

  async getItem(itemId: string): Promise<ThirdPartyMarketItem> {
    this.logger.info('Fetching Buff item', { itemId });

    try {
      const response = await this.httpClient.request<BuffItemResponse>({
        method: 'GET',
        url: `/market/goods/info`,
        params: {
          goods_id: itemId,
        },
      });

      if (response.data.code !== 'OK') {
        throw new ApiError('Buff API returned non-OK response', 'BUFF_API_ERROR', response.status);
      }

      return this.normalizeItem(response.data.data);
    } catch (error) {
      this.logger.error('Failed to fetch Buff item', { itemId, error });
      throw error;
    }
  }

  async getOrderBook(itemId: string): Promise<MarketOrderBook> {
    this.logger.info('Fetching Buff order book', { itemId });

    try {
      const response = await this.httpClient.request<BuffOrderBookResponse>({
        method: 'GET',
        url: `/market/goods/orderbook`,
        params: {
          goods_id: itemId,
        },
      });

      if (response.data.code !== 'OK') {
        throw new ApiError('Buff API returned non-OK response', 'BUFF_API_ERROR', response.status);
      }

      return this.normalizeOrderBook(response.data.data);
    } catch (error) {
      this.logger.error('Failed to fetch Buff order book', { itemId, error });
      throw error;
    }
  }

  private normalizeItem(data: BuffItemResponse['data']): ThirdPartyMarketItem {
    return {
      id: data.id,
      name: data.market_hash_name ?? data.name,
      price: data.price,
      currency: data.currency,
      quantity: data.sell_num,
      updatedAt: data.updated_at,
    };
  }

  private normalizeOrderBook(data: BuffOrderBookResponse['data']): MarketOrderBook {
    const bids = data.buy_orders.map((order) => ({ price: order.price, quantity: order.amount }));
    const asks = data.sell_orders.map((order) => ({ price: order.price, quantity: order.amount }));
    const bestBid = bids[0]?.price ?? 0;
    const bestAsk = asks[0]?.price ?? 0;
    const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;

    return {
      bids,
      asks,
      spread,
      lastUpdated: data.updated_at,
    };
  }
}
