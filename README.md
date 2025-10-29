# Market Data Ingestion Pipeline

A comprehensive data ingestion system built with Next.js 14, TypeScript, PostgreSQL, and observability features. This pipeline fetches real-time market prices, volatility metrics, historical aggregates, multi-market comparisons, and ROI statistics at configurable intervals.

## Features

- ✅ **Next.js Route Handlers** for manual ingestion triggering
- ✅ **Scheduled Jobs** via cron for automated data collection
- ✅ **PostgreSQL** with Prisma ORM for transactional upserts and deduplication
- ✅ **Redis Cache** with fallback to in-memory cache
- ✅ **Observability**: Structured logging (Pino), metrics collection, alerting hooks
- ✅ **Provider Abstraction** for multiple data sources
- ✅ **Type-safe** with TypeScript and Zod validation

## Architecture

```
┌───────────────────┐
│  Next.js API      │
│  Route Handlers   │
└─────────┬─────────┘
          │
          ▼
┌─────────────────────────────┐
│  Ingestion Pipeline         │
│  - Fetch data from provider │
│  - Persist to PostgreSQL    │
│  - Cache invalidation       │
│  - Metrics & logging        │
└─────────┬───────────────────┘
          │
     ┌────┴────┐
     ▼         ▼
┌──────────┐ ┌──────┐
│PostgreSQL│ │Redis │
│  (Prisma)│ │Cache │
└──────────┘ └──────┘
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Redis (optional but recommended for production)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env with your database credentials and configuration
nano .env

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all available configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | **Required** |
| `REDIS_URL` | Redis connection string | Optional |
| `INGESTION_PROVIDER` | Data provider (`mock` or `coingecko`) | `mock` |
| `INGESTION_MARKETS` | Comma-separated market symbols | `BTC-USD,ETH-USD,SPX` |
| `INGESTION_CRON_EXPRESSION` | Cron schedule for automated ingestion | `*/15 * * * *` |
| `INGESTION_LOOKBACK_DAYS` | Days of historical data to fetch | `30` |
| `CACHE_TTL_SECONDS` | Cache TTL in seconds | `300` |
| `ALERT_WEBHOOK_URL` | Webhook URL for alerts | Optional |
| `ALERT_MIN_SEVERITY` | Minimum alert severity | `warning` |
| `LOG_LEVEL` | Logging level | `info` |
| `CRON_SECRET` | Secret for cron endpoint authentication | Optional |

## Usage

### Manual Ingestion via API

Trigger data ingestion manually via HTTP:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{}'
```

With specific symbols:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["BTC-USD", "ETH-USD"]}'
```

### Scheduled Ingestion

#### Option 1: Self-hosted Cron (Node.js)

Run a self-hosted scheduler process:

```bash
npm run db:generate
npm run scheduler:start
```

This will run ingestion jobs according to `INGESTION_CRON_EXPRESSION`.

#### Option 2: Vercel Cron

Configure Vercel Cron in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Set `CRON_SECRET` in your environment and configure Vercel to send it in the `Authorization` header.

#### Option 3: External Cron Service

Use any external cron service (e.g., GitHub Actions, Cron-job.org) to hit:

```bash
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### View Metrics

```bash
curl http://localhost:3000/api/metrics
```

Returns JSON array of recorded metrics including:
- Ingestion duration histograms
- Success/failure counters
- Per-market metrics

## Database Schema

### Tables

- **Market**: Market definitions (symbol, name, base/quote assets)
- **MarketSnapshot**: Real-time price snapshots with volatility and ROI
- **MarketAggregate**: Hourly/daily/weekly OHLC aggregates
- **MarketComparison**: Cross-market comparisons (price ratios, volume ratios, ROI spreads)
- **MarketROIStatistic**: ROI statistics with Sharpe/Sortino ratios and max drawdown

### Migrations

```bash
# Create a new migration
npm run db:migrate

# Deploy migrations to production
npm run db:migrate:deploy

# Open Prisma Studio to view data
npm run db:studio
```

## Data Providers

### Mock Provider (Default)

Generates synthetic market data for testing:

```typescript
INGESTION_PROVIDER="mock"
```

### CoinGecko Provider

Fetches real cryptocurrency market data (not yet implemented):

```typescript
INGESTION_PROVIDER="coingecko"
```

To add a new provider, implement the `MarketDataProvider` interface in `src/ingestion/providers/`.

