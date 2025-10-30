-- Main market data table
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    skin_id VARCHAR(255) NOT NULL,
    skin_name VARCHAR(255) NOT NULL,
    market_name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    volume INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_data_skin_id ON market_data(skin_id);
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX idx_market_data_market_name ON market_data(market_name);
CREATE INDEX idx_market_data_composite ON market_data(skin_id, market_name, timestamp);

-- Materialized view for daily aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_price_aggregates AS
SELECT 
    skin_id,
    skin_name,
    market_name,
    DATE(timestamp) as date,
    MIN(price) as low,
    MAX(price) as high,
    AVG(price) as avg_price,
    (array_agg(price ORDER BY timestamp))[1] as open,
    (array_agg(price ORDER BY timestamp DESC))[1] as close,
    SUM(volume) as total_volume,
    COUNT(*) as data_points
FROM market_data
GROUP BY skin_id, skin_name, market_name, DATE(timestamp);

CREATE UNIQUE INDEX ON daily_price_aggregates(skin_id, market_name, date);

-- Materialized view for hourly aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_price_aggregates AS
SELECT 
    skin_id,
    skin_name,
    market_name,
    DATE_TRUNC('hour', timestamp) as hour,
    MIN(price) as low,
    MAX(price) as high,
    AVG(price) as avg_price,
    (array_agg(price ORDER BY timestamp))[1] as open,
    (array_agg(price ORDER BY timestamp DESC))[1] as close,
    SUM(volume) as total_volume,
    COUNT(*) as data_points
FROM market_data
GROUP BY skin_id, skin_name, market_name, DATE_TRUNC('hour', timestamp);

CREATE UNIQUE INDEX ON hourly_price_aggregates(skin_id, market_name, hour);

-- Materialized view for volatility metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS volatility_metrics AS
SELECT 
    skin_id,
    skin_name,
    market_name,
    DATE(timestamp) as date,
    STDDEV(price) as price_stddev,
    STDDEV(price) / NULLIF(AVG(price), 0) * 100 as coefficient_of_variation,
    MAX(price) - MIN(price) as daily_range,
    (MAX(price) - MIN(price)) / NULLIF(MIN(price), 0) * 100 as range_percentage
FROM market_data
GROUP BY skin_id, skin_name, market_name, DATE(timestamp);

CREATE UNIQUE INDEX ON volatility_metrics(skin_id, market_name, date);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $
BEGIN
    REFRESH MATERIALIZED VIEW daily_price_aggregates;
    REFRESH MATERIALIZED VIEW hourly_price_aggregates;
    REFRESH MATERIALIZED VIEW volatility_metrics;
END;
$ LANGUAGE plpgsql;
