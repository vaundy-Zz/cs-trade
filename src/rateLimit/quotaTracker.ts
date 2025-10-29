import Redis from 'ioredis';
import { Logger } from '@/logger';

export interface QuotaConfig {
  dailyQuota: number;
  monthlyQuota?: number;
}

export interface QuotaStatus {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: number;
  };
  monthly?: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: number;
  };
}

export class QuotaTracker {
  private readonly redis: Redis;
  private readonly logger: Logger;
  private readonly keyPrefix = 'quota';

  constructor(redis: Redis, logger: Logger) {
    this.redis = redis;
    this.logger = logger;
  }

  async trackUsage(apiName: string, config: QuotaConfig): Promise<QuotaStatus> {
    const now = new Date();
    const dailyKey = `${this.keyPrefix}:${apiName}:daily:${this.getDayKey(now)}`;
    const monthlyKey = config.monthlyQuota
      ? `${this.keyPrefix}:${apiName}:monthly:${this.getMonthKey(now)}`
      : null;

    const pipeline = this.redis.multi();
    pipeline.incr(dailyKey);
    pipeline.pexpire(dailyKey, this.getMillisecondsUntilEndOfDay(now));

    if (monthlyKey) {
      pipeline.incr(monthlyKey);
      pipeline.pexpire(monthlyKey, this.getMillisecondsUntilEndOfMonth(now));
    }

    const results = await pipeline.exec();
    if (!results) {
      throw new Error('Failed to track quota usage');
    }

    const dailyUsed = Number(results[0][1]);
    const monthlyUsed = monthlyKey && results[2] ? Number(results[2][1]) : 0;

    const status: QuotaStatus = {
      daily: {
        used: dailyUsed,
        limit: config.dailyQuota,
        remaining: Math.max(config.dailyQuota - dailyUsed, 0),
        resetAt: this.getEndOfDay(now).getTime(),
      },
    };

    if (config.monthlyQuota) {
      status.monthly = {
        used: monthlyUsed,
        limit: config.monthlyQuota,
        remaining: Math.max(config.monthlyQuota - monthlyUsed, 0),
        resetAt: this.getEndOfMonth(now).getTime(),
      };
    }

    this.logger.info('Quota usage tracked', { apiName, status });
    return status;
  }

  async getStatus(apiName: string, config: QuotaConfig): Promise<QuotaStatus> {
    const now = new Date();
    const dailyKey = `${this.keyPrefix}:${apiName}:daily:${this.getDayKey(now)}`;
    const monthlyKey = config.monthlyQuota
      ? `${this.keyPrefix}:${apiName}:monthly:${this.getMonthKey(now)}`
      : null;

    const dailyUsed = Number((await this.redis.get(dailyKey)) ?? 0);
    const monthlyUsed = monthlyKey ? Number((await this.redis.get(monthlyKey)) ?? 0) : 0;

    const status: QuotaStatus = {
      daily: {
        used: dailyUsed,
        limit: config.dailyQuota,
        remaining: Math.max(config.dailyQuota - dailyUsed, 0),
        resetAt: this.getEndOfDay(now).getTime(),
      },
    };

    if (config.monthlyQuota) {
      status.monthly = {
        used: monthlyUsed,
        limit: config.monthlyQuota,
        remaining: Math.max(config.monthlyQuota - monthlyUsed, 0),
        resetAt: this.getEndOfMonth(now).getTime(),
      };
    }

    return status;
  }

  private getDayKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private getEndOfMonth(date: Date): Date {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return end;
  }

  private getMillisecondsUntilEndOfDay(date: Date): number {
    return this.getEndOfDay(date).getTime() - date.getTime();
  }

  private getMillisecondsUntilEndOfMonth(date: Date): number {
    return this.getEndOfMonth(date).getTime() - date.getTime();
  }
}
