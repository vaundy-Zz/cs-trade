# Trends Analytics Dashboard

A comprehensive historical analytics platform featuring multi-series price charts, volume overlays, moving averages, and volatility heatmaps. Built with Node.js, Express, PostgreSQL, and Chart.js.

## Features

### 📊 Analytics & Visualizations

- **Multi-series price charts** with line and bar chart support
- **Volume overlays** showing trading volumes over time
- **Moving averages** (Simple MA and Exponential MA) with configurable periods
- **Volatility heatmaps** with coefficient of variation metrics
- **Date range controls** (7d, 30d, 90d, 180d, 1y) with custom date selection
- **Compare multiple skins/markets** side by side
- **Switch visualization types** dynamically

### ⚡ Performance

- **Materialized views** in PostgreSQL for precomputed aggregates
- Daily and hourly price aggregates for fast queries
- Volatility metrics precomputed for instant heatmap rendering
- Efficient indexing on composite keys

### 📥 Export Options

- **CSV export** for data tables with full OHLC (Open, High, Low, Close) data
- **PNG export** for chart visualizations
- Server-side chart rendering for consistent exports

### ✅ Testing

- Comprehensive unit tests for calculation correctness
- Integration tests for API endpoints
- Edge case handling and validation
- 90%+ code coverage

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

### Development

```bash
# Start with hot-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Documentation

### Base URL

```
http://localhost:3000/api/analytics
```

### Endpoints

#### GET `/skins`

Get list of available skins.

**Response:**
```json
[
  {
    "skin_id": "skin-001",
    "skin_name": "AWP | Dragon Lore"
  }
]
```

#### GET `/markets`

Get list of available markets.

**Response:**
```json
[
  {
    "market_name": "Steam Market"
  }
]
```

#### GET `/price-data`

Get historical price data with moving averages.

**Query Parameters:**
- `skins` (optional): Comma-separated skin IDs (e.g., `skin-001,skin-002`)
- `markets` (optional): Comma-separated market names (e.g., `Steam Market,CS.Money`)
- `start` (optional): Start date in ISO format (e.g., `2023-01-01`)
- `end` (optional): End date in ISO format (e.g., `2023-12-31`)
- `range` (optional): Predefined range (`7d`, `30d`, `90d`, `180d`, `1y`)
- `granularity` (optional): `daily` or `hourly` (default: `daily`)
- `ma` (optional): Comma-separated MA periods (e.g., `7,30`) (default: `7,30`)

**Example:**
```bash
GET /api/analytics/price-data?skins=skin-001&range=30d&granularity=daily&ma=7,30
```

**Response:**
```json
[
  {
    "skin_id": "skin-001",
    "skin_name": "AWP | Dragon Lore",
    "market_name": "Steam Market",
    "data": [
      {
        "timestamp": "2023-12-01",
        "open": 8000.00,
        "high": 8100.00,
        "low": 7950.00,
        "close": 8050.00,
        "avg_price": 8025.00,
        "total_volume": 150
      }
    ],
    "movingAverages": {
      "ma7": [
        {
          "timestamp": "2023-12-07",
          "value": 8030.00
        }
      ],
      "ema7": [
        {
          "timestamp": "2023-12-07",
          "value": 8035.00
        }
      ]
    }
  }
]
```

#### GET `/volatility`

Get volatility metrics for heatmap visualization.

**Query Parameters:** Same as `/price-data`

**Response:**
```json
[
  {
    "skin_id": "skin-001",
    "skin_name": "AWP | Dragon Lore",
    "market_name": "Steam Market",
    "data": [
      {
        "date": "2023-12-01",
        "price_stddev": 125.50,
        "coefficient_of_variation": 1.56,
        "daily_range": 150.00,
        "range_percentage": 1.88
      }
    ]
  }
]
```

#### GET `/export/csv`

Export data as CSV file.

**Query Parameters:** Same as `/price-data`

**Response:** CSV file download

#### POST `/export/png`

Export chart as PNG image.

**Request Body:**
```json
{
  "chartConfig": {
    "type": "line",
    "width": 1200,
    "height": 600,
    "data": {
      "datasets": [...]
    },
    "options": {...}
  }
}
```

**Response:** PNG file download

#### POST `/refresh-views`

Manually refresh materialized views (normally done automatically).

**Response:**
```json
{
  "message": "Materialized views refreshed successfully"
}
```

## Database Schema

### Main Table: `market_data`

Stores raw market data points.

```sql
- id: SERIAL PRIMARY KEY
- skin_id: VARCHAR(255)
- skin_name: VARCHAR(255)
- market_name: VARCHAR(100)
- price: DECIMAL(12, 2)
- volume: INTEGER
- timestamp: TIMESTAMP
- created_at: TIMESTAMP
```

**Indexes:**
- `idx_market_data_skin_id` on `skin_id`
- `idx_market_data_timestamp` on `timestamp`
- `idx_market_data_market_name` on `market_name`
- `idx_market_data_composite` on `(skin_id, market_name, timestamp)`

### Materialized View: `daily_price_aggregates`

Precomputed daily OHLC data.

```sql
- skin_id, skin_name, market_name
- date: DATE
- low, high, avg_price, open, close: DECIMAL
- total_volume: INTEGER
- data_points: INTEGER
```

### Materialized View: `hourly_price_aggregates`

Precomputed hourly OHLC data (same structure as daily, with `hour` instead of `date`).

### Materialized View: `volatility_metrics`

Precomputed volatility statistics.

```sql
- skin_id, skin_name, market_name
- date: DATE
- price_stddev: DECIMAL
- coefficient_of_variation: DECIMAL
- daily_range: DECIMAL
- range_percentage: DECIMAL
```

## Analytics Calculations

### Simple Moving Average (SMA)

```
SMA = (P1 + P2 + ... + Pn) / n
```

Where P1...Pn are the last n prices.

### Exponential Moving Average (EMA)

```
EMA = (Price - PreviousEMA) × Multiplier + PreviousEMA
Multiplier = 2 / (Period + 1)
```

EMA gives more weight to recent prices than SMA.

### Volatility (Standard Deviation)

```
σ = sqrt(Σ(Pi - μ)² / n)
```

Where μ is the mean price.

### Coefficient of Variation

```
CV = (σ / μ) × 100
```

Measures volatility relative to the mean price.

## Architecture

```
┌─────────────────┐
│   Frontend      │  React/Chart.js
│   (HTML/JS)     │  - Interactive charts
└────────┬────────┘  - Date controls
         │            - Export buttons
         │
         ▼
