import RedisMock from 'ioredis-mock';
import { RedisCache } from '../src/cache/RedisCache';
import { RedisCacheOptions } from '../src/cache/config';
import pino from 'pino';

describe('RedisCache', () => {
  let cache: RedisCache;
  let mockLogger: any;

  beforeEach(async () => {
    mockLogger = pino({ level: 'silent' });

    const config: RedisCacheOptions = {
      redis: {
        host: 'localhost',
        port: 6379,
      },
      poolMin: 1,
      poolMax: 5,
      logger: mockLogger,
      redisFactory: RedisMock as any,
    };

    cache = new RedisCache(config);
  });

  afterEach(async () => {
    await cache.shutdown();
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      await cache.set('marketData', 'test-key', { price: 100 });
      const result = await cache.get('marketData', 'test-key');

      expect(result).toEqual({ price: 100 });
    });

    it('should return null for missing keys', async () => {
      const result = await cache.get('marketData', 'non-existent');

      expect(result).toBeNull();
    });

    it('should use fallback when key is missing', async () => {
      const fallback = jest.fn().mockResolvedValue({ data: 'fallback' });
      const result = await cache.get('apiResponses', 'missing-key', fallback);

      expect(fallback).toHaveBeenCalled();
      expect(result).toEqual({ data: 'fallback' });

      const cached = await cache.get('apiResponses', 'missing-key');
      expect(cached).toEqual({ data: 'fallback' });
    });

    it('should not call fallback when key exists', async () => {
      await cache.set('marketData', 'existing-key', { price: 200 });
      const fallback = jest.fn().mockResolvedValue({ price: 300 });

      const result = await cache.get('marketData', 'existing-key', fallback);

      expect(fallback).not.toHaveBeenCalled();
      expect(result).toEqual({ price: 200 });
    });

    it('should invalidate a specific key', async () => {
      await cache.set('charts', 'chart-1', { type: 'line' });
      await cache.invalidate('charts', 'chart-1');

      const result = await cache.get('charts', 'chart-1');
      expect(result).toBeNull();
    });

    it('should reject when trying to cache undefined values', async () => {
      await expect(cache.set('marketData', 'undefined-key', undefined as any)).rejects.toThrow('Cannot cache undefined values');
    });
  });

  describe('Namespacing', () => {
    it('should isolate keys by namespace', async () => {
      await cache.set('marketData', 'price', { value: 100 });
      await cache.set('charts', 'price', { value: 200 });

      const marketDataValue = await cache.get('marketData', 'price');
      const chartsValue = await cache.get('charts', 'price');

      expect(marketDataValue).toEqual({ value: 100 });
      expect(chartsValue).toEqual({ value: 200 });
    });

    it('should invalidate entire namespace', async () => {
      await cache.set('marketData', 'key1', { data: 1 });
      await cache.set('marketData', 'key2', { data: 2 });
      await cache.set('charts', 'key1', { data: 3 });

      await cache.invalidateNamespace('marketData');

      const market1 = await cache.get('marketData', 'key1');
      const market2 = await cache.get('marketData', 'key2');
      const chart1 = await cache.get('charts', 'key1');

      expect(market1).toBeNull();
      expect(market2).toBeNull();
      expect(chart1).toEqual({ data: 3 });
    });

    it('should use correct TTLs per namespace', async () => {
      await cache.set('marketData', 'key1', { data: 'market' });
      await cache.set('charts', 'key2', { data: 'chart' });

      const marketDataValue = await cache.get('marketData', 'key1');
      const chartsValue = await cache.get('charts', 'key2');

      expect(marketDataValue).toEqual({ data: 'market' });
      expect(chartsValue).toEqual({ data: 'chart' });
    });
  });

  describe('TTL Configuration', () => {
    it('should accept custom TTL in options', async () => {
      await cache.set('apiResponses', 'custom-ttl', { data: 'test' }, { ttl: 60 });
      const result = await cache.get('apiResponses', 'custom-ttl');

      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when redis is connected', async () => {
      const health = await cache.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.latency).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Metrics and Instrumentation', () => {
    it('should track cache hits', async () => {
      await cache.set('marketData', 'metric-key', { data: 'test' });
      await cache.get('marketData', 'metric-key');
      await cache.get('marketData', 'metric-key');

      const metrics = cache.getMetrics();

      expect(metrics.marketData.hits).toBe(2);
      expect(metrics.marketData.hitRate).toBe(1);
    });

    it('should track cache misses', async () => {
      await cache.get('marketData', 'missing-1');
      await cache.get('marketData', 'missing-2');

      const metrics = cache.getMetrics();

      expect(metrics.marketData.misses).toBe(2);
      expect(metrics.marketData.hitRate).toBe(0);
    });

    it('should track cache sets', async () => {
      await cache.set('charts', 'set-key-1', { data: 1 });
      await cache.set('charts', 'set-key-2', { data: 2 });

      const metrics = cache.getMetrics();

      expect(metrics.charts.sets).toBe(2);
    });

    it('should track cache deletes', async () => {
      await cache.set('apiResponses', 'del-key', { data: 'test' });
      await cache.invalidate('apiResponses', 'del-key');

      const metrics = cache.getMetrics();

      expect(metrics.apiResponses.deletes).toBe(1);
    });

    it('should calculate hit rate correctly', async () => {
      await cache.set('marketData', 'rate-key', { data: 'test' });
      await cache.get('marketData', 'rate-key');
      await cache.get('marketData', 'rate-key');
      await cache.get('marketData', 'missing-key');

      const metrics = cache.getMetrics();

      expect(metrics.marketData.hits).toBe(2);
      expect(metrics.marketData.misses).toBe(1);
      expect(metrics.marketData.hitRate).toBeCloseTo(2 / 3, 2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when namespace or key is missing', async () => {
      await expect(cache.get('' as any, 'key')).rejects.toThrow('namespace and key must be provided');
      await expect(cache.get('marketData', '')).rejects.toThrow('namespace and key must be provided');
    });

    it('should require redis configuration', () => {
      expect(() => new RedisCache({} as any)).toThrow('Redis configuration is required');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent reads', async () => {
      await cache.set('marketData', 'concurrent-key', { data: 'concurrent' });

      const results = await Promise.all([
        cache.get('marketData', 'concurrent-key'),
        cache.get('marketData', 'concurrent-key'),
        cache.get('marketData', 'concurrent-key'),
        cache.get('marketData', 'concurrent-key'),
        cache.get('marketData', 'concurrent-key'),
      ]);

      results.forEach(result => {
        expect(result).toEqual({ data: 'concurrent' });
      });
    });

    it('should handle concurrent writes', async () => {
      await Promise.all([
        cache.set('marketData', 'write-1', { id: 1 }),
        cache.set('marketData', 'write-2', { id: 2 }),
        cache.set('marketData', 'write-3', { id: 3 }),
        cache.set('marketData', 'write-4', { id: 4 }),
        cache.set('marketData', 'write-5', { id: 5 }),
      ]);

      const results = await Promise.all([
        cache.get('marketData', 'write-1'),
        cache.get('marketData', 'write-2'),
        cache.get('marketData', 'write-3'),
        cache.get('marketData', 'write-4'),
        cache.get('marketData', 'write-5'),
      ]);

      expect(results).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ]);
    });
  });

  describe('Complex Data Types', () => {
    it('should cache arrays', async () => {
      const data = [1, 2, 3, 4, 5];
      await cache.set('apiResponses', 'array-key', data);
      const result = await cache.get('apiResponses', 'array-key');

      expect(result).toEqual(data);
    });

    it('should cache nested objects', async () => {
      const data = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
      };

      await cache.set('userPreferences', 'nested-key', data);
      const result = await cache.get('userPreferences', 'nested-key');

      expect(result).toEqual(data);
    });

    it('should cache null values', async () => {
      await cache.set('systemConfig', 'null-key', null);
      const result = await cache.get('systemConfig', 'null-key');

      expect(result).toBeNull();
    });
  });
});
