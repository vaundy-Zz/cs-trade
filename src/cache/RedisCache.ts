import Redis, { Redis as RedisClient } from 'ioredis';
import { createPool, Pool, Options as PoolOptions } from 'generic-pool';
import pino, { Logger } from 'pino';
import { CACHE_NAMESPACES, DEFAULT_CACHE_OPTIONS, RedisCacheOptions } from './config';
import { CacheMetrics, CacheOptions, HealthCheckResult } from '../types';
import { CacheInstrumentation } from './instrumentation';

export type CacheNamespace = keyof typeof CACHE_NAMESPACES;

type RedisFactory = typeof Redis;

export class RedisCache {
  private readonly pool: Pool<RedisClient>;
  private readonly logger: Logger;
  private readonly instrumentation: CacheInstrumentation;
  private readonly config: RedisCacheOptions;
  private readonly namespacedTtls: Record<CacheNamespace, number>;
  private readonly checkIntervalHandle?: NodeJS.Timeout;
  private readonly RedisCtor: RedisFactory;

  constructor(options: RedisCacheOptions) {
    if (!options.redis) {
      throw new Error('Redis configuration is required');
    }

    this.config = {
      ...DEFAULT_CACHE_OPTIONS,
      ...options,
    } as RedisCacheOptions;

    this.logger = options.logger ?? pino({
      name: 'redis-cache',
      level: options.logLevel ?? 'info',
    });

    this.instrumentation = options.instrumentation ?? new CacheInstrumentation();
    this.namespacedTtls = { ...CACHE_NAMESPACES };
    this.RedisCtor = options.redisFactory ?? Redis;

    const poolOptions: PoolOptions = {
      min: this.config.poolMin ?? 1,
      max: this.config.poolMax ?? 10,
      testOnBorrow: true,
      autostart: true,
      idleTimeoutMillis: this.config.idleTimeoutMillis ?? 30_000,
      evictionRunIntervalMillis: this.config.evictionRunIntervalMillis ?? 15_000,
    };

    this.pool = createPool<RedisClient>({
      create: async () => {
        const client = new this.RedisCtor({
          host: this.config.redis.host,
          port: this.config.redis.port,
          password: this.config.redis.password,
          db: this.config.redis.db ?? 0,
          keyPrefix: this.config.redis.keyPrefix,
          maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest ?? 2,
          enableReadyCheck: this.config.redis.enableReadyCheck ?? true,
          enableOfflineQueue: this.config.redis.enableOfflineQueue ?? true,
          connectTimeout: this.config.redis.connectTimeout ?? 10_000,
          lazyConnect: this.config.redis.lazyConnect ?? false,
        });

        client.on('error', (err) => {
          this.logger.error({ err }, 'Redis client error');
          this.instrumentation.incrementError();
        });

        client.on('connect', () => {
          this.logger.debug('Redis client connected');
        });

        client.on('ready', () => {
          this.logger.debug('Redis client ready');
        });

        return client;
      },
      destroy: async (client: RedisClient) => {
        await client.quit();
      },
      validate: async (client: RedisClient) => {
        try {
          await client.ping();
          return true;
        } catch (err) {
          this.logger.warn({ err }, 'Redis client validation failed');
          return false;
        }
      },
    }, poolOptions);

    if (this.config.healthCheckIntervalMs) {
      this.checkIntervalHandle = setInterval(
        () => {
          void this.healthCheck();
        },
        this.config.healthCheckIntervalMs,
      );
      this.checkIntervalHandle.unref();
    }
  }

  async shutdown(): Promise<void> {
    if (this.checkIntervalHandle) {
      clearInterval(this.checkIntervalHandle);
    }

    await this.pool.drain();
    await this.pool.clear();
  }

  async get<T>(namespace: CacheNamespace, key: string, fallback?: () => Promise<T> | T, options?: CacheOptions): Promise<T | null> {
    const namespacedKey = this.buildKey(namespace, key);

    return this.useClient(async (client) => {
      const start = process.hrtime.bigint();
      const cached = await client.get(namespacedKey);

      if (cached !== null) {
        const parsed = this.safeParse<T>(namespace, cached);
        this.instrumentation.recordHit(namespace, Number(process.hrtime.bigint() - start) / 1_000_000);
        this.logger.debug({ namespace, key }, 'cache hit');
        return parsed;
      }

      this.instrumentation.recordMiss(namespace, Number(process.hrtime.bigint() - start) / 1_000_000);
      this.logger.debug({ namespace, key }, 'cache miss');

      if (!fallback) {
        return null;
      }

      const result = await fallback();

      if (result !== undefined) {
        await this.set(namespace, key, result, options);
        return result;
      }

      return null;
    });
  }

  async set<T>(namespace: CacheNamespace, key: string, value: T, options?: CacheOptions): Promise<void> {
    const namespacedKey = this.buildKey(namespace, key);
    const ttl = options?.ttl ?? this.namespacedTtls[namespace];

    await this.useClient(async (client) => {
      const start = process.hrtime.bigint();
      const payload = JSON.stringify(value);

      if (payload === undefined) {
        throw new Error('Cannot cache undefined values');
      }

      if (ttl > 0) {
        await client.set(namespacedKey, payload, 'EX', ttl);
      } else {
        await client.set(namespacedKey, payload);
      }

      this.instrumentation.recordSet(namespace, Number(process.hrtime.bigint() - start) / 1_000_000);
      this.logger.debug({ namespace, key, ttl }, 'cache set');
    });
  }

  async invalidate(namespace: CacheNamespace, key: string): Promise<void> {
    const namespacedKey = this.buildKey(namespace, key);
    await this.useClient(async (client) => {
      const start = process.hrtime.bigint();
      await client.del(namespacedKey);
      this.instrumentation.recordDelete(namespace, Number(process.hrtime.bigint() - start) / 1_000_000);
      this.logger.debug({ namespace, key }, 'cache key invalidated');
    });
  }

  async invalidateNamespace(namespace: CacheNamespace): Promise<void> {
    const pattern = `${namespace}:*`;
    await this.useClient(async (client) => {
      const start = process.hrtime.bigint();
      let cursor = '0';
      let totalDeleted = 0;
      do {
        // eslint-disable-next-line no-await-in-loop
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          totalDeleted += await client.del(...keys);
        }
      } while (cursor !== '0');

      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      if (totalDeleted > 0) {
        this.instrumentation.recordDelete(namespace, durationMs, totalDeleted);
      }

      this.logger.info({ namespace, totalDeleted, durationMs }, 'namespace invalidated');
    });
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = process.hrtime.bigint();
    try {
      await this.useClient((client) => client.ping());
      const latency = Number(process.hrtime.bigint() - start) / 1_000_000;
      this.logger.debug({ latency }, 'redis health check succeeded');
      return {
        healthy: true,
        latency,
        timestamp: Date.now(),
      };
    } catch (err: unknown) {
      const latency = Number(process.hrtime.bigint() - start) / 1_000_000;
      const error = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error({ latency, err }, 'redis health check failed');
      this.instrumentation.incrementError();
      return {
        healthy: false,
        latency,
        error,
        timestamp: Date.now(),
      };
    }
  }

  getMetrics(): Record<CacheNamespace, CacheMetrics> {
    return this.instrumentation.snapshot();
  }

  private async useClient<T>(fn: (client: RedisClient) => Promise<T>): Promise<T> {
    const client = await this.pool.acquire();
    try {
      return await fn(client);
    } finally {
      await this.pool.release(client);
    }
  }

  private buildKey(namespace: CacheNamespace, key: string): string {
    if (!namespace || !key) {
      throw new Error('namespace and key must be provided');
    }

    return `${namespace}:${key}`;
  }

  private safeParse<T>(namespace: string, payload: string): T {
    try {
      return JSON.parse(payload) as T;
    } catch (err) {
      this.logger.error({ err }, 'failed to parse cached payload');
      this.instrumentation.incrementError(namespace);
      throw err;
    }
  }
}
