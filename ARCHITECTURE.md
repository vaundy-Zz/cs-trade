# Architecture Overview

This document provides a high-level overview of the Market Data Ingestion Pipeline architecture.

## System Components

### 1. **Next.js Application Layer**
- **Framework**: Next.js 14 with App Router
- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **Purpose**: Provides API endpoints and UI for managing ingestion

#### API Routes
- `/api/ingest` - Manual ingestion trigger
- `/api/cron` - Scheduled ingestion endpoint (with auth)
- `/api/metrics` - Observability metrics

### 2. **Ingestion Pipeline**

The core ingestion engine that orchestrates data collection and persistence.

#### Components:
- **Provider Interface** (`src/ingestion/providers/base.ts`)
  - Abstraction for different data sources
  - Methods: `fetchSnapshots`, `fetchAggregates`, `fetchComparisons`, `fetchROIStats`
  
- **Mock Provider** (`src/ingestion/providers/mock.ts`)
  - Development/testing data generator
  - Produces realistic synthetic market data
  
- **Pipeline Orchestrator** (`src/ingestion/pipeline.ts`)
  - Coordinates data fetching from providers
  - Manages transactional persistence
  - Handles deduplication via upserts
  - Triggers cache invalidation/refresh

### 3. **Data Persistence Layer**

#### PostgreSQL Database (via Prisma ORM)

**Schema**:
- `Market` - Market definitions and metadata
- `MarketSnapshot` - Real-time price data with ROI metrics
- `MarketAggregate` - OHLC data (hourly, daily, weekly)
- `MarketComparison` - Cross-market analysis
- `MarketROIStatistic` - Risk-adjusted return metrics

**Key Features**:
- Unique constraints for deduplication
- Composite indexes for performance
- Upsert operations for idempotency
- Decimal precision for financial data

### 4. **Cache Layer**

#### Dual-Mode Caching
- **Redis** (production): Distributed cache with persistence
- **In-Memory** (development): Fallback for local dev

**Cache Strategy**:
- Cache latest snapshots per market
- TTL-based expiration
- Pattern-based invalidation
- Automatic fallback on Redis failure

### 5. **Observability**

#### Structured Logging (Pino)
- JSON-formatted logs
- Configurable log levels
- Request/response logging
- Database query logging

#### Metrics Collection
- Counter: Success/failure rates
- Gauge: Active connections, cache size
- Histogram: Latency distributions

**Metrics Exposed**:
- `ingestion_success_total`
- `ingestion_failure_total`
- `ingestion_duration_ms`

#### Alerting
- Webhook-based notifications
- Configurable severity thresholds
- Context-rich payloads

### 6. **Scheduler**

#### Execution Modes:
1. **Self-hosted Cron** (`node-cron`)
   - Runs in-process
   - Suitable for VMs, containers
   
2. **Vercel Cron**
   - Serverless scheduled functions
   - Managed by Vercel platform
   
3. **External Cron**
   - GitHub Actions, Jenkins, etc.
   - HTTP-triggered via `/api/cron`

## Data Flow

```
┌─────────────────┐
│   API Request   │
│  (Manual/Cron)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ingestion       │
│ Pipeline        │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Data Provider   │    │ Observability   │
│ (Mock/CoinGecko)│    │ (Logs/Metrics)  │
└────────┬────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Transform &     │
│ Validate        │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│ PostgreSQL      │  │ Redis Cache     │
│ (Transactional) │  │ (Invalidate)    │
└─────────────────┘  └─────────────────┘
```

## Configuration Management

### Environment Variables (Zod-validated)
- **Required**: `DATABASE_URL`
- **Optional**: `REDIS_URL`, `CRON_SECRET`, alert/logging config
- **Defaults**: Mock provider, 15-minute cron, 30-day lookback

### Validation
- Schema defined in `src/config/env.ts`
- Runtime validation on startup
- Type-safe access via `getEnv()`

## Security Considerations

### Authentication
- Cron endpoint protected by `CRON_SECRET`
- Bearer token authentication

### Data Protection
- Connection strings via environment variables
- No secrets in code or version control
- Database connections over SSL/TLS (production)

### Input Validation
- Zod schemas for environment config
- TypeScript type safety throughout

## Scalability & Performance

### Horizontal Scaling
- Stateless API layer (scales with Next.js instances)
- Database connection pooling
- Distributed caching via Redis

### Performance Optimizations
- Batch upserts for bulk data
- Composite database indexes
- Lazy-loaded environment config
- Connection reuse (singleton patterns)

### Resource Management
- Configurable cron intervals
- Lookback window limits
- Cache TTL tuning
- Metric history limits

## Failure Handling

### Retry Strategy
- Provider failures: Log and alert (no auto-retry)
- Database failures: Fail fast, alert critical
- Cache failures: Automatic fallback to in-memory

### Data Integrity
- Transactional inserts
- Unique constraints prevent duplicates
- Upserts ensure idempotency

### Monitoring & Alerting
- Critical alerts for pipeline failures
- Webhook notifications
- Structured logs for debugging

## Extensibility

### Adding New Providers
1. Implement `MarketDataProvider` interface
2. Add to provider factory
3. Update environment enum

### Adding New Data Types
1. Extend Prisma schema
2. Update pipeline types
3. Implement persist logic

### Custom Metrics
```typescript
import { metrics } from "@/observability/metrics";

metrics.counter("custom_event", 1, { label: "value" });
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Application** | Next.js 14 | API routes, SSR |
| **Language** | TypeScript | Type safety |
| **Database** | PostgreSQL + Prisma | Data persistence |
| **Cache** | Redis / In-Memory | Performance |
| **Logging** | Pino | Structured logs |
| **Scheduler** | node-cron | Background jobs |
| **Validation** | Zod | Runtime schemas |
| **Deployment** | Vercel / Docker / Self-hosted | Multiple options |

## Related Documentation

- [README.md](./README.md) - Getting started and API reference
- [RUNBOOK.md](./RUNBOOK.md) - Operational procedures
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide
