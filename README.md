# Skins Analytics Platform

A comprehensive analytics platform for virtual item markets (CS:GO skins) built with Prisma ORM and PostgreSQL.

## Project Overview

This platform provides robust data modeling and analytics capabilities for tracking and analyzing virtual item prices, volatility, market trends, and user portfolios across multiple marketplaces.

## Technology Stack

- **ORM**: Prisma 5.x
- **Database**: PostgreSQL
- **Node.js**: v18+

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure the database connection:
```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Run migrations to set up the database schema:
```bash
npx prisma migrate dev
```

5. Seed the database with reference data:
```bash
npm run db:seed
```

## Additional Documentation

- [Detailed schema documentation](./SCHEMA_DOCUMENTATION.md) – in-depth technical notes on the Prisma models, indices, and design rationale.

## Database Schema

### Core Entities

#### Skins and Markets
- **Skin**: Virtual items (skins) with metadata, rarity, game category
- **Market**: Trading platforms where skins are listed (Steam, Buff163, etc.)
- **SkinMarket**: Junction table linking skins to specific markets
- **RarityTier**: Standardized rarity classifications (Consumer Grade to Contraband)

#### Price and Analytics Data
- **PriceSnapshot**: Point-in-time price observations with volume, supply, and listing data
- **PriceSeries**: Aggregated OHLC (Open/High/Low/Close) price data at various intervals
- **VolatilityMetric**: Calculated volatility indicators including ATR and standard deviation
- **ApiSource**: External data sources and APIs used for price collection

#### User and Account Management
- **User**: User accounts with authentication credentials
- **Account**: OAuth provider accounts linked to users
- **Session**: Active user sessions for authentication
- **SavedPreference**: User-specific settings and preferences

#### User Features
- **Alert**: Price alerts and notifications with various trigger conditions
- **Watchlist**: Named collections of items to track
- **WatchlistEntry**: Individual items within a watchlist
- **Investment**: User portfolio tracking with purchase history and P&L

### Key Schema Decisions

#### 1. Separation of Skin and Market
Skins and Markets are modeled as separate entities with a `SkinMarket` junction table. This allows:
- Single skin to be listed on multiple markets
- Market-specific pricing and metadata
- Independent price tracking per market
- Cross-market arbitrage analysis

#### 2. Dual Price Storage
Price data is stored in two ways:
- **PriceSnapshot**: Raw, high-frequency data points
- **PriceSeries**: Pre-aggregated time-series data at various intervals

This approach balances:
- Detailed analysis needs (snapshots)
- Query performance (series)
- Storage efficiency (aggregated data)

#### 3. Comprehensive Indexing
Indexes are strategically placed on:
- Foreign keys for join performance
- Time-based columns (`capturedAt`, `bucketStart`, `measuredAt`)
- Composite indexes for common query patterns
- Status flags (`isActive`, `isOpen`, `isPrimary`)

#### 4. Flexible Metadata
JSON fields store extensible metadata throughout the schema, allowing:
- API-specific response data
- Custom user annotations
- Market-specific attributes
- Future feature expansion without migrations

#### 5. Cascade Deletions
Appropriate cascade rules ensure data integrity:
- User deletion removes all related personal data (GDPR compliance)
- Skin/Market deletion cascades to junction tables
- API source deletion preserves historical data via `SetNull`

### Relationships

```
User
├── Account (1:n)
├── Session (1:n)
├── SavedPreference (1:n)
├── Alert (1:n)
├── Watchlist (1:n)
└── Investment (1:n)

Skin
├── SkinMarket (1:n)
├── RarityTier (n:1)
├── Alert (1:n)
├── WatchlistEntry (1:n)
└── Investment (1:n)

Market
├── SkinMarket (1:n)
└── ApiSource (n:1)

SkinMarket
├── PriceSnapshot (1:n)
├── PriceSeries (1:n)
├── VolatilityMetric (1:n)
├── WatchlistEntry (1:n)
├── Alert (1:n)
└── Investment (1:n)

