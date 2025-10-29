# Redis Cache Documentation

## Overview

This Redis caching library provides a production-ready caching layer with connection pooling, instrumentation, and health checks. It's designed to work with both standard Redis and Upstash Redis deployments.

## Features

### 1. Connection Pooling

Uses `generic-pool` to maintain a pool of Redis connections:

- **Configurable pool size** (min: 1, max: 10 by default)
- **Connection validation** on borrow with PING command
- **Automatic reconnection** on connection failures
- **Idle timeout management** to clean up inactive connections

### 2. Namespaced Keys

Keys are automatically prefixed with their namespace to prevent collisions:

```typescript
// Stored as "marketData:AAPL"
cache.set('marketData', 'AAPL', data);

// Stored as "charts:AAPL"
cache.set('charts', 'AAPL', data);
```

### 3. TTL Management

Each namespace has a default TTL:

- **marketData**: 900s (15 minutes) - For real-time market quotes
- **charts**: 3600s (1 hour) - For chart snapshots
- **apiResponses**: 300s (5 minutes) - For REST/GraphQL responses
- **userPreferences**: 7200s (2 hours) - For user settings
- **systemConfig**: 86400s (24 hours) - For system configuration

TTLs can be overridden per operation:

```typescript
// Use custom TTL of 60 seconds
cache.set('marketData', 'key', data, { ttl: 60 });
```

### 4. Cache Instrumentation

Tracks per-namespace metrics:

- **Hits**: Successful cache retrievals
- **Misses**: Failed cache lookups
- **Sets**: Cache write operations
- **Deletes**: Cache invalidations
- **Errors**: Operation failures
- **Hit Rate**: Ratio of hits to total accesses

```typescript
const metrics = cache.getMetrics();
console.log(metrics.marketData.hitRate); // 0.75
```

### 5. Health Checks

Built-in health monitoring:

```typescript
const health = await cache.healthCheck();
// {
//   healthy: true,
//   latency: 2.5,
//   timestamp: 1698765432000
// }
```

Can be configured to run periodically:

```typescript
const cache = new RedisCache({
  redis: { ... },
  healthCheckIntervalMs: 30_000, // Check every 30 seconds
});
```

### 6. Fallback Pattern

Supports automatic fallback to data source on cache miss:

```typescript
const data = await cache.get('marketData', 'AAPL', async () => {
  // This function is only called on cache miss
  return await fetchFromAPI('AAPL');
});

// If cached, returns cached value
// If not cached, executes fallback, caches result, and returns it
```

### 7. Cache Busting

Invalidate individual keys:

```typescript
await cache.invalidate('marketData', 'AAPL');
```

Or entire namespaces (useful after data ingestion):

```typescript
// Invalidate all market data after ingestion
await cache.invalidateNamespace('marketData');
```

## API Reference

### Constructor

```typescript
new RedisCache(options: RedisCacheOptions)
```

**Options:**

```typescript
interface RedisCacheOptions {
  redis: RedisConfig;
  poolMin?: number; // Default: 1
  poolMax?: number; // Default: 10
  idleTimeoutMillis?: number; // Default: 30000
  evictionRunIntervalMillis?: number; // Default: 15000
  healthCheckIntervalMs?: number; // Optional
  logLevel?: string; // Default: 'info'
  logger?: Logger; // Optional pino logger
  instrumentation?: CacheInstrumentation; // Optional
  redisFactory?: typeof Redis; // Optional (for testing)
}
```

### Methods

#### `get<T>(namespace, key, fallback?, options?)`

Retrieves a value from cache.

```typescript
const data = await cache.get<MarketData>('marketData', 'AAPL');
```

With fallback:

```typescript
const data = await cache.get('marketData', 'AAPL', () => fetchAPI('AAPL'));
```

#### `set<T>(namespace, key, value, options?)`

Stores a value in cache.

```typescript
await cache.set('marketData', 'AAPL', { price: 150.25 });
```

With custom TTL:

```typescript
await cache.set('marketData', 'AAPL', data, { ttl: 120 });
```

#### `invalidate(namespace, key)`

Removes a specific key from cache.

```typescript
await cache.invalidate('marketData', 'AAPL');
```

#### `invalidateNamespace(namespace)`

Removes all keys in a namespace.

