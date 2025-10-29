# Prisma Schema Documentation

## Overview

This document provides detailed technical documentation for the Prisma schema design for the Skins Analytics Platform. The schema is optimized for analytical queries, time-series data, and user portfolio management.

## Architecture Decisions

### Entity Organization

The schema is organized into four main categories:

1. **Core Entities** - Fundamental business objects (Skin, Market, RarityTier)
2. **Price & Analytics** - Time-series data and metrics (PriceSnapshot, PriceSeries, VolatilityMetric)
3. **External Sources** - API and data source tracking (ApiSource)
4. **User & Features** - Authentication and user features (User, Account, Session, Alert, Watchlist, Investment)

### Data Modeling Patterns

#### 1. Junction Table Pattern (SkinMarket)

The `SkinMarket` model serves as a junction table between `Skin` and `Market`, enabling:

- Many-to-many relationship between skins and markets
- Market-specific metadata (e.g., listing URLs, reference codes)
- Independent pricing per skin-market combination
- Cross-market arbitrage analysis

**Why this matters:** A single skin (e.g., "AK-47 Redline") can be traded on multiple markets (Steam, Buff163, DMarket), each with different prices and liquidity.

```prisma
model SkinMarket {
  id            String   @id @default(cuid())
  skinId        String
  marketId      String
  // Market-specific attributes
  referenceCode String?
  listingUrl    String?
  
  @@unique([skinId, marketId])
}
```

#### 2. Dual Time-Series Storage

Price data is stored using two complementary models:

**PriceSnapshot** (Raw Data)
- Point-in-time observations
- High granularity (sub-hourly possible)
- Full detail: volume, supply, bid/ask spreads
- Retention: 90 days for hourly, longer for daily

**PriceSeries** (Aggregated Data)
- Pre-computed OHLC (Open, High, Low, Close) data
- Multiple intervals (hourly, daily, weekly, etc.)
- Optimized for charting and trend analysis
- Retention: Indefinite for daily and longer intervals

**Trade-off Analysis:**
- Storage: Raw snapshots consume more space but preserve detail
- Query Performance: Aggregated series are faster for visualization
- Flexibility: Raw data enables custom aggregations

```prisma
enum PriceInterval {
  HOURLY
  FOUR_HOURLY
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
}
```

#### 3. Soft Deletes and Status Flags

Several models use `isActive` flags instead of hard deletes:

- `SkinMarket.isActive` - Delisted items or discontinued markets
- `Alert.isActive` - User can pause/resume alerts
- `Investment.isOpen` - Track closed vs open positions
- `ApiSource.isActive` - Deprecated or suspended data sources

**Benefits:**
- Audit trail preservation
- Historical analysis on inactive items
- User can reactivate features
- Graceful degradation when APIs fail

#### 4. Flexible Metadata Fields

All major entities include `metadata: Json?` fields for:

- API-specific response data
- Custom user annotations
- A/B testing features
- Third-party integrations
- Future schema extensions without migrations

**Example use cases:**
```javascript
// Skin metadata
{
  "workshop_id": "730",
  "float_range": [0.0, 0.7],
  "paint_seed_range": [0, 1000],
  "stattrak_available": true
}

// Market metadata
{
  "commission_rate": 0.15,
  "withdrawal_fee": 2.50,
  "supported_currencies": ["USD", "EUR", "GBP"]
}

// Alert metadata
{
  "notification_count": 5,
  "last_triggered": "2024-01-15T10:30:00Z",
  "snooze_until": "2024-01-16T00:00:00Z"
}
```

#### 5. Composite Unique Indexes

Strategic use of composite unique constraints prevents duplicates:

- `PriceSnapshot: [skinMarketId, capturedAt]` - One snapshot per time point
- `PriceSeries: [skinMarketId, interval, bucketStart]` - One OHLC per bucket
- `VolatilityMetric: [skinMarketId, interval, measuredAt]` - One metric per measurement
- `SkinMarket: [skinId, marketId]` - Each skin listed once per market
- `Watchlist: [userId, slug]` - Unique watchlist slugs per user

#### 6. Cascade Delete Strategy

Foreign key relationships use appropriate cascade rules:

| Relationship | Strategy | Reasoning |
|-------------|----------|-----------|
| User → Account/Session | CASCADE | User deletion must remove auth data |
| User → Alert/Watchlist/Investment | CASCADE | Personal data cleanup (GDPR) |
| Skin/Market → SkinMarket | CASCADE | Integrity constraint |
| SkinMarket → PriceSnapshot/Series | CASCADE | No orphaned price data |
| ApiSource → PriceSnapshot/Series | SET NULL | Preserve historical data |
| Skin/Market deletion | CASCADE to children | Clean removal |

