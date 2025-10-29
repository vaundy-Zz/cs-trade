import { ensureAppInitialized } from './bootstrap';
import { getPool } from './db';

export interface MarketOption {
  slug: string;
  name: string;
}

let marketsCache: MarketOption[] | null = null;

export async function listMarkets(): Promise<MarketOption[]> {
  await ensureAppInitialized();

  if (marketsCache) {
    return marketsCache;
  }

  const pool = await getPool();
  const result = await pool.query<MarketOption>('SELECT slug, name FROM markets ORDER BY name ASC');
  marketsCache = result.rows;
  return marketsCache;
}