## Observability

### Structured Logging

All logs are structured JSON using Pino:

```typescript
import { logger } from "@/observability/logger";

logger.info({ userId: 123, action: "login" }, "User logged in");
```

### Metrics Collection

Track custom metrics:

```typescript
import { metrics } from "@/observability/metrics";

metrics.counter("my_event_total", 1, { status: "success" });
metrics.gauge("active_connections", 42);
metrics.histogram("request_duration_ms", 150);
```

View metrics at `/api/metrics`.

### Alerting

Configure webhook alerts for critical events:

```typescript
import { raiseAlert } from "@/observability/alerts";

await raiseAlert({
  severity: "critical",
  message: "Database connection failed",
  context: { error: "Connection timeout" }
});
```

Alerts are sent to `ALERT_WEBHOOK_URL` if configured.

## Cache Invalidation

The pipeline automatically:
1. Invalidates stale cache keys after ingestion
2. Refreshes latest market snapshots
3. Maintains cache TTL based on `CACHE_TTL_SECONDS`

Manual cache invalidation:

```typescript
import { invalidateCacheKeys } from "@/cache/cache";

await invalidateCacheKeys(["market:*:latest", "market:*:aggregates"]);
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

## Production Deployment

### Vercel

```bash
vercel deploy --prod
```

Make sure to:
- Configure environment variables in Vercel dashboard
- Set up Vercel Cron for scheduled ingestion
- Use managed PostgreSQL (e.g., Vercel Postgres, Supabase, Neon)
- Use managed Redis (e.g., Upstash, Redis Cloud)

### Self-Hosted

```bash
# Build application
npm run build

# Start production server
npm start
```

Run the scheduler in a separate process:

```bash
npm run scheduler:start
```

Or use systemd, PM2, or Docker to manage both processes.

## Failure Recovery

See [RUNBOOK.md](./RUNBOOK.md) for detailed operational procedures including:
- Handling ingestion failures
- Recovering from database outages
- Alerting escalation procedures
- Common troubleshooting steps

## API Reference

### POST /api/ingest

Trigger manual ingestion.

**Request Body:**
```json
{
  "symbols": ["BTC-USD", "ETH-USD"]  // Optional
}
```

**Response:**
```json
{
  "status": "success",
  "result": {
    "marketsIngested": 2,
    "snapshotsIngested": 2,
    "aggregatesIngested": 120,
    "comparisonsIngested": 2,
    "roiStatsIngested": 2,
    "startedAt": "2024-01-15T10:00:00.000Z",
    "completedAt": "2024-01-15T10:00:05.000Z",
    "trigger": "manual"
  }
}
```

### GET /api/cron

Cron-compatible ingestion endpoint.

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:** Same as POST /api/ingest

### GET /api/metrics

Retrieve observability metrics.

**Response:**
```json
[
  {
    "type": "counter",
    "name": "ingestion_success_total",
    "value": 1,
    "timestamp": "2024-01-15T10:00:00.000Z",
    "labels": {
      "trigger": "manual",
      "provider": "mock"
    }
  }
]
```

## Development

### Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/                # API route handlers
│   │   ├── ingest/         # Manual ingestion endpoint
│   │   ├── cron/           # Scheduled ingestion endpoint
│   │   └── metrics/        # Metrics endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── src/                    # Source code
│   ├── cache/              # Cache abstraction (Redis/in-memory)
│   ├── config/             # Environment configuration
│   ├── db/                 # Database client
│   ├── ingestion/          # Ingestion pipeline
│   │   └── providers/      # Data provider implementations
│   ├── observability/      # Logging, metrics, alerts
│   └── scheduler/          # Cron scheduler
├── prisma/                 # Database schema
├── scripts/                # Utility scripts
├── RUNBOOK.md              # Operational runbook
└── README.md               # This file
```

### Adding a New Data Provider

1. Implement the `MarketDataProvider` interface in `src/ingestion/providers/`
2. Add the provider to the factory in `src/ingestion/providers/index.ts`
3. Update the `INGESTION_PROVIDER` enum in `src/config/env.ts`

Example:

```typescript
import { MarketDataProvider } from "./base";

export class MyCustomProvider implements MarketDataProvider {
  name = "my-custom-provider";

  async fetchSnapshots(symbols: string[]) {
    // Implementation
  }

  // Implement other methods...
}
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or pull request.
