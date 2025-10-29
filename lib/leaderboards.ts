import { ensureAppInitialized } from './bootstrap';
import { getCachedValue, setCachedValue } from './cache';
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TIME_RANGE,
  MAX_PAGE_SIZE
} from './constants';
import { getPool } from './db';
import { Category, LeaderboardEntry, TimeRange } from './types';

export interface LeaderboardFilters {
  category?: string | null;
  market?: string | null;
  timeRange?: string | null;
  page?: number;
  perPage?: number;
}

export interface LeaderboardResult {
  category: Category;
  market: { slug: string; name: string };
  timeRange: TimeRange;
  entries: LeaderboardEntry[];
  updatedAt: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

const VALID_CATEGORIES: Category[] = ['price_growth', 'trading_volume', 'demand', 'rarity'];
const VALID_TIME_RANGES: TimeRange[] = ['24h', '7d', '30d'];

function sanitizeCategory(value?: string | null): Category {
  if (!value || !VALID_CATEGORIES.includes(value as Category)) {
    return DEFAULT_CATEGORY;
  }
  return value as Category;
}

function sanitizeTimeRange(value?: string | null): TimeRange {
  if (!value || !VALID_TIME_RANGES.includes(value as TimeRange)) {
    return DEFAULT_TIME_RANGE;
  }
  return value as TimeRange;
}

function sanitizePagination(page?: number, perPage?: number): { page: number; perPage: number } {
  const safePage = !page || Number.isNaN(page) || page < 1 ? 1 : page;
  const safePerPage = !perPage || Number.isNaN(perPage) || perPage < 1
    ? DEFAULT_PAGE_SIZE
    : Math.min(perPage, MAX_PAGE_SIZE);

  return { page: safePage, perPage: safePerPage };
}

export async function getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardResult> {
  await ensureAppInitialized();

  const category = sanitizeCategory(filters.category ?? undefined);
  const timeRange = sanitizeTimeRange(filters.timeRange ?? undefined);
  const { page, perPage } = sanitizePagination(filters.page, filters.perPage);
  const marketSlugFilter = filters.market ?? undefined;

  const cacheKey = `leaderboard:${category}:${marketSlugFilter || 'default'}:${timeRange}:${page}:${perPage}`;
  const cached = getCachedValue<LeaderboardResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const pool = await getPool();

  const marketsQuery = await pool.query<{ id: number; slug: string; name: string }>(
    'SELECT id, slug, name FROM markets ORDER BY name ASC'
  );

  if (marketsQuery.rows.length === 0) {
    throw new Error('No markets available');
  }

  let market = marketsQuery.rows[0];

  if (marketSlugFilter) {
    const found = marketsQuery.rows.find((row) => row.slug === marketSlugFilter);
    if (found) {
      market = found;
    }
  }

  const offset = (page - 1) * perPage;

  const dataQuery = await pool.query<{
    rank: number;
    metric_value: string;
    computed_at: Date | null;
    skin_id: number;
    skin_slug: string;
    skin_name: string;
    image_url: string | null;
    rarity_tier: string;
    rarity_rank: number;
  }>(
    `SELECT
       lr.rank,
       lr.metric_value,
       lr.computed_at,
       s.id as skin_id,
       s.slug as skin_slug,
       s.name as skin_name,
       s.image_url,
       s.rarity_tier,
       s.rarity_rank
     FROM leaderboard_rankings lr
     INNER JOIN skins s ON s.id = lr.skin_id
     WHERE lr.category = $1 AND lr.market_id = $2 AND lr.time_range = $3
     ORDER BY lr.rank ASC
     LIMIT $4 OFFSET $5`,
    [category, market.id, timeRange, perPage, offset]
  );

  const entries: LeaderboardEntry[] = dataQuery.rows.map((row) => ({
    rank: row.rank,
    metricValue: Number(row.metric_value),
    computedAt: row.computed_at ?? null,
    skin: {
      id: row.skin_id,
      slug: row.skin_slug,
      name: row.skin_name,
      imageUrl: row.image_url,
      rarityTier: row.rarity_tier,
      rarityRank: row.rarity_rank
    }
  }));

  const totalQuery = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text as count FROM leaderboard_rankings WHERE category = $1 AND market_id = $2 AND time_range = $3',
    [category, market.id, timeRange]
  );
  const total = Number(totalQuery.rows[0]?.count ?? '0');

  const updatedAtQuery = await pool.query<{ latest: Date | null }>(
    'SELECT MAX(computed_at) as latest FROM leaderboard_rankings WHERE category = $1 AND market_id = $2 AND time_range = $3',
    [category, market.id, timeRange]
  );
  const updatedAt = updatedAtQuery.rows[0]?.latest?.toISOString() ?? null;

  const result: LeaderboardResult = {
    category,
    market: { slug: market.slug, name: market.name },
    timeRange,
    entries,
    updatedAt,
    pagination: {
      page,
      perPage,
      total,
      totalPages: total === 0 ? 1 : Math.ceil(total / perPage)
    }
  };

  setCachedValue(cacheKey, result, 300);

  return result;
}

export function getCategorySummary(category: Category): string {
  return CATEGORY_CONFIG[category].description;
}
