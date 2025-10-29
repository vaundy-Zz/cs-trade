import RedisMock from 'ioredis-mock';
import { MarketService } from '@/services/marketService';
import { SteamClient } from '@/clients/steamClient';
import { BuffClient } from '@/clients/buffClient';
import { RedisRateLimiter } from '@/rateLimit/redisRateLimiter';
import { QuotaTracker } from '@/rateLimit/quotaTracker';
import { PinoLogger } from '@/logger';
import { createMockSteamApi, createMockBuffApi } from '@/testing/mocks';

const logger = new PinoLogger({ level: 'silent' });

describe('MarketService', () => {
  let redis: any;
  let steamClient: SteamClient;
  let buffClient: BuffClient;
  let marketService: MarketService;
  const steamMock = createMockSteamApi();
  const buffMock = createMockBuffApi();

  beforeEach(() => {
    redis = new RedisMock();
    steamClient = new SteamClient({ apiKey: 'steam-key' }, logger);
    buffClient = new BuffClient({ apiKey: 'buff-key' }, logger);

    const steamLimiter = new RedisRateLimiter(redis, {
      maxRequests: 3,
      windowMs: 1000,
      keyPrefix: 'steam-limit',
    });

    const buffLimiter = new RedisRateLimiter(redis, {
      maxRequests: 2,
      windowMs: 1000,
      keyPrefix: 'buff-limit',
    });

    const quotaTracker = new QuotaTracker(redis, logger);

    marketService = new MarketService({
      steamClient,
      buffClient,
      logger,
      rateLimiters: {
        steam: steamLimiter,
        buff: buffLimiter,
      },
      quotaTracker,
      quotaConfig: {
        steam: { dailyQuota: 100, monthlyQuota: 1000 },
        buff: { dailyQuota: 50 },
      },
    });

    steamMock.clean();
    buffMock.clean();
  });

  afterEach(async () => {
    await redis.flushall();
    steamMock.clean();
    buffMock.clean();
  });

  it('should fetch unified quotes from Steam and Buff', async () => {
    steamMock.mockPriceOverview(730, 'AK-47', {
      success: true,
      lowest_price: '$10.00',
      median_price: '$10.50',
      volume: '1,000',
    });

    buffMock.mockGetItem('123', {
      code: 'OK',
      data: {
        id: '123',
        name: 'AK-47 | Redline',
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        price: 11,
        currency: 'USD',
        sell_min_price: 10.75,
        sell_num: 60,
        buy_max_price: 10.5,
        buy_num: 45,
        updated_at: new Date().toISOString(),
      },
    });

    buffMock.mockGetOrderBook('123', {
      code: 'OK',
      data: {
        sell_orders: [{ price: 11, amount: 5 }],
        buy_orders: [{ price: 10.5, amount: 4 }],
        updated_at: new Date().toISOString(),
      },
    });

    const quotes = await marketService.getAllQuotes(730, 'AK-47', '123', {
      currency: 'USD',
    });

    expect(quotes).toHaveLength(2);
    const sources = quotes.map((q) => q.source);
    expect(sources).toContain('steam');
    expect(sources).toContain('buff');
  });

  it('should respect rate limits and throw when exceeded', async () => {
    steamMock.mockPriceOverview(730, 'AK-47', {
      success: true,
      lowest_price: '$10.00',
      median_price: '$10.50',
      volume: '1,000',
    });

    await marketService.getSteamQuote(730, 'AK-47');
    await marketService.getSteamQuote(730, 'AK-47');
    await marketService.getSteamQuote(730, 'AK-47');

    await expect(marketService.getSteamQuote(730, 'AK-47')).rejects.toThrow('Rate limit exceeded');
  });

  it('should continue when one API fails', async () => {
    steamMock.mockServerError(730, 'AK-47');

    buffMock.mockGetItem('123', {
      code: 'OK',
      data: {
        id: '123',
        name: 'AK-47 | Redline',
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        price: 11,
        currency: 'USD',
        sell_min_price: 10.75,
        sell_num: 60,
        buy_max_price: 10.5,
        buy_num: 45,
        updated_at: new Date().toISOString(),
      },
    });

    buffMock.mockGetOrderBook('123', {
      code: 'OK',
      data: {
        sell_orders: [{ price: 11, amount: 5 }],
        buy_orders: [{ price: 10.5, amount: 4 }],
        updated_at: new Date().toISOString(),
      },
    });

    const quotes = await marketService.getAllQuotes(730, 'AK-47', '123');

    expect(quotes).toHaveLength(1);
    expect(quotes[0].source).toBe('buff');
  });
});
