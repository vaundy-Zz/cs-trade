# CS Skins Leaderboard

A full-stack Next.js application for tracking and displaying CS skin leaderboards across multiple categories and markets.

## Features

- **Multiple Leaderboard Categories**: Price Growth, Trading Volume, Demand, and Rarity
- **Market Filtering**: View leaderboards for different markets (Steam, Skinport, BUFF163)
- **Time Range Selection**: 24 hours, 7 days, or 30 days
- **Precomputed Rankings**: Rankings are computed in the background for optimal performance
- **Pagination**: Browse through large leaderboards with ease
- **Caching**: In-memory caching for fast page loads
- **SEO Optimized**: Dynamic metadata and social sharing tags
- **Shareable URLs**: Each leaderboard configuration has its own shareable URL

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (with pg-mem for development)
- **Styling**: Custom CSS with Tailwind-inspired utilities
- **State Management**: React hooks and URL-based state

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (optional - uses in-memory database by default)

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file (optional):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/skins_leaderboard
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If no `DATABASE_URL` is provided, the app will use an in-memory PostgreSQL database.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── leaderboards/       # API endpoints
│   ├── leaderboards/            # Main leaderboard page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage (redirects to leaderboards)
├── components/
│   ├── LeaderboardView.tsx      # Client-side leaderboard component
│   ├── LeaderboardList.tsx      # Leaderboard entries display
│   ├── Pagination.tsx           # Pagination controls
│   └── ShareButton.tsx          # Share/copy URL button
├── lib/
│   ├── bootstrap.ts             # App initialization
│   ├── cache.ts                 # In-memory caching
│   ├── constants.ts             # App constants
│   ├── db.ts                    # Database connection
│   ├── leaderboards.ts          # Leaderboard data logic
│   ├── markets.ts               # Market data logic
│   ├── precompute.ts            # Ranking computation
│   ├── scheduler.ts             # Background job scheduler
│   ├── seed.ts                  # Database seeding
│   ├── seed-data.ts             # Seed data definitions
│   └── types.ts                 # TypeScript types
├── database/
│   └── schema.sql               # Database schema
└── scripts/
    ├── precompute.ts            # Manual ranking computation
    └── seed.ts                  # Manual database seeding
```

## API Endpoints

### GET /api/leaderboards

Query parameters:
- `category` - `price_growth` | `trading_volume` | `demand` | `rarity` (default: `price_growth`)
- `market` - Market slug (e.g., `steam-market`, `skinport`, `buff163`)
- `timeRange` - `24h` | `7d` | `30d` (default: `7d`)
- `page` - Page number (default: `1`)
- `pageSize` - Items per page (default: `5`, max: `20`)

Example:
```
GET /api/leaderboards?category=price_growth&timeRange=7d&page=1&pageSize=10
```

## How It Works

1. **Initialization**: On startup, the app:
   - Initializes the database (in-memory or PostgreSQL)
   - Seeds sample data if the database is empty
   - Precomputes all leaderboard rankings
   - Starts a background scheduler to recompute rankings every 5 minutes

2. **Ranking Computation**: Rankings are precomputed and stored in the `leaderboard_rankings` table for fast retrieval

3. **Caching**: API responses are cached in memory for 5 minutes

4. **Pagination**: Large leaderboards are paginated for optimal performance

## License

MIT
