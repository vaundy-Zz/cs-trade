import Redis from "ioredis";
import { logger } from "@/observability/logger";
import { getEnv } from "@/config/env";

export interface CacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<number>;
  disconnect(): Promise<void>;
}

class RedisCacheProvider implements CacheProvider {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true
    });

    this.client.on("error", (err) => {
      logger.error({ err }, "Redis client error");
    });

    this.client.on("connect", () => {
      logger.info("Redis client connected");
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error({ error, key }, "Redis GET error");
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, "EX", ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error({ error, key }, "Redis SET error");
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error({ error, key }, "Redis DEL error");
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error({ error, pattern }, "Redis pattern invalidation error");
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

class InMemoryCacheProvider implements CacheProvider {
  private cache: Map<string, { value: string; expiresAt?: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  async disconnect(): Promise<void> {
    this.cache.clear();
  }
}

let cacheInstance: CacheProvider | null = null;

export const getCache = async (): Promise<CacheProvider> => {
  if (cacheInstance) {
    return cacheInstance;
  }

  const env = getEnv();

  if (env.REDIS_URL) {
    try {
      const redisCache = new RedisCacheProvider(env.REDIS_URL);
      await redisCache.connect();
      cacheInstance = redisCache;
      logger.info("Redis cache initialized");
    } catch (error) {
      logger.warn({ error }, "Failed to initialize Redis, falling back to in-memory cache");
      cacheInstance = new InMemoryCacheProvider();
    }
  } else {
    logger.info("Redis URL not configured, using in-memory cache");
    cacheInstance = new InMemoryCacheProvider();
  }

  return cacheInstance;
};

export const invalidateCacheKeys = async (patterns: string[]): Promise<void> => {
  const cache = await getCache();
  let totalInvalidated = 0;

  for (const pattern of patterns) {
    const count = await cache.invalidatePattern(pattern);
    totalInvalidated += count;
  }

  logger.info({ patterns, count: totalInvalidated }, "Cache invalidation completed");
};
