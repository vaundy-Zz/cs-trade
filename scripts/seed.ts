import { getPool, closePool } from '../lib/db';
import {
  MARKET_SEED,
  SKIN_SEED,
  BASE_METRIC_SEED,
  SUPPORTED_TIME_RANGES,
  PRICE_MULTIPLIERS,
  VOLUME_MULTIPLIERS,
  DEMAND_MULTIPLIERS,
  MARKET_ADJUSTMENTS
} from '../lib/seed-data';

async function seedDatabase() {
  const pool = await getPool();
  console.log('Starting database seed...');

  try {
    console.log('Inserting markets...');
    for (const market of MARKET_SEED) {
      const result = await pool.query(
        `INSERT INTO markets (slug, name) VALUES ($1, $2) 
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id`,
        [market.slug, market.name]
      );
      console.log(`  ✓ ${market.name} (ID: ${result.rows[0].id})`);
    }

    console.log('Inserting skins...');
    for (const skin of SKIN_SEED) {
      const result = await pool.query(
        `INSERT INTO skins (slug, name, image_url, rarity_tier, rarity_rank) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (slug) DO UPDATE SET 
           name = EXCLUDED.name,
           image_url = EXCLUDED.image_url,
           rarity_tier = EXCLUDED.rarity_tier,
           rarity_rank = EXCLUDED.rarity_rank
         RETURNING id`,
        [skin.slug, skin.name, skin.imageUrl, skin.rarityTier, skin.rarityRank]
      );
      console.log(`  ✓ ${skin.name} (ID: ${result.rows[0].id})`);
    }

    const marketsData = await pool.query('SELECT id, slug FROM markets');
    const markets = marketsData.rows;

    const skinsData = await pool.query('SELECT id, slug FROM skins');
    const skins = skinsData.rows;

    const skinMap = new Map(skins.map((s: { id: number; slug: string }) => [s.slug, s.id]));

    console.log('Inserting skin metrics...');
    for (const market of markets) {
      for (const timeRange of SUPPORTED_TIME_RANGES) {
        for (const baseMetric of BASE_METRIC_SEED) {
          const skinId = skinMap.get(baseMetric.skinSlug);
          if (!skinId) continue;

          const adjustments = MARKET_ADJUSTMENTS[market.slug] || {
            price: 1,
            volume: 1,
            demand: 1
          };

          const priceGrowth =
            baseMetric.priceGrowth *
            PRICE_MULTIPLIERS[timeRange as keyof typeof PRICE_MULTIPLIERS] *
            adjustments.price *
            (0.9 + Math.random() * 0.2);

          const tradingVolume =
            baseMetric.tradingVolume *
            VOLUME_MULTIPLIERS[timeRange as keyof typeof VOLUME_MULTIPLIERS] *
            adjustments.volume *
            (0.85 + Math.random() * 0.3);

          const demand =
            baseMetric.demand *
            DEMAND_MULTIPLIERS[timeRange as keyof typeof DEMAND_MULTIPLIERS] *
            adjustments.demand *
            (0.95 + Math.random() * 0.1);

          await pool.query(
            `INSERT INTO skin_metrics (skin_id, market_id, time_range, price_growth, trading_volume, demand)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (skin_id, market_id, time_range) 
             DO UPDATE SET 
               price_growth = EXCLUDED.price_growth,
               trading_volume = EXCLUDED.trading_volume,
               demand = EXCLUDED.demand`,
            [skinId, market.id, timeRange, priceGrowth.toFixed(2), tradingVolume.toFixed(2), demand.toFixed(2)]
          );
        }
      }
    }
    console.log('  ✓ Metrics inserted for all markets and time ranges');

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await closePool();
  }
}

seedDatabase().catch(console.error);
