# Redis Cache Service

This project provides a fully-featured Redis caching layer implemented with [`ioredis`](https://github.com/redis/ioredis). It includes connection pooling, health checks, instrumentation, and a simple API for managing namespaced cache entries. The cache supports dynamic TTL configuration, cache busting for ingestion workflows, and detailed metrics for monitoring cache performance.

## Features

- **Connection Pooling:** Built with `generic-pool`, the cache maintains a pool of Redis connections to maximize performance and resilience.
- **Health Checks:** Exposes a `healthCheck()` method to verify connectivity and measure latency to Redis.
- **Namespaced Keys:** Supports multiple cache domains: market data, charts, API responses, user preferences, and system configuration.
- **Configurable TTLs:** Sensible defaults can be overridden per namespace or per operation.
- **Cache Busting:** Individual keys or entire namespaces can be invalidated (useful after ingesting new data).
- **Instrumentation:** Captures hits, misses, sets, deletes, errors, and hit rate per namespace.
- **Integration Tests:** Comprehensive test coverage using `ioredis-mock` validates cache behaviors and fallback paths.

## Getting Started

### Installation

```bash
npm install
```

### Building from source

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Usage

```ts
import { RedisCache } from './dist';

const cache = new RedisCache({
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  },
});

const key = 'ticker-AAPL';
const namespace = 'marketData';

const data = await cache.get(namespace, key, async () => {
  const fetched = await fetchMarketData('AAPL');
  return fetched;
});

await cache.invalidateNamespace('marketData');
```

## Monitoring

The `RedisCache` instance includes simple instrumentation (hits, misses, sets, deletes, errors, and hit rate per namespace). You can access the snapshot via `cache.getMetrics()`.

## Configuration

### Namespace TTLs

| Namespace        | Description                     | Default TTL |
|------------------|---------------------------------|-------------|
| `marketData`     | Real-time market quotes         | 15 minutes (900s) |
| `charts`         | Chart snapshots and analytics   | 1 hour (3600s) |
| `apiResponses`   | REST/GraphQL API responses      | 5 minutes (300s) |
| `userPreferences`| User profile & settings         | 2 hours (7200s) |
| `systemConfig`   | System-level configuration      | 24 hours (86400s) |

The TTL values can be overridden per operation (`cache.set(..., { ttl })`) or globally by extending the `CACHE_NAMESPACES` constants.

### Constructor Options

Customize TTLs and connection pooling by passing options to the `RedisCache` constructor:

```ts
const cache = new RedisCache({
  redis: { host: 'redis.example.com', port: 6379 },
  poolMin: 2,
  poolMax: 20,
  healthCheckIntervalMs: 30000,
  logLevel: 'debug',
});
```

## Cache Invalidations After Ingestion

Call `invalidateNamespace(namespace)` to flush stale data after ingestion. The method scans for keys matching the namespace pattern and removes them efficiently using Redis `SCAN`.

## License

MIT
