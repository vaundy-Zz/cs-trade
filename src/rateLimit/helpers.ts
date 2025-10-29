import { RateLimiter } from './types';
import { RateLimitError } from '@/utils/error';

export type RateLimitedHandler<TArgs extends any[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

export interface RateLimitHelperOptions {
  identifier: (...args: any[]) => string;
}

export function withRateLimit<TArgs extends any[], TResult>(
  limiter: RateLimiter,
  handler: RateLimitedHandler<TArgs, TResult>,
  options: RateLimitHelperOptions,
): RateLimitedHandler<TArgs, TResult> {
  return async (...args: TArgs) => {
    const id = options.identifier(...args);
    const result = await limiter.checkLimit(id);

    if (!result.allowed) {
      throw new RateLimitError('Rate limit exceeded', Math.max(result.resetAt - Date.now(), 0));
    }

    return handler(...args);
  };
}
