import { RedisCache } from '../src/cache/RedisCache';
import pino from 'pino';

async function main() {
  const cache = new RedisCache({
    redis: {
      host: process.env.UPSTASH_REDIS_HOST ?? 'your-upstash-host.upstash.io',
      port: Number(process.env.UPSTASH_REDIS_PORT ?? 6379),
      password: process.env.UPSTASH_REDIS_PASSWORD,
      db: 0,
      connectTimeout: 20_000,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
    },
    poolMin: 1,
    poolMax: 5,
    healthCheckIntervalMs: 60_000,
    logger: pino({
      level: 'info',
      transport: {
        target: 'pino-pretty',
      },
    }),
  });

  console.log('Upstash Redis Cache initialized');

  try {
    const health = await cache.healthCheck();
    console.log('Health:', health);

    const cacheKey = 'user-profile:user123';
    const userProfile = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        language: 'en',
      },
    };

    await cache.set('userPreferences', cacheKey, userProfile, { ttl: 7200 });
    console.log('User profile cached');

    const cached = await cache.get('userPreferences', cacheKey);
    console.log('Retrieved from cache:', cached);

    const metrics = cache.getMetrics();
    console.log('Metrics:', JSON.stringify(metrics, null, 2));
  } finally {
    await cache.shutdown();
    console.log('Cache shutdown complete');
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
