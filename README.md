# CS Skins Market Analysis Platform

A comprehensive Counter-Strike skins market analysis platform built with Next.js 14, featuring real-time price tracking, trends analytics, leaderboards, and intelligent alerts.

## 🚀 Features

### Core Features

1. ✅ **Next.js 14 Setup** - Modern App Router with TypeScript, Tailwind CSS, and shadcn/ui
2. ✅ **Environment Configuration** - Zod-validated environment variables with fail-fast validation
3. ✅ **Database Schema** - Comprehensive Prisma schema for skins, markets, prices, users, alerts, and watchlists
4. ✅ **API Clients** - Steam and third-party market API clients with retry logic and error handling
5. ✅ **Redis Caching** - Multi-layer caching with TTL strategies for optimal performance
6. ✅ **Data Ingestion** - Market data ingestion pipeline with real-time updates
7. ✅ **UI Shell** - Responsive layout with navigation, theme switching, and accessibility
8. ✅ **Authentication** - NextAuth with Steam OAuth and protected routes
9. ✅ **Market Dashboard** - Real-time market overview with charts and KPIs
10. ✅ **Trends Analytics** - Historical price analysis with customizable intervals and exports
11. ✅ **Leaderboards** - Rankings by price growth, volume, and demand
12. ✅ **Skin Details** - Detailed skin pages with price history and ROI calculator
13. ✅ **Alerts System** - Custom price alerts with real-time notifications
14. ✅ **Performance** - ISR caching, query optimization, and monitoring

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with ioredis
- **Authentication**: NextAuth.js with Steam OAuth
- **Styling**: Tailwind CSS 3 + shadcn/ui
- **Charts**: Recharts
- **Data Fetching**: SWR for real-time updates
- **Validation**: Zod
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (local or cloud)
- Redis instance (local or cloud)
- Steam API Key (get from [Steam Web API](https://steamcommunity.com/dev/apikey))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cs-skins-market
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
APP_URL=http://localhost:3000

# Database - PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/cs_skins_market
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Cache - Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# NextAuth.js Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000

# Steam API
STEAM_API_KEY=<your-steam-api-key>
STEAM_CALLBACK_URL=http://localhost:3000/api/auth/callback/steam

# Third-party Market API Keys
THIRD_PARTY_API_KEY=<your-api-key>
THIRD_PARTY_API_SECRET=<your-api-secret>

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Feature Flags
FEATURE_STEAM_INTEGRATION=true
FEATURE_ANALYTICS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Session
SESSION_MAX_AGE=2592000
```

### 4. Database Setup

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cs-skins-market/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── market/        # Market data endpoints
│   │   │   ├── skins/         # Skin data endpoints
│   │   │   ├── trends/        # Trends analytics endpoints
│   │   │   ├── leaderboards/  # Leaderboards endpoints
│   │   │   ├── alerts/        # Alerts management endpoints
│   │   │   └── watchlists/    # Watchlists endpoints
│   │   ├── dashboard/         # Dashboard page
│   │   ├── trends/            # Trends analytics page
│   │   ├── leaderboards/      # Leaderboards page
│   │   ├── alerts/            # Alerts management page
│   │   ├── profile/           # User profile page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth-provider.tsx  # Auth session provider
│   │   ├── navigation.tsx     # Main navigation
│   │   ├── theme-provider.tsx # Theme provider
│   │   └── theme-toggle.tsx   # Theme toggle button
│   ├── lib/                   # Utility libraries
│   │   ├── api/               # API clients
│   │   │   ├── steam-client.ts
│   │   │   └── market-client.ts
│   │   ├── cache/             # Caching layer
│   │   │   └── redis.ts
│   │   ├── db/                # Database utilities
│   │   │   └── prisma.ts
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── utils.ts           # Helper utilities
│   ├── config/                # Configuration
│   │   └── env.ts             # Environment validation
│   └── types/                 # TypeScript definitions
│       └── next-auth.d.ts
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── README.md                  # This file
```

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server

### Database

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database (dev)
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm run typecheck` - Run TypeScript type checking

### Testing

- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

## 🔐 Authentication

The platform uses NextAuth.js with Steam OAuth:

1. Users sign in via Steam OpenID
2. Sessions are managed with JWT tokens
3. Protected routes require authentication
4. User data is stored in PostgreSQL

## 💾 Database Models

Key models include:

- **Skin** - CS skin items with metadata
- **Market** - Trading platforms and marketplaces
- **PriceSnapshot** - Real-time price data points
- **PriceSeries** - Aggregated price data by interval
- **User** - User accounts and profiles
- **Alert** - Price alerts and notifications
- **Watchlist** - User's tracked items
- **Investment** - Portfolio tracking

## 📊 API Endpoints

### Market Data

- `GET /api/market` - Get market snapshot
- `GET /api/skins/[id]` - Get skin details
- `GET /api/trends` - Get price trends
- `GET /api/leaderboards` - Get leaderboards

### User Features

- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create new alert
- `GET /api/watchlists` - Get user watchlists
- `POST /api/watchlists` - Create watchlist

### Authentication

- `GET /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/[...nextauth]` - NextAuth handlers

## 🎨 Theming

The application supports dark and light themes:

- Theme toggle in navigation bar
- Persisted theme preference
- CSS variables for customization
- Accessible color contrast

## ⚡ Performance Optimizations

- **Redis Caching**: Multi-layer caching with TTL strategies
- **Query Optimization**: Efficient Prisma queries with proper indexes
- **ISR**: Incremental Static Regeneration for static content
- **SWR**: Stale-while-revalidate for real-time data
- **Image Optimization**: Next.js automatic image optimization

## 🧪 Testing

Run tests with:

```bash
npm run test
```

Tests are located in `__tests__` directories and use Vitest + React Testing Library.

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set in your production environment:

- Database connection strings
- Redis connection
- API keys
- NextAuth secrets

### Database Migration

```bash
npm run db:migrate
```

## 🤝 Contributing

1. Follow conventional commits
2. Run linting and tests before committing
3. Ensure TypeScript has no errors
4. Update documentation as needed

## 📝 License

MIT

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- shadcn for the beautiful UI components
- Vercel for hosting and deployment