## Index Strategy

### Query Optimization

Indexes are designed around common query patterns:

#### Time-Range Queries
```sql
-- Indexes support these queries efficiently:
SELECT * FROM "PriceSnapshot" 
WHERE "skinMarketId" = ? 
  AND "capturedAt" BETWEEN ? AND ?
ORDER BY "capturedAt" DESC;

-- Index: (skinMarketId, capturedAt)
```

#### User Dashboard Queries
```sql
-- Active alerts for user
SELECT * FROM "Alert" 
WHERE "userId" = ? 
  AND "isActive" = true;

-- Index: (userId, isActive)
```

#### Market Analysis Queries
```sql
-- Price series by interval
SELECT * FROM "PriceSeries" 
WHERE "interval" = 'DAILY' 
  AND "bucketStart" >= ?;

-- Index: (interval, bucketStart)
```

### Index Cost-Benefit Analysis

| Index | Benefits | Costs |
|-------|----------|-------|
| Foreign Keys | Join performance, referential integrity | Small write overhead |
| Time Fields | Range queries, time-series analysis | Moderate storage |
| Composite (userId, isActive) | User dashboard queries | Minimal overhead |
| Unique Constraints | Data integrity, SELECT performance | Enforced uniqueness |

## Enums

### PriceInterval

Defines time bucket sizes for aggregated data:

- `HOURLY` - High-frequency trading, intraday analysis
- `FOUR_HOURLY` - Reduced storage, still detailed
- `DAILY` - Standard analysis period
- `WEEKLY` - Medium-term trends
- `BIWEEKLY` - Two-week cycles
- `MONTHLY` - Long-term trends
- `QUARTERLY` - Seasonal analysis

### AlertType

Categories of alerts users can configure:

- `PRICE_THRESHOLD` - Alert when price crosses a specific value
- `PERCENT_CHANGE` - Alert on percentage movement
- `VOLUME_SPIKE` - Unusual trading activity
- `VOLATILITY` - Significant price fluctuations

### AlertCondition

Comparison operators for alert triggers:

- `ABOVE` - Value exceeds threshold
- `BELOW` - Value falls below threshold
- `INCREASES_BY_PERCENT` - Percentage gain
- `DECREASES_BY_PERCENT` - Percentage loss

## Precision and Scale

### Decimal Fields

Price and financial data use `Decimal` type for precision:

```prisma
price Decimal @db.Decimal(18, 4)
```

- **Total digits:** 18
- **Decimal places:** 4
- **Range:** Up to 99,999,999,999,999.9999
- **Precision:** $0.0001 (one ten-thousandth)

**Rationale:** Skins can range from $0.03 to $100,000+, requiring both precision and range.

### Volatility Metrics

```prisma
volatility Decimal @db.Decimal(18, 6)
```

- **Decimal places:** 6
- **Precision:** 0.000001
- **Use case:** Statistical measures require higher precision

### Change Percentages

```prisma
changePercent Decimal @db.Decimal(7, 4)
```

- **Total digits:** 7
- **Decimal places:** 4
- **Range:** -999.9999% to +999.9999%
- **Use case:** Percentage changes, ratios

## Relationships Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├─────────────┬──────────────┬─────────────┬──────────────┐
     │             │              │             │              │
┌────▼─────┐  ┌───▼────┐  ┌──────▼──────┐  ┌──▼────┐  ┌─────▼──────┐
│ Account  │  │Session │  │SavedPref    │  │Alert  │  │Watchlist   │
└──────────┘  └────────┘  └─────────────┘  └───┬───┘  └─────┬──────┘
                                               │             │
                                               │      ┌──────▼─────────┐
                                               │      │WatchlistEntry  │
                                               │      └────────┬───────┘
                                               │               │
┌────────────┐                            ┌────▼──────────────▼───┐
│ RarityTier │                            │        Skin            │
└─────┬──────┘                            └────┬───────────────────┘
      │                                        │
      └────────────────────────────────────────┤
                                               │
                                         ┌─────▼───────┐
                                         │ SkinMarket  │
                                         └─────┬───────┘
                                               │
                     ┌──────────────┬──────────┼─────────┬────────────────┐
                     │              │          │         │                │
              ┌──────▼───────┐  ┌──▼─────┐  ┌─▼──────┐  ┌───▼─────────┐  │
              │PriceSnapshot │  │PriceSeries│ │Volatility│ │Investment   │  │
              └──────┬───────┘  └──┬─────┘  └─┬──────┘  └───┬─────────┘  │
                     │             │          │             │            │
                     └─────────────┴──────────┴─────────────┴────────────┘
                                          │
                                    ┌─────▼──────┐
                                    │ ApiSource  │
                                    └────────────┘
                                          │
                                    ┌─────▼──────┐
                                    │   Market   │
                                    └────────────┘
