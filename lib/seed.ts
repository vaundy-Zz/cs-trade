import {
  BASE_METRIC_SEED,
  DEMAND_MULTIPLIERS,
  MARKET_ADJUSTMENTS,
  MARKET_SEED,
  PRICE_MULTIPLIERS,
  SKIN_SEED,
  SUPPORTED_TIME_RANGES,
  VOLUME_MULTIPLIERS
} from './seed-data';
import { TimeRange } from './types';
import { getPool } from './db';

let seeded = false;
let seedingPromise: Promise<void> | null = null;

function roundNumber(value: number, fractionDigits = 2): number {
  return Number(value.toFixed(fractionDigits));
}

function timeRangeVariant(range: TimeRange): number {
  switch (range) {
    case '24h':
      return 0.85;
    case '7d':
      return 1;
    case '30d':
      return 1.12;
    default:
      return 1;
  }
}

export async function seedDatabaseIfNeeded(): Promise<void> {
  if (seeded) {
    return;
  }

  if (seedingPromise) {
    await seedingPromise;
    return;
  }

  seedingPromise = (async () => {
    const pool = await getPool();
    const existingMarkets = await pool.query<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM markets'
    );

    if (Number(existingMarkets.rows[0]?.count ?? '0') > 0) {
      seeded = true;
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const marketIdBySlug = new Map<string, number>();
      for (const market of MARKET_SEED) {
        const inserted = await client.query<{ id: number }>(
          'INSERT INTO markets (slug, name) VALUES ($1, $2) RETURNING id',
          [market.slug, market.name]
        );
        marketIdBySlug.set(market.slug, inserted.rows[0].id);
      }

      const skinIdBySlug = new Map<string, number>();
      for (const skin of SKIN_SEED) {
        const inserted = await client.query<{ id: number }>(
          'INSERT INTO skins (slug, name, image_url, rarity_tier, rarity_rank) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [skin.slug, skin.name, skin.imageUrl, skin.rarityTier, skin.rarityRank]
        );
        skinIdBySlug.set(skin.slug, inserted.rows[0].id);
      }

      const timeRanges: TimeRange[] = SUPPORTED_TIME_RANGES;

      for (let index = 0; index < BASE_METRIC_SEED.length; index += 1) {
        const baseMetric = BASE_METRIC_SEED[index];
        const skinId = skinIdBySlug.get(baseMetric.skinSlug);
        if (!skinId) {
          continue;
        }

        const baseVariant = 1 + index * 0.035;

        for (const [marketSlug, adjustments] of Object.entries(MARKET_ADJUSTMENTS)) {
          const marketId = marketIdBySlug.get(marketSlug);
          if (!marketId) {
            continue;
          }

          for (const timeRange of timeRanges) {
            const rangeVariant = timeRangeVariant(timeRange);

            const priceGrowth = roundNumber(
              baseMetric.priceGrowth *
                PRICE_MULTIPLIERS[timeRange] *
                adjustments.price *
                baseVariant *
                rangeVariant
            );

            const tradingVolume = Math.round(
              baseMetric.tradingVolume *
                VOLUME_MULTIPLIERS[timeRange] *
                adjustments.volume *
                (0.92 + index * 0.018) *
                rangeVariant
            );

            const demand = roundNumber(
              baseMetric.demand *
                DEMAND_MULTIPLIERS[timeRange] *
                adjustments.demand *
                (0.94 + index * 0.012) *
                rangeVariant
            );

            await client.query(
              `INSERT INTO skin_metrics (skin_id, market_id, time_range, price_growth, trading_volume, demand)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (skin_id, market_id, time_range)
               DO UPDATE SET price_growth = EXCLUDED.price_growth,
                             trading_volume = EXCLUDED.trading_volume,
                             demand = EXCLUDED.demand`,
              [skinId, marketId, timeRange, priceGrowth, tradingVolume, demand]
            );
          }
        }
      }

      await client.query('COMMIT');
      seeded = true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  })();

  await seedingPromise;
}