Watchlist
└── WatchlistEntry (1:n)
```

## Data Retention Strategy

### Retention Policies

1. **PriceSnapshot** (Raw Data)
   - **Hourly snapshots**: Retain for 90 days
   - **Daily snapshots**: Retain for 2 years
   - After retention period, aggregate into PriceSeries and archive/delete

2. **PriceSeries** (Aggregated Data)
   - **Hourly series**: Retain for 1 year
   - **Daily series**: Retain indefinitely
   - **Weekly/Monthly series**: Retain indefinitely

3. **VolatilityMetric**
   - Retain for 2 years minimum
   - Long-term patterns are valuable for analysis

4. **User Data**
   - Retain indefinitely while account is active
   - Delete on user request (GDPR compliance)
   - Sessions auto-expire based on `expires` field

### Implementation

Implement retention via scheduled jobs (cron/background worker):

```javascript
// Example: Archive old snapshots
await prisma.priceSnapshot.deleteMany({
  where: {
    capturedAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  }
});
```

Consider using PostgreSQL partitioning for large time-series tables:
- Partition PriceSnapshot by month
- Partition PriceSeries by year
- Drop old partitions for efficient cleanup

## Prisma Migration Workflow

### Development Environment

1. **Making Schema Changes**:
   ```bash
   # Edit prisma/schema.prisma
   
   # Create and apply migration
   npx prisma migrate dev --name descriptive_migration_name
   ```

   This command:
   - Creates a new migration file in `prisma/migrations/`
   - Applies the migration to your database
   - Regenerates Prisma Client

2. **Reset Database** (Development only):
   ```bash
   npx prisma migrate reset
   ```
   This will:
   - Drop the database
   - Create a new database
   - Apply all migrations
   - Run seed script

3. **View Migration Status**:
   ```bash
   npx prisma migrate status
   ```

### Production Environment

1. **Deploy Migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   
   This applies pending migrations without prompts. Use in:
   - CI/CD pipelines
   - Production deployments
   - Staging environments

2. **Resolve Migration Issues**:
   ```bash
   # Mark a failed migration as rolled back
   npx prisma migrate resolve --rolled-back MIGRATION_NAME
   
   # Mark a migration as already applied
   npx prisma migrate resolve --applied MIGRATION_NAME
   ```

### Best Practices

1. **Never edit migration files** after they've been applied
2. **Always test migrations** in staging before production
3. **Backup database** before running migrations in production
4. **Use descriptive names** for migrations
5. **Review generated SQL** in migration files before applying
6. **Keep migrations atomic** - one logical change per migration

### Common Migration Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# View database schema in Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema file
npx prisma validate

# Pull current database schema into schema.prisma
npx prisma db pull

# Push schema changes without creating migrations (prototyping only)
npx prisma db push
```

## Seeding Instructions

### Running the Seed Script

```bash
npm run db:seed
```

Or directly:
```bash
npx prisma db seed
```

### Seed Data Included

The seed script (`prisma/seed.js`) populates:

1. **RarityTier** (8 tiers):
   - Consumer Grade → Contraband
   - Includes rank, color codes, descriptions

2. **ApiSource** (5 sources):
   - Steam Community Market
   - CS:GO Backpack
   - Buff163
   - DMarket
   - SkinPort

3. **Market** (4 baseline markets):
   - Steam Community (primary)
   - Buff163
   - DMarket
   - SkinPort

### Customizing Seed Data

Edit `prisma/seed.js` to:
- Add more markets or API sources
- Include sample skins
- Pre-populate test users
- Add reference watchlists

The seed script uses `upsert` operations, making it safe to run multiple times.

## Development Tools

### Prisma Studio

Launch the visual database editor:
```bash
npx prisma studio
```

Access at `http://localhost:5555` to:
- Browse and edit data
- Test relationships
- Inspect schema

### Database Inspection

```bash
# Generate ERD (requires additional tools)
npx prisma-erd-generator

# Export current schema
npx prisma db pull
```

## Schema Design Principles

1. **Normalization**: Minimize data redundancy while maintaining query performance
2. **Denormalization**: Strategic use of calculated fields (e.g., `totalCost` in Investment)
3. **Soft Deletes**: Use `isActive` flags where audit trails are needed
4. **Timestamps**: All entities include `createdAt` and `updatedAt`
5. **Cascade Deletes**: Automatic cleanup of dependent records
6. **Flexible Enums**: Use database enums for fixed value sets

## Analytical Query Examples

### Price Trend Analysis
```javascript
// Get daily price series for a skin
const priceTrend = await prisma.priceSeries.findMany({
  where: {
    skinMarketId: 'xxx',
    interval: 'DAILY'
  },
  orderBy: { bucketStart: 'desc' },
  take: 30
});
```

### Volatility Comparison
```javascript
// Compare volatility across markets
const volatility = await prisma.volatilityMetric.findMany({
  where: {
    listing: {
      skinId: 'xxx'
    },
    interval: 'DAILY',
    measuredAt: { gte: thirtyDaysAgo }
  },
  include: {
    listing: {
      include: { market: true }
    }
  }
});
```

### Portfolio Performance
```javascript
// Calculate user portfolio value
const investments = await prisma.investment.findMany({
  where: {
    userId: 'xxx',
    isOpen: true
  },
  include: {
    skin: true,
    listing: {
      include: {
        priceSnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1
        }
      }
    }
  }
});
```

## Contributing

When modifying the schema:
1. Create a feature branch
2. Update schema.prisma
3. Run `npx prisma migrate dev --name your_change`
4. Update this documentation
5. Test seed script compatibility
6. Submit PR with migration files

## License

[Your License Here]