```

## Query Patterns

### Common Analytical Queries

#### 1. Price History for a Skin

```javascript
const priceHistory = await prisma.priceSeries.findMany({
  where: {
    skinMarketId: skinMarketId,
    interval: 'DAILY',
    bucketStart: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31')
    }
  },
  orderBy: { bucketStart: 'asc' },
  select: {
    bucketStart: true,
    open: true,
    high: true,
    low: true,
    close: true,
    volume: true
  }
});
```

#### 2. User Portfolio with Current Prices

```javascript
const portfolio = await prisma.investment.findMany({
  where: {
    userId: userId,
    isOpen: true
  },
  include: {
    skin: {
      select: { name: true, slug: true }
    },
    listing: {
      include: {
        market: true,
        priceSnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1
        }
      }
    }
  }
});

// Calculate P&L
portfolio.forEach(investment => {
  const currentPrice = investment.listing.priceSnapshots[0]?.price;
  const profitLoss = (currentPrice - investment.averagePrice) * investment.quantity;
  const profitLossPercent = (profitLoss / investment.totalCost) * 100;
});
```

#### 3. Market Comparison

```javascript
const marketComparison = await prisma.skinMarket.findMany({
  where: {
    skinId: skinId,
    isActive: true
  },
  include: {
    market: true,
    priceSnapshots: {
      orderBy: { capturedAt: 'desc' },
      take: 1
    }
  }
});

// Find cheapest market
const cheapest = marketComparison.reduce((min, current) => {
  const price = current.priceSnapshots[0]?.price;
  return price < min.price ? { market: current.market, price } : min;
}, { market: null, price: Infinity });
```

#### 4. Volatility Analysis

```javascript
const volatilityData = await prisma.volatilityMetric.findMany({
  where: {
    skinMarketId: skinMarketId,
    interval: 'DAILY',
    measuredAt: {
      gte: thirtyDaysAgo
    }
  },
  orderBy: { measuredAt: 'asc' },
  select: {
    measuredAt: true,
    volatility: true,
    averageTrueRange: true,
    standardDeviation: true,
    confidenceScore: true
  }
});

// Identify high volatility periods
const highVolatilityPeriods = volatilityData.filter(
  v => v.volatility > threshold && v.confidenceScore > 0.8
);
```

#### 5. Active Alerts Requiring Processing

```javascript
const pendingAlerts = await prisma.alert.findMany({
  where: {
    isActive: true,
    triggeredAt: null,
    expiresAt: {
      gte: new Date()
    }
  },
  include: {
    user: {
      select: { email: true, name: true }
    },
    skin: {
      select: { name: true }
    },
    listing: {
      include: {
        market: true,
        priceSnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1
        }
      }
    }
  }
});

// Check trigger conditions
pendingAlerts.forEach(alert => {
  const currentPrice = alert.listing?.priceSnapshots[0]?.price;
  if (shouldTriggerAlert(alert, currentPrice)) {
    // Trigger notification
  }
});
```

## Performance Considerations

### Write Optimization

**Batch Inserts for Price Data:**

```javascript
await prisma.priceSnapshot.createMany({
  data: snapshots,
  skipDuplicates: true // Prevent errors on unique constraint violations
});
```

**Upsert for Reference Data:**

```javascript
await prisma.market.upsert({
  where: { slug: 'steam_community' },
  update: { /* fields to update */ },
  create: { /* fields for new record */ }
});
```

### Read Optimization

**Selective Field Loading:**

```javascript
// BAD: Loads all fields including large JSON
const skins = await prisma.skin.findMany();

// GOOD: Only load needed fields
const skins = await prisma.skin.findMany({
  select: { id: true, name: true, slug: true }
});
```

**Pagination:**

```javascript
// Cursor-based pagination for large datasets
const page = await prisma.priceSnapshot.findMany({
  take: 100,
  skip: 1,
  cursor: { id: lastId },
  orderBy: { capturedAt: 'desc' }
});
```

### Aggregate Queries

```javascript
// Count active listings per market
const marketStats = await prisma.skinMarket.groupBy({
  by: ['marketId'],
  where: { isActive: true },
  _count: { id: true }
});

