import { getCached, setCached } from './redis';

export type CacheStrategy<T> = {
  key: string;
  ttl?: number;
  hydrate: () => Promise<T>;
};

export async function withCache<T>({ key, ttl, hydrate }: CacheStrategy<T>): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached) {
    return cached;
  }

  const value = await hydrate();
  await setCached(key, value, ttl);
  return value;
}
