interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data: value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();

if (typeof global !== 'undefined') {
  const globalAny = global as typeof global & { __leaderboardCacheInterval?: NodeJS.Timeout };
  if (!globalAny.__leaderboardCacheInterval) {
    globalAny.__leaderboardCacheInterval = setInterval(() => {
      cache.cleanup();
    }, 60000);
  }
}

export function getCachedValue<T>(key: string): T | null {
  return cache.get<T>(key);
}

export function setCachedValue<T>(key: string, value: T, ttlSeconds: number = 300): void {
  cache.set(key, value, ttlSeconds);
}

export function clearCachedValue(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}
