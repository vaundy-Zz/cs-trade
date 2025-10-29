import Redis from 'ioredis';
import {
  SteamClient,
  BuffClient,
  MarketService,
  RedisRateLimiter,
  QuotaTracker,
  PinoLogger,
} from '../src';

async function main() {
  const logger = new PinoLogger();
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  const steamClient = new SteamClient(
    {
      apiKey: process.env.STEAM_API_KEY,
    },
    logger,
  );

  const buffClient = new BuffClient(
    {
      apiKey: process.env.BUFF_API_KEY || 'dummy-key',
    },
    logger,
  );

  const steamLimiter = new RedisRateLimiter(redis, {
    maxRequests: 20,
    windowMs: 60_000,
    keyPrefix: 'steam',
  });

  const buffLimiter = new RedisRateLimiter(redis, {
    maxRequests: 10,
    windowMs: 60_000,
    keyPrefix: 'buff',
  });

  const quotaTracker = new QuotaTracker(redis, logger);

  const marketService = new MarketService({
    steamClient,
    buffClient,
    logger,
    rateLimiters: {
      steam: steamLimiter,
      buff: buffLimiter,
    },
    quotaTracker,
    quotaConfig: {
      steam: { dailyQuota: 2500, monthlyQuota: 50_000 },
      buff: { dailyQuota: 1000 },
    },
  });

  const appId = 730;
  const itemName = 'AK-47 | Redline (Field-Tested)';
  const buffItemId = 'example-item-id';

  logger.info('Fetching quotes for item', { appId, itemName });

  const quotes = await marketService.getAllQuotes(appId, itemName, buffItemId, {
    currency: 'USD',
  });

  quotes.forEach((quote) => {
    logger.info('Quote received', {
      source: quote.source,
      item: quote.itemName,
      buyPrice: quote.buyPrice,
      sellPrice: quote.sellPrice,
      volume: quote.volume,
      timestamp: quote.timestamp,
    });
  });

  const steamStatus = await quotaTracker.getStatus('steam', {
    dailyQuota: 2500,
    monthlyQuota: 50_000,
  });
  logger.info('Steam quota status', steamStatus);

  await redis.quit();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