// Average price by interval
const avgPrices = await prisma.priceSeries.aggregate({
  where: { skinMarketId, interval: 'DAILY' },
  _avg: { close: true },
  _min: { low: true },
  _max: { high: true }
});
```

## Migration Strategy

### Development Workflow

1. Edit `schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Review generated SQL in `prisma/migrations/`
4. Test migration on development database
5. Commit schema and migration files

### Production Deployment

1. Backup production database
2. Run `npx prisma migrate deploy` in CI/CD
3. Verify migration status with `npx prisma migrate status`
4. Monitor application logs for errors
5. Have rollback plan ready

### Breaking Changes

**Adding Required Fields:**

```prisma
// Step 1: Add as optional
model Skin {
  newField String?
}

// Step 2: Backfill data
UPDATE "Skin" SET "newField" = 'default' WHERE "newField" IS NULL;

// Step 3: Make required in next migration
model Skin {
  newField String
}
```

**Renaming Fields:**

Use raw SQL in migration to preserve data:

```sql
ALTER TABLE "Skin" RENAME COLUMN "oldName" TO "newName";
```

## Security Considerations

### SQL Injection Prevention

Prisma automatically parameterizes queries, preventing SQL injection:

```javascript
// Safe - Prisma uses prepared statements
const user = await prisma.user.findFirst({
  where: { email: userInput }
});

// Avoid raw SQL when possible
const result = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${userInput}`;
```

### Sensitive Data

Hash passwords before storage:

```javascript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(plainPassword, 10);

await prisma.user.create({
  data: {
    email,
    hashedPassword
  }
});
```

### Data Access Control

Implement row-level security:

```javascript
// Ensure users only access their own data
const watchlists = await prisma.watchlist.findMany({
  where: {
    userId: authenticatedUserId
  }
});
```

## Testing Strategies

### Unit Tests

```javascript
import { PrismaClient } from '@prisma/client';

describe('Skin Model', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a skin with rarity tier', async () => {
    const skin = await prisma.skin.create({
      data: {
        name: 'AK-47 | Redline',
        slug: 'ak47-redline',
        gameTitle: 'CSGO',
        rarityTier: {
          connect: { key: 'classified' }
        }
      }
    });

    expect(skin.name).toBe('AK-47 | Redline');
  });
});
```

### Integration Tests

```javascript
it('should calculate portfolio value correctly', async () => {
  // Seed test data
  const user = await prisma.user.create({ data: { email: 'test@example.com' } });
  const skin = await prisma.skin.create({ data: { /* ... */ } });
  const investment = await prisma.investment.create({ data: { /* ... */ } });
  
  // Test query
  const portfolio = await getPortfolioValue(user.id);
  
  expect(portfolio.totalValue).toBeGreaterThan(0);
});
```

## Future Enhancements

### Potential Schema Extensions

1. **Multi-Currency Support:**
   - Add `Currency` model
   - Store prices in multiple currencies
   - Real-time exchange rate tracking

2. **Social Features:**
   - User following/followers
   - Public watchlists
   - Trade recommendations

3. **Advanced Analytics:**
   - Machine learning predictions
   - Correlation analysis between skins
   - Market sentiment indicators

4. **Trading History:**
   - Transaction log model
   - Trade execution tracking
   - Profit/loss timeline

5. **Notification Preferences:**
   - Granular notification settings
   - Multi-channel delivery (email, SMS, push)
   - Notification scheduling

### Partitioning Strategy

For large-scale deployments, consider PostgreSQL table partitioning:

```sql
-- Partition PriceSnapshot by month
CREATE TABLE price_snapshots_202401 
PARTITION OF "PriceSnapshot" 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Archival Strategy

Implement automated archival for old data:

```javascript
// Archive old snapshots to cold storage
const archived = await prisma.priceSnapshot.findMany({
  where: {
    capturedAt: { lt: sixMonthsAgo }
  }
});

// Export to S3/GCS
await exportToArchive(archived);

// Delete from primary database
await prisma.priceSnapshot.deleteMany({
  where: {
    id: { in: archived.map(s => s.id) }
  }
});
```

## Conclusion

This schema design balances:

- **Performance:** Strategic indexing and data modeling for fast queries
- **Flexibility:** JSON fields and optional relations for extensibility
- **Data Integrity:** Constraints, cascades, and unique indexes
- **Scalability:** Partitioning-ready, archival strategies
- **Developer Experience:** Clear relationships, comprehensive documentation

For questions or suggestions, please open an issue in the repository.
