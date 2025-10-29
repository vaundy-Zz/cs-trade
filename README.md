# Skin Marketplace - Detailed Skin Information

A comprehensive skin detail page implementation featuring real-time market data, interactive 3D visualization, and advanced tracking capabilities.

## Features

### Core Features
- **Skin Detail Page**: Comprehensive view of skin information including name, weapon, collection, and rarity
- **Wear & Float Values**: Visual representation of float values with condition indicators
- **Rarity Breakdown**: Distribution analysis across comparable skins
- **Live Market Listings**: Real-time pricing from multiple providers with sorting capabilities
- **Historical Performance**: Interactive charts showing price trends and trading volume
- **ROI Calculator**: Calculate return on investment with purchase price and date tracking
- **Comparable Skins**: Suggestions for similar skins with similarity scoring
- **Watchlist**: Add skins to a personal watchlist with target prices and notes
- **3D Viewer**: Interactive 3D visualization with fallback to 2D images

### Technical Features
- **Caching**: Multi-layer caching strategy for optimized performance
- **Batched API Calls**: Efficient data fetching with request batching
- **Mobile-First Design**: Fully responsive layout optimized for all screen sizes
- **Analytics Tracking**: Comprehensive interaction tracking for user behavior analysis
- **TypeScript**: Full type safety throughout the application
- **Server-Side API**: Next.js API routes for data fetching

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

```bash
npm run build
npm start
```

## Architecture

### Directory Structure
```
src/
├── components/        # React components
│   ├── SkinDetailPage.tsx
│   ├── SkinViewer3D.tsx
│   ├── WearFloatDisplay.tsx
│   ├── RarityBreakdown.tsx
│   ├── MarketListings.tsx
│   ├── HistoricalPerformance.tsx
│   ├── ROICalculatorWidget.tsx
│   ├── ComparableSkins.tsx
│   └── WatchlistButton.tsx
├── context/          # React context providers
│   ├── WatchlistContext.tsx
│   └── AnalyticsContext.tsx
├── hooks/            # Custom React hooks
│   ├── useSkinDetails.ts
│   └── useROICalculator.ts
├── services/         # API and caching services
│   ├── api.ts
│   └── cache.ts
├── types/            # TypeScript type definitions
│   └── skin.ts
├── utils/            # Utility functions
│   └── formatters.ts
└── data/             # Mock data
    └── skinData.ts
```

### Caching Strategy
- **In-Memory Cache**: Fast access to recently fetched data
- **TTL-based Expiration**: Different cache durations for different data types
  - Skin details: 5 minutes
  - Market listings: 2 minutes
  - Price history: 10 minutes
  - Comparable skins: 15 minutes

### API Endpoints
- `GET /api/skins/[skinId]` - Fetch complete skin details
- `GET /api/skins/[skinId]/listings` - Fetch market listings
- `GET /api/skins/[skinId]/price-history` - Fetch historical price data
- `GET /api/skins/[skinId]/comparable` - Fetch comparable skins
- `POST /api/skins/batch` - Batch fetch multiple skins
- `POST /api/analytics/track` - Track user interactions

## Key Components

### SkinDetailPage
Main component orchestrating the entire detail view with loading and error states.

### SkinViewer3D
Interactive 3D visualization using Three.js with auto-rotation and orbit controls. Falls back to 2D images when 3D is disabled.

### WearFloatDisplay
Visual representation of float values with gradient indicator and condition badges.

### MarketListings
Real-time market data from multiple providers with sorting and price comparison.

### HistoricalPerformance
Interactive price chart using Recharts with 7-day, 30-day, and all-time metrics.

### ROICalculatorWidget
Investment calculator with profit/loss tracking and holding period analysis.

### ComparableSkins
Grid of similar skins with similarity scoring and quick watchlist addition.

### WatchlistButton
Modal-based watchlist management with target price and notes support.

## Analytics Tracking

The application tracks various user interactions:
- Skin detail page views
- 3D viewer toggles
- Market listing clicks
- ROI calculations
- Watchlist additions/removals
- Comparable skin interactions

All events are stored locally and can be exported for analysis.

## Mobile Optimization

- Touch-friendly interface elements
- Optimized image loading
- Responsive grid layouts
- Mobile-specific navigation
- Performance-optimized 3D rendering

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## License

MIT
