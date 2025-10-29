import RedisMock from 'ioredis-mock';
import { QuotaTracker } from '@/rateLimit/quotaTracker';
import { PinoLogger } from '@/logger';

describe('QuotaTracker', () => {
  let redis: any;
  let quotaTracker: QuotaTracker;
  let logger: PinoLogger;

  beforeEach(() => {
    redis = new RedisMock();
    logger = new PinoLogger({ level: 'silent' });
    quotaTracker = new QuotaTracker(redis, logger);
  });

  afterEach(async () => {
    await redis.flushall();
  });

  it('should track daily quota usage', async () => {
    const result = await quotaTracker.trackUsage('steam', {
      dailyQuota: 100,
    });

    expect(result.daily.used).toBe(1);
    expect(result.daily.limit).toBe(100);
    expect(result.daily.remaining).toBe(99);
    expect(result.daily.resetAt).toBeGreaterThan(Date.now());
  });

  it('should track monthly quota when configured', async () => {
    const result = await quotaTracker.trackUsage('buff', {
      dailyQuota: 50,
      monthlyQuota: 1000,
    });

    expect(result.daily.used).toBe(1);
    expect(result.monthly).toBeDefined();
    expect(result.monthly?.used).toBe(1);
    expect(result.monthly?.limit).toBe(1000);
  });

  it('should increment usage on subsequent requests', async () => {
    await quotaTracker.trackUsage('steam', { dailyQuota: 100 });
    await quotaTracker.trackUsage('steam', { dailyQuota: 100 });
    const result = await quotaTracker.trackUsage('steam', { dailyQuota: 100 });

    expect(result.daily.used).toBe(3);
    expect(result.daily.remaining).toBe(97);
  });

  it('should get current quota status', async () => {
    await quotaTracker.trackUsage('steam', { dailyQuota: 100 });
    await quotaTracker.trackUsage('steam', { dailyQuota: 100 });

    const status = await quotaTracker.getStatus('steam', { dailyQuota: 100 });
    expect(status.daily.used).toBe(2);
  });

  it('should handle separate quotas for different APIs', async () => {
    await quotaTracker.trackUsage('steam', { dailyQuota: 100 });
    await quotaTracker.trackUsage('buff', { dailyQuota: 50 });

    const steamStatus = await quotaTracker.getStatus('steam', { dailyQuota: 100 });
    const buffStatus = await quotaTracker.getStatus('buff', { dailyQuota: 50 });

    expect(steamStatus.daily.used).toBe(1);
    expect(buffStatus.daily.used).toBe(1);
  });
});
