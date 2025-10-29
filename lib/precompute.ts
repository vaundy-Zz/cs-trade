import { clearCache } from './cache';
import { CATEGORY_CONFIG } from './constants';
import { SUPPORTED_TIME_RANGES } from './seed-data';
import { Category, TimeRange } from './types';
import { getPool } from './db';

const LEADERBOARD_CATEGORIES: Category[] = [
  'price_growth',
  'trading_volume',
  'demand',
  'rarity'
];

export async function recomputeLeaderboardRankings(): Promise<void> {
  const pool = await getPool();
  const markets = await pool.query<{ id: number }>('SELECT id FROM markets ORDER BY id');

  for (const market of markets.rows) {
    for (const timeRange of SUPPORTED_TIME_RANGES) {
      for (const category of LEADERBOARD_CATEGORIES) {
        await recomputeCategoryForMarket(pool, market.id, timeRange, category);
      }
    }
  }

  clearCache();
}

async function recomputeCategoryForMarket(
  pool: Awaited<ReturnType<typeof getPool>>,
  marketId: number,
  timeRange: TimeRange,
  category: Category
): Promise<void> {
  await pool.query(
    'DELETE FROM leaderboard_rankings WHERE category = $1 AND market_id = $2 AND time_range = $3',
    [category, marketId, timeRange]
  );

  let insertQuery = '';

  switch (category) {
    case 'price_growth':
      insertQuery = `
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT $1, $2, $3, ranked.skin_id, ranked.rank, ranked.metric_value, NOW()
        FROM (
          SELECT sm.skin_id,
                 sm.price_growth AS metric_value,
                 ROW_NUMBER() OVER (ORDER BY sm.price_growth DESC, sm.skin_id ASC) AS rank
          FROM skin_metrics sm
          WHERE sm.market_id = $2 AND sm.time_range = $3
        ) AS ranked
      `;
      break;
    case 'trading_volume':
      insertQuery = `
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT $1, $2, $3, ranked.skin_id, ranked.rank, ranked.metric_value, NOW()
        FROM (
          SELECT sm.skin_id,
                 sm.trading_volume AS metric_value,
                 ROW_NUMBER() OVER (ORDER BY sm.trading_volume DESC, sm.skin_id ASC) AS rank
          FROM skin_metrics sm
          WHERE sm.market_id = $2 AND sm.time_range = $3
        ) AS ranked
      `;
      break;
    case 'demand':
      insertQuery = `
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT $1, $2, $3, ranked.skin_id, ranked.rank, ranked.metric_value, NOW()
        FROM (
          SELECT sm.skin_id,
                 sm.demand AS metric_value,
                 ROW_NUMBER() OVER (ORDER BY sm.demand DESC, sm.skin_id ASC) AS rank
          FROM skin_metrics sm
          WHERE sm.market_id = $2 AND sm.time_range = $3
        ) AS ranked
      `;
      break;
    case 'rarity':
      insertQuery = `
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT $1, $2, $3, ranked.skin_id, ranked.rank, ranked.metric_value, NOW()
        FROM (
          SELECT sm.skin_id,
                 s.rarity_rank AS metric_value,
                 ROW_NUMBER() OVER (ORDER BY s.rarity_rank ASC, sm.skin_id ASC) AS rank
          FROM skin_metrics sm
          INNER JOIN skins s ON s.id = sm.skin_id
          WHERE sm.market_id = $2 AND sm.time_range = $3
        ) AS ranked
      `;
      break;
    default:
      throw new Error(`Unsupported category: ${category satisfies never}`);
  }

  if (!insertQuery) {
    return;
  }

  await pool.query(insertQuery, [category, marketId, timeRange]);
}

export function getCategoryConfig(category: Category) {
  return CATEGORY_CONFIG[category];
}