```typescript
await cache.invalidateNamespace('marketData');
```

#### `healthCheck()`

Checks Redis connectivity and latency.

```typescript
const health = await cache.healthCheck();
```

#### `getMetrics()`

Returns performance metrics for all namespaces.

```typescript
const metrics = cache.getMetrics();
```

#### `shutdown()`

Gracefully shuts down the cache and connection pool.

```typescript
await cache.shutdown();
```

## Usage Examples

### Basic Usage

```typescript
import { RedisCache } from 'redis-cache-service';

const cache = new RedisCache({
  redis: {
    host: 'localhost',
    port: 6379,
  },
});

// Set a value
await cache.set('marketData', 'AAPL', { price: 150.25 });

// Get a value
const data = await cache.get('marketData', 'AAPL');

// Cleanup
await cache.shutdown();
```

### With Upstash Redis

```typescript
const cache = new RedisCache({
  redis: {
    host: process.env.UPSTASH_REDIS_HOST,
    port: Number(process.env.UPSTASH_REDIS_PORT),
    password: process.env.UPSTASH_REDIS_PASSWORD,
    connectTimeout: 20_000,
    maxRetriesPerRequest: 3,
  },
  poolMin: 1,
  poolMax: 5,
});
```

### With Custom Logging

```typescript
import pino from 'pino';

const cache = new RedisCache({
  redis: { host: 'localhost', port: 6379 },
  logger: pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  }),
});
```

### Post-Ingestion Cache Busting

```typescript
// After ingesting new market data
async function ingestMarketData() {
  await performIngestion();
  
  // Invalidate all cached market data
  await cache.invalidateNamespace('marketData');
  
  console.log('Cache busted after ingestion');
}
```

### Error Handling

```typescript
try {
  const data = await cache.get('marketData', 'AAPL', async () => {
    const response = await fetch('https://api.example.com/stock/AAPL');
    if (!response.ok) throw new Error('API failed');
    return response.json();
  });
} catch (err) {
  console.error('Cache or fallback failed:', err);
  // Handle error
}
```

## Best Practices

### 1. Choose Appropriate TTLs

- **Short TTLs** for frequently changing data (market quotes)
- **Long TTLs** for stable data (user preferences)
- **Very long TTLs** for rarely changing data (system config)

### 2. Use Namespaces Effectively

- Group related data in the same namespace
- Makes bulk invalidation easier
- Provides better metrics granularity

### 3. Monitor Cache Performance

```typescript
setInterval(() => {
  const metrics = cache.getMetrics();
  Object.entries(metrics).forEach(([namespace, stats]) => {
    console.log(`${namespace}: ${(stats.hitRate * 100).toFixed(1)}% hit rate`);
  });
}, 60_000);
```

### 4. Handle Cache Failures Gracefully

Always provide a fallback function for critical data:

```typescript
const data = await cache.get('marketData', key, fetchFromDatabase);
```

### 5. Implement Health Checks

```typescript
app.get('/health', async (req, res) => {
  const health = await cache.healthCheck();
  res.status(health.healthy ? 200 : 503).json(health);
});
```

### 6. Cleanup on Shutdown

```typescript
process.on('SIGTERM', async () => {
  await cache.shutdown();
  process.exit(0);
});
```

## Testing

The library includes comprehensive test coverage:

- Unit tests for instrumentation
- Integration tests for cache operations
- Concurrent operation tests
- Error handling tests
- Fallback path tests

Run tests with:

```bash
npm test
```

## Performance Considerations

### Connection Pooling

- Pool size affects concurrency
- Larger pools handle more concurrent operations
- Monitor active connections vs. pool size

### TTL Strategy

- Shorter TTLs: More cache misses, fresher data
- Longer TTLs: Better performance, potentially stale data
- Balance based on data freshness requirements

### Serialization

- Uses JSON for serialization
- Large objects may impact performance
- Consider compressing very large values

## Troubleshooting

### High Cache Miss Rate

- Check TTL configuration
- Verify cache invalidation logic
- Monitor data access patterns

### Connection Issues

- Verify Redis host/port/password
- Check network connectivity
- Review Redis server logs
- Adjust connection timeout settings

### Memory Pressure

- Review TTL settings (data expiring too slowly?)
- Monitor Redis memory usage
- Consider implementing eviction policies

## License

MIT
