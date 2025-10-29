-- Schema definition for the Skins Leaderboard project

CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skins (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image_url TEXT,
  rarity_tier TEXT NOT NULL,
  rarity_rank INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_range') THEN
    CREATE TYPE time_range AS ENUM ('24h', '7d', '30d');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS skin_metrics (
  id SERIAL PRIMARY KEY,
  skin_id INTEGER NOT NULL REFERENCES skins(id) ON DELETE CASCADE,
  market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  time_range time_range NOT NULL,
  price_growth NUMERIC(10, 2) NOT NULL,
  trading_volume NUMERIC(14, 2) NOT NULL,
  demand NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (skin_id, market_id, time_range)
);

CREATE TABLE IF NOT EXISTS leaderboard_rankings (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  time_range time_range NOT NULL,
  skin_id INTEGER NOT NULL REFERENCES skins(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  metric_value NUMERIC(14, 2) NOT NULL,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (category, market_id, time_range, skin_id)
);

CREATE INDEX IF NOT EXISTS idx_skin_metrics_market_range ON skin_metrics(market_id, time_range);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rankings_keys ON leaderboard_rankings(category, market_id, time_range, rank);
