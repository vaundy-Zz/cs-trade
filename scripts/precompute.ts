import { getPool, closePool } from '../lib/db';

const CATEGORIES = ['price_growth', 'trading_volume', 'demand', 'rarity'];
const TIME_RANGES = ['24h', '7d', '30d'];

async function precomputeRankings() {
  const pool = getPool();
  console.log('Starting precomputation of leaderboard rankings...');

  try {
    const marketsResult = await pool.query('SELECT id, slug FROM markets');
    const markets = marketsResult.rows;

    if (markets.length === 0) {
      console.log('No markets found. Skipping precomputation.');
      return;
    }

    for (const market of markets) {
      for (const timeRange of TIME_RANGES) {
        for (const category of CATEGORIES) {
          await computeRankingsForCategory(market.id, timeRange as any, category);
        }
      }
    }

    console.log('Precomputation completed successfully!');
  } catch (error) {
    console.error('Error during precomputation:', error);
    throw error;
  } finally {
    await closePool();
  }
}

async function computeRankingsForCategory(
  marketId: number,
  timeRange: '24h' | '7d' | '30d',
  category: string
) {
  const pool = getPool();
  console.log(`Computing rankings for ${category} in market ${marketId} for ${timeRange}...`);

  let query = '';
  
  switch (category) {
    case 'price_growth':
      query = `
        WITH ranked_skins AS (
          SELECT 
            sm.skin_id,
            sm.price_growth as metric_value,
            ROW_NUMBER() OVER (ORDER BY sm.price_growth DESC) as rank
          FROM skin_metrics sm
          WHERE sm.market_id = $1 AND sm.time_range = $2
          AND sm.price_growth > 0
        )
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT 
          $3, $1, $2, skin_id, rank, metric_value, NOW()
        FROM ranked_skins
        ON CONFLICT (category, market_id, time_range, skin_id) 
        DO UPDATE SET 
          rank = EXCLUDED.rank,
          metric_value = EXCLUDED.metric_value,
          computed_at = EXCLUDED.computed_at
      `;
      break;

    case 'trading_volume':
      query = `
        WITH ranked_skins AS (
          SELECT 
            sm.skin_id,
            sm.trading_volume as metric_value,
            ROW_NUMBER() OVER (ORDER BY sm.trading_volume DESC) as rank
          FROM skin_metrics sm
          WHERE sm.market_id = $1 AND sm.time_range = $2
        )
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT 
          $3, $1, $2, skin_id, rank, metric_value, NOW()
        FROM ranked_skins
        ON CONFLICT (category, market_id, time_range, skin_id) 
        DO UPDATE SET 
          rank = EXCLUDED.rank,
          metric_value = EXCLUDED.metric_value,
          computed_at = EXCLUDED.computed_at
      `;
      break;

    case 'demand':
      query = `
        WITH ranked_skins AS (
          SELECT 
            sm.skin_id,
            sm.demand as metric_value,
            ROW_NUMBER() OVER (ORDER BY sm.demand DESC) as rank
          FROM skin_metrics sm
          WHERE sm.market_id = $1 AND sm.time_range = $2
        )
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT 
          $3, $1, $2, skin_id, rank, metric_value, NOW()
        FROM ranked_skins
        ON CONFLICT (category, market_id, time_range, skin_id) 
        DO UPDATE SET 
          rank = EXCLUDED.rank,
          metric_value = EXCLUDED.metric_value,
          computed_at = EXCLUDED.computed_at
      `;
      break;

    case 'rarity':
      query = `
        WITH ranked_skins AS (
          SELECT 
            s.id as skin_id,
            s.rarity_rank as metric_value,
            ROW_NUMBER() OVER (ORDER BY s.rarity_rank ASC) as rank
          FROM skins s
          INNER JOIN skin_metrics sm ON s.id = sm.skin_id
          WHERE sm.market_id = $1 AND sm.time_range = $2
        )
        INSERT INTO leaderboard_rankings (category, market_id, time_range, skin_id, rank, metric_value, computed_at)
        SELECT 
          $3, $1, $2, skin_id, rank, metric_value, NOW()
        FROM ranked_skins
        ON CONFLICT (category, market_id, time_range, skin_id) 
        DO UPDATE SET 
          rank = EXCLUDED.rank,
          metric_value = EXCLUDED.metric_value,
          computed_at = EXCLUDED.computed_at
      `;
      break;
  }

  if (query) {
    await pool.query(query, [marketId, timeRange, category]);
    console.log(`  ✓ Completed ${category}`);
  }
}

precomputeRankings().catch(console.error);
