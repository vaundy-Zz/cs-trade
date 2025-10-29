import { Logger } from 'pino';
import { RedisConfig } from '../types';
import { CacheInstrumentation } from './instrumentation';
import Redis from 'ioredis';

export const CACHE_NAMESPACES = {
  marketData: 900,
  charts: 3600,
  apiResponses: 300,
  userPreferences: 7200,
  systemConfig: 86400,
} as const;

export interface RedisCacheOptions {
  redis: RedisConfig;
  poolMin?: number;
  poolMax?: number;
  idleTimeoutMillis?: number;
  evictionRunIntervalMillis?: number;
  healthCheckIntervalMs?: number;
  logLevel?: string;
  logger?: Logger;
  instrumentation?: CacheInstrumentation;
  redisFactory?: typeof Redis;
}

export const DEFAULT_CACHE_OPTIONS = {
  poolMin: 1,
  poolMax: 10,
  idleTimeoutMillis: 30_000,
  evictionRunIntervalMillis: 15_000,
  logLevel: 'info',
} as const;
