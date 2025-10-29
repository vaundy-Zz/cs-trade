import RedisMock from 'ioredis-mock';
import { RedisRateLimiter } from '@/rateLimit/redisRateLimiter';
import { RateLimitError } from '@/utils/error';

describe('RedisRateLimiter', () => {
  let redis: any;
  let limiter: RedisRateLimiter;

  beforeEach(() => {
    redis = new RedisMock();
    limiter = new RedisRateLimiter(redis, {
      maxRequests: 5,
      windowMs: 1000,
      keyPrefix: 'test',
    });
  });

  afterEach(async () => {
    await redis.flushall();
  });

  it('should allow requests within the limit', async () => {
    const result = await limiter.checkLimit('user123');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.total).toBe(1);
  });

  it('should block requests after exceeding the limit', async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.checkLimit('user123');
    }

    const result = await limiter.checkLimit('user123');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should throw error on consume when limit exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.consume('user123');
    }

    await expect(limiter.consume('user123')).rejects.toThrow(RateLimitError);
  });

  it('should reset limits for a specific identifier', async () => {
    await limiter.checkLimit('user123');
    await limiter.checkLimit('user123');
    await limiter.reset('user123');

    const result = await limiter.checkLimit('user123');
    expect(result.total).toBe(1);
  });

  it('should track separate limits for different identifiers', async () => {
    await limiter.checkLimit('user1');
    await limiter.checkLimit('user1');
    const result1 = await limiter.checkLimit('user1');

    await limiter.checkLimit('user2');
    const result2 = await limiter.checkLimit('user2');

    expect(result1.total).toBe(3);
    expect(result2.total).toBe(2);
  });
});
