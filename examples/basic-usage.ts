import { RedisCache } from '../src/cache/RedisCache';
import pino from 'pino';

async function main() {
  const cache = new RedisCache({
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD,
    },
    poolMin: 2,
    poolMax: 10,
    healthCheckIntervalMs: 30000,
    logger: pino({ level: 'info' }),
  });

  console.log('Redis Cache initialized');

  try {
    const healthStatus = await cache.healthCheck();
    console.log('Health check:', healthStatus);

    const marketDataKey = 'AAPL-price';
    const fetchMarketData = async () => {
      console.log('Fetching market data from API...');
      return {
        ticker: 'AAPL',
        price: 150.25,
        volume: 1000000,
        timestamp: Date.now(),
      };
    };

    console.log('\n--- First fetch (cache miss, will call API) ---');
    const data1 = await cache.get('marketData', marketDataKey, fetchMarketData);
    console.log('Result:', data1);

    console.log('\n--- Second fetch (cache hit, no API call) ---');
    const data2 = await cache.get('marketData', marketDataKey, fetchMarketData);
    console.log('Result:', data2);

    console.log('\n--- Cache metrics ---');
    const metrics = cache.getMetrics();
    console.log(JSON.stringify(metrics, null, 2));

    console.log('\n--- Invalidating market data namespace ---');
    await cache.invalidateNamespace('marketData');

    console.log('\n--- Third fetch (cache miss after invalidation) ---');
    const data3 = await cache.get('marketData', marketDataKey, fetchMarketData);
    console.log('Result:', data3);

    console.log('\n--- Updated cache metrics ---');
    const updatedMetrics = cache.getMetrics();
    console.log(JSON.stringify(updatedMetrics, null, 2));

    console.log('\n--- Storing chart data ---');
    const chartData = {
      type: 'candlestick',
      data: [
        { time: 1, open: 100, high: 110, low: 95, close: 105 },
        { time: 2, open: 105, high: 115, low: 100, close: 110 },
      ],
    };
    await cache.set('charts', 'AAPL-daily', chartData);
    const cachedChart = await cache.get('charts', 'AAPL-daily');
    console.log('Cached chart:', cachedChart);

    console.log('\n--- Final metrics ---');
    const finalMetrics = cache.getMetrics();
    console.log(JSON.stringify(finalMetrics, null, 2));
  } finally {
    console.log('\nShutting down cache...');
    await cache.shutdown();
    console.log('Cache shutdown complete');
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
