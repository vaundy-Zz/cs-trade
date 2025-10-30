# Market Intelligence Dashboard

A high-performance, real-time market analytics dashboard built with Next.js 14, TypeScript, SWR, and Recharts.

## Features

- **Real-time Data Updates**: Automatic polling every 5 seconds for near-real-time market insights
- **Interactive Charts**: Recharts-powered visualizations for price movements and supply/demand indicators
- **Smart Filtering**: Filter by market, rarity, and timeframe with optimistic UI updates
- **Server Components**: Leverages Next.js App Router with server-side rendering for fast initial loads
- **Cached Data Layer**: Implements SWR (stale-while-revalidate) pattern for optimal performance
- **Error Handling**: Graceful error states with automatic retry logic
- **Loading States**: Skeleton screens and loading indicators for smooth UX
- **Dark Mode**: Full dark mode support with system preference detection

## Architecture

### Data Flow

1. **Initial Load (Server-Side)**:
   - Server component fetches initial snapshot using cached API
   - Data is cached for 30 seconds with stale-while-revalidate strategy
   - Initial render happens server-side for optimal performance (<2s target)

2. **Client-Side Updates**:
   - SWR handles automatic polling every 5 seconds
   - Filter changes trigger optimistic UI updates
   - Previous data displayed while new data loads (keepPreviousData)
   - Automatic error retry with exponential backoff

### Key Components

- **Dashboard Server Component** (`app/page.tsx`): Fetches initial data server-side
- **Dashboard Client** (`components/dashboard-client.tsx`): Manages state and real-time updates
- **Market Filters** (`components/market-filters.tsx`): Filter controls with optimistic UI
- **Metrics Grid** (`components/metrics-grid.tsx`): Key performance indicators
- **Price Chart** (`components/price-chart.tsx`): Interactive line chart for price trends
- **Supply/Demand Chart** (`components/supply-demand-chart.tsx`): Area chart for market dynamics
- **Trending Skins** (`components/trending-skins.tsx`): Top movers list

### Hooks

- **useMarketData** (`hooks/use-market-data.ts`): SWR wrapper with optimistic mutations

### Data Layer

- **API Route** (`app/api/market/route.ts`): Edge-optimized API endpoint
- **Server Cache** (`lib/get-market-snapshot.ts`): Next.js unstable_cache for server-side caching
- **Data Generator** (`lib/api.ts`): Mock data generator (replace with real API)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build

```bash
npm run build
npm start
```

## Performance Optimizations

1. **Server-Side Rendering**: Initial page load uses cached server data
2. **Incremental Static Regeneration**: 30-second revalidation window
3. **Optimistic UI**: Filter changes show immediately before data loads
4. **Smart Polling**: 5-second refresh interval with deduplication
5. **Keep Previous Data**: No loading flicker when revalidating
6. **Code Splitting**: Automatic route-based code splitting
7. **Tree Shaking**: Recharts optimized via package imports

## Customization

### Adjust Polling Interval

Edit `POLLING_INTERVAL` in `hooks/use-market-data.ts`:

```typescript
export const POLLING_INTERVAL = 5000 // milliseconds
```

### Change Cache Duration

Edit revalidation time in `lib/get-market-snapshot.ts`:

```typescript
{
  revalidate: 30, // seconds
  tags: ['market-dashboard'],
}
```

### Replace Mock Data

Update `lib/api.ts` with your real API integration:

```typescript
export async function fetchMarketData(filters: MarketFilters): Promise<MarketSnapshot> {
  // Replace with your API call
  const response = await fetch('https://your-api.com/market', {
    method: 'POST',
    body: JSON.stringify(filters),
  })
  return response.json()
}
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Data Fetching**: SWR (stale-while-revalidate)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Runtime**: React 18 with Server Components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