┌─────────────────┐
│   Express API   │  Node.js/Express
│   (REST)        │  - Query validation
└────────┬────────┘  - Data aggregation
         │            - CSV/PNG export
         │
         ▼
┌─────────────────┐
│  PostgreSQL DB  │  PostgreSQL 14+
│  + Materialized │  - Materialized views
│    Views        │  - Automatic refresh
└─────────────────┘
```

## Performance Optimizations

1. **Materialized Views**: Precompute aggregates for 10-100x query speedup
2. **Strategic Indexing**: Composite indexes on common query patterns
3. **Query Parameterization**: Prevent SQL injection and enable query plan caching
4. **Connection Pooling**: Reuse database connections efficiently
5. **Response Compression**: gzip compression for API responses
6. **Frontend Caching**: Chart.js data caching and efficient updates

## Testing

### Unit Tests

Located in `src/server/__tests__/analytics.test.js`

Tests for:
- Moving average calculations
- EMA calculations
- Volatility calculations
- Data grouping logic
- Edge cases (nulls, decimals, large numbers)

### Integration Tests

Located in `src/server/__tests__/api.test.js`

Tests for:
- All API endpoints
- Query parameter validation
- Data filtering
- CSV export format
- PNG export generation
- Error handling

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- analytics.test.js

# Watch mode
npm run test:watch
```

## Deployment

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3000
NODE_ENV=production
```

### Production Setup

1. Set up PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Seed data (optional): `npm run db:seed`
4. Start server: `npm start`

### Recommended PostgreSQL Settings

```sql
-- Enable concurrent index creation
SET maintenance_work_mem = '256MB';

-- Schedule periodic refresh (using pg_cron or similar)
-- Run every hour
SELECT cron.schedule('refresh-analytics', '0 * * * *', 
  'SELECT refresh_analytics_views()');
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please open an issue on the GitHub repository.
