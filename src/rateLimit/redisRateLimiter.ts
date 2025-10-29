import Redis from 'ioredis';
import { RateLimitConfig, RateLimitResult, RateLimiter } from './types';
import { RateLimitError } from '@/utils/error';

export interface RedisRateLimiterOptions extends RateLimitConfig {
  redisKey?: string;
}

export class RedisRateLimiter implements RateLimiter {
  private readonly redis: Redis;
  private readonly config: RateLimitConfig;
  private readonly keyPrefix: string;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
    this.keyPrefix = config.keyPrefix ?? 'rate_limit';
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const pipeline = this.redis.multi();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, this.config.windowMs);

    const results = await pipeline.exec();
    if (!results) {
      throw new RateLimitError('Failed to execute Redis pipeline for rate limiting');
    }

    const countEntry = results[2];
    const total = Number(countEntry?.[1] ?? 0);
    const allowed = total <= this.config.maxRequests;
    const remaining = Math.max(this.config.maxRequests - total, 0);
    const resetAt = now + this.config.windowMs;

    return { allowed, remaining, resetAt, total };
  }

  async consume(identifier: string): Promise<RateLimitResult> {
    const result = await this.checkLimit(identifier);
    if (!result.allowed) {
      throw new RateLimitError('Rate limit exceeded', Math.max(result.resetAt - Date.now(), 0));
    }
    return result;
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}:${identifier}`;
    await this.redis.del(key);
  }
}
