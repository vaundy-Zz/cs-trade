export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}

export interface RateLimiter {
  checkLimit(identifier: string): Promise<RateLimitResult>;
  reset(identifier: string): Promise<void>;
}
