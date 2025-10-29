# Quick Start Guide

This guide will help you get the Market Data Ingestion Pipeline running locally in under 5 minutes.

## Prerequisites

- Node.js >= 18
- PostgreSQL database (local or remote)
- Redis (optional)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/market_data?schema=public"
```

### 3. Initialize Database

```bash
npm run db:generate
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Test the Ingestion

### Manual Trigger via API

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{}'
```

You should see a success response with ingestion statistics.

### View Metrics

```bash
curl http://localhost:3000/api/metrics | jq
```

### Check Database

```bash
npm run db:studio
```

This opens Prisma Studio in your browser where you can view the ingested data.

## Next Steps

- **Configure Markets**: Edit `INGESTION_MARKETS` in `.env`
- **Set up Scheduled Ingestion**: Run `npm run scheduler:start`
- **Add Real Data Provider**: Implement a provider in `src/ingestion/providers/`
- **Deploy to Production**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Troubleshooting

### Database Connection Error

Make sure PostgreSQL is running:

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

### Port Already in Use

If port 3000 is in use, set a different port:

```bash
PORT=3001 npm run dev
```

### Module Not Found Errors

Ensure all dependencies are installed:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

For more detailed information, see:
- [README.md](./README.md) - Full documentation
- [RUNBOOK.md](./RUNBOOK.md) - Operational procedures
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options
