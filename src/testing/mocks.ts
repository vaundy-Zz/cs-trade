import nock from 'nock';
import { SteamPriceOverviewResponse } from '@/clients/types';

export interface MockApiOptions {
  delay?: number;
  statusCode?: number;
}

export class SteamApiMock {
  private baseURL = 'https://steamcommunity.com';

  mockPriceOverview(
    appId: number,
    marketHashName: string,
    response: SteamPriceOverviewResponse,
    options?: MockApiOptions,
  ): nock.Scope {
    let scope = nock(this.baseURL).get('/market/priceoverview/').query({
      appid: appId,
      market_hash_name: marketHashName,
      currency: /.*/,
    });

    if (options?.delay) {
      scope = scope.delay(options.delay);
    }

    return scope.reply(options?.statusCode ?? 200, response);
  }

  mockRateLimitError(appId: number, marketHashName: string): nock.Scope {
    return nock(this.baseURL)
      .get('/market/priceoverview/')
      .query({
        appid: appId,
        market_hash_name: marketHashName,
        currency: /.*/,
      })
      .reply(429, { error: 'Rate limit exceeded' }, { 'Retry-After': '60' });
  }

  mockServerError(appId: number, marketHashName: string): nock.Scope {
    return nock(this.baseURL)
      .get('/market/priceoverview/')
      .query({
        appid: appId,
        market_hash_name: marketHashName,
        currency: /.*/,
      })
      .reply(500, { error: 'Internal server error' });
  }

  mockNetworkError(appId: number, marketHashName: string): nock.Scope {
    return nock(this.baseURL)
      .get('/market/priceoverview/')
      .query({
        appid: appId,
        market_hash_name: marketHashName,
        currency: /.*/,
      })
      .replyWithError('ECONNREFUSED');
  }

  clean(): void {
    nock.cleanAll();
  }
}

export class BuffApiMock {
  private baseURL = 'https://buff.163.com/api';

  mockGetItem(
    itemId: string,
    response: {
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
    },
    options?: MockApiOptions,
  ): nock.Scope {
    let scope = nock(this.baseURL).get('/market/goods/info').query({
      goods_id: itemId,
    });

    if (options?.delay) {
      scope = scope.delay(options.delay);
    }

    return scope.reply(options?.statusCode ?? 200, response);
  }

  mockGetOrderBook(
    itemId: string,
    response: {
      code: string;
      data: {
        sell_orders: Array<{ price: number; amount: number }>;
        buy_orders: Array<{ price: number; amount: number }>;
        updated_at: string;
      };
    },
    options?: MockApiOptions,
  ): nock.Scope {
    let scope = nock(this.baseURL).get('/market/goods/orderbook').query({
      goods_id: itemId,
    });

    if (options?.delay) {
      scope = scope.delay(options.delay);
    }

    return scope.reply(options?.statusCode ?? 200, response);
  }

  mockRateLimitError(itemId: string): nock.Scope {
    return nock(this.baseURL)
      .get('/market/goods/info')
      .query({
        goods_id: itemId,
      })
      .reply(429, { error: 'Rate limit exceeded' }, { 'Retry-After': '60' });
  }

  clean(): void {
    nock.cleanAll();
  }
}

export const createMockSteamApi = () => new SteamApiMock();
export const createMockBuffApi = () => new BuffApiMock();
