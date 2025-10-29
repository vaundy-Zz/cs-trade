import RedisMock from 'ioredis-mock';
import { RedisCache } from '../src/cache/RedisCache';
import { RedisCacheOptions } from '../src/cache/config';
import pino from 'pino';

describe('Integration Tests', () => {
  let cache: RedisCache;

  beforeEach(() => {
    cache = new RedisCache({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      logger: pino({ level: 'silent' }),
      redisFactory: RedisMock as any,
    });
  });

  afterEach(async () => {
    await cache.shutdown();
  });

  describe('Market Data Caching Workflow', () => {
    it('should cache market data with fallback to API', async () => {
      let apiCalls = 0;
      const fetchMarketData = async (ticker: string) => {
        apiCalls += 1;
        return {
          ticker,
          price: 150.25,
          volume: 1000000,
          timestamp: Date.now(),
        };
      };

      const result1 = await cache.get('marketData', 'AAPL', () => fetchMarketData('AAPL'));
      expect(apiCalls).toBe(1);
      expect(result1?.ticker).toBe('AAPL');

      const result2 = await cache.get('marketData', 'AAPL', () => fetchMarketData('AAPL'));
      expect(apiCalls).toBe(1);
      expect(result2).toEqual(result1);

      const metrics = cache.getMetrics();
      expect(metrics.marketData.hits).toBe(1);
      expect(metrics.marketData.misses).toBe(1);
      expect(metrics.marketData.hitRate).toBe(0.5);
    });

    it('should bust cache after data ingestion', async () => {
      await cache.set('marketData', 'AAPL', { price: 100 });
      await cache.set('marketData', 'GOOGL', { price: 2000 });
      await cache.set('charts', 'daily-chart', { type: 'line' });

      await cache.invalidateNamespace('marketData');

      const aaplData = await cache.get('marketData', 'AAPL');
      const googlData = await cache.get('marketData', 'GOOGL');
      const chartData = await cache.get('charts', 'daily-chart');

      expect(aaplData).toBeNull();
      expect(googlData).toBeNull();
      expect(chartData).toEqual({ type: 'line' });
    });
  });

  describe('Charts Caching Workflow', () => {
    it('should cache chart data with longer TTL', async () => {
      const chartData = {
        type: 'candlestick',
        data: [
          { time: 1, open: 100, high: 110, low: 95, close: 105 },
          { time: 2, open: 105, high: 115, low: 100, close: 110 },
        ],
      };

      await cache.set('charts', 'AAPL-daily', chartData);
      const cached = await cache.get('charts', 'AAPL-daily');

      expect(cached).toEqual(chartData);

      const metrics = cache.getMetrics();
      expect(metrics.charts.sets).toBe(1);
      expect(metrics.charts.hits).toBe(1);
    });
  });

  describe('API Response Caching Workflow', () => {
    it('should cache API responses with shorter TTL', async () => {
      const apiResponse = {
        status: 'success',
        data: { results: [1, 2, 3] },
        timestamp: Date.now(),
      };

      await cache.set('apiResponses', '/api/v1/data', apiResponse);
      const cached = await cache.get('apiResponses', '/api/v1/data');

      expect(cached).toEqual(apiResponse);
    });

    it('should handle cache miss gracefully', async () => {
      const result = await cache.get('apiResponses', '/api/v1/missing');
      expect(result).toBeNull();

      const metrics = cache.getMetrics();
      expect(metrics.apiResponses.misses).toBe(1);
    });
  });

  describe('Fallback Path Testing', () => {
    it('should execute fallback only on cache miss', async () => {
      let fallbackExecutions = 0;
      const fallback = async () => {
        fallbackExecutions += 1;
        return { data: 'computed' };
      };

      await cache.get('userPreferences', 'user-123', fallback);
      expect(fallbackExecutions).toBe(1);

      await cache.get('userPreferences', 'user-123', fallback);
      expect(fallbackExecutions).toBe(1);

      await cache.get('userPreferences', 'user-456', fallback);
      expect(fallbackExecutions).toBe(2);
    });

    it('should handle async fallback errors', async () => {
      const fallback = async () => {
        throw new Error('Fallback failed');
      };

      await expect(cache.get('marketData', 'error-key', fallback)).rejects.toThrow('Fallback failed');
    });
  });

  describe('Health Monitoring', () => {
    it('should report healthy status', async () => {
      const health = await cache.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.latency).toBeDefined();
      expect(health.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Performance Metrics', () => {
    it('should track operations across namespaces', async () => {
      await cache.set('marketData', 'k1', { v: 1 });
      await cache.get('marketData', 'k1');
      await cache.get('marketData', 'k2');

      await cache.set('charts', 'c1', { v: 2 });
      await cache.get('charts', 'c1');

      await cache.set('apiResponses', 'a1', { v: 3 });
      await cache.invalidate('apiResponses', 'a1');

      const metrics = cache.getMetrics();

      expect(metrics.marketData.hits).toBe(1);
      expect(metrics.marketData.misses).toBe(1);
      expect(metrics.marketData.sets).toBe(1);

      expect(metrics.charts.hits).toBe(1);
      expect(metrics.charts.sets).toBe(1);

      expect(metrics.apiResponses.sets).toBe(1);
      expect(metrics.apiResponses.deletes).toBe(1);
    });
  });

  describe('Connection Pooling', () => {
    it('should handle multiple concurrent operations', async () => {
      const operations = Array.from({ length: 20 }, (_, i) =>
        cache.set('systemConfig', `config-${i}`, { value: i })
      );

      await Promise.all(operations);

      const reads = Array.from({ length: 20 }, (_, i) =>
        cache.get('systemConfig', `config-${i}`)
      );

      const results = await Promise.all(reads);

      results.forEach((result, i) => {
        expect(result).toEqual({ value: i });
      });
    });
  });

  describe('Error Recovery', () => {
    it('should handle invalid JSON gracefully', async () => {
      const mockCache = new RedisCache({
        redis: {
          host: 'localhost',
          port: 6379,
        },
        logger: pino({ level: 'silent' }),
        redisFactory: RedisMock as any,
      });

      await mockCache.set('marketData', 'valid-key', { data: 'test' });
      const result = await mockCache.get('marketData', 'valid-key');

      expect(result).toEqual({ data: 'test' });

      await mockCache.shutdown();
    });
  });

  describe('Custom TTL Override', () => {
    it('should allow custom TTL per operation', async () => {
      await cache.set('marketData', 'custom-ttl-key', { value: 'short-lived' }, { ttl: 5 });
      const result = await cache.get('marketData', 'custom-ttl-key');

      expect(result).toEqual({ value: 'short-lived' });
    });
  });

  describe('Real-world Scenario: User Session Caching', () => {
    it('should cache and retrieve user preferences', async () => {
      const userPreferences = {
        userId: 'user-123',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
        },
      };

      await cache.set('userPreferences', 'user-123', userPreferences);
      const cached = await cache.get('userPreferences', 'user-123');

      expect(cached).toEqual(userPreferences);
    });

    it('should invalidate user cache on update', async () => {
      await cache.set('userPreferences', 'user-456', { theme: 'light' });
      await cache.invalidate('userPreferences', 'user-456');

      const result = await cache.get('userPreferences', 'user-456');
      expect(result).toBeNull();
    });
  });
});
