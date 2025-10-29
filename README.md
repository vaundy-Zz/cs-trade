# API Clients for Steam and Third-Party Markets

This project provides a unified service layer for integrating with the Steam Community Market and a third-party marketplace (Buff), including:

- Type-safe Data Transfer Objects (DTOs)
- Reusable HTTP client wrappers supporting retries, timeouts, and exponential backoff
- Centralized error handling and structured logging via Pino
- Redis-backed rate limiting and quota tracking utilities
- Mock helpers (powered by `nock`) for testing external API interactions
- Documentation covering integration steps, credential provisioning, and rate limiting expectations

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- Redis (for production). Tests run against an in-memory Redis mock.

### Installation

```bash
npm install
# or
yarn install
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run build` | Compiles TypeScript to JavaScript. |
| `npm run test` | Runs the Jest test suite. |
| `npm run test:coverage` | Generates coverage reports. |
| `npm run lint` | Lints TypeScript source files. |
| `npm run format` | Applies Prettier formatting to source files. |
| `npm run typecheck` | Runs TypeScript in no-emit mode for type checking. |

## Architecture Overview

```
src/
├── clients/
│   ├── buffClient.ts      # Buff marketplace client wrapper
│   ├── steamClient.ts     # Steam Community Market client wrapper
│   └── types.ts           # Shared DTO definitions
├── http/
│   ├── httpClient.ts      # Axios-based HTTP client with retry/backoff
│   └── types.ts
├── logger/
│   └── index.ts           # Pino logger implementation
├── rateLimit/
│   ├── helpers.ts         # Rate limit helper utilities for route handlers
│   ├── quotaTracker.ts    # Redis-backed quota tracking
│   ├── redisRateLimiter.ts
│   └── types.ts
├── services/
│   └── marketService.ts   # Unified market service aggregating clients
├── testing/
│   └── mocks.ts           # Nock-based HTTP mocks for both APIs
└── utils/
    └── error.ts           # Centralized error normalization
```

## HTTP Client

The `HttpClient` wraps Axios, enabling:

- Configurable base URL, headers, and timeouts
- Automatic exponential backoff with configurable retry counts
- Standardized response shape and error normalization

Usage example:

```ts
import { HttpClient } from '@/http/httpClient';
import { PinoLogger } from '@/logger';

const logger = new PinoLogger();
const client = new HttpClient({
  baseURL: 'https://steamcommunity.com',
  maxRetries: 3,
  timeout: 8000,
}, logger);

const { data } = await client.request({ method: 'GET', url: '/market/priceoverview' });
```

## Service Layer

`MarketService` exposes unified methods for fetching quotes across providers with shared configuration:

- `getSteamQuote`
- `getBuffQuote`
- `getAllQuotes`

Consumers receive normalized DTOs describing quotes, volumes, and timestamps.

## Rate Limiting & Quotas

`RedisRateLimiter` and `QuotaTracker` rely on Redis sorted sets and counters to enforce request limits and track API quotas. Use `withRateLimit` to decorate route handlers:

```ts
import Redis from 'ioredis';
import { RedisRateLimiter, withRateLimit } from '@/rateLimit';

const redis = new Redis(process.env.REDIS_URL);
const limiter = new RedisRateLimiter(redis, { maxRequests: 30, windowMs: 60_000 });

const handler = withRateLimit(
  limiter,
  async (req, res) => {
    res.json(await marketService.getSteamQuote(req.appId, req.itemName));
  },
  { identifier: (req) => `steam:${req.userId}` },
);
```

Quota tracking can be integrated using `QuotaTracker`:

```ts
const quotaTracker = new QuotaTracker(redis, logger);
await quotaTracker.trackUsage('steam', { dailyQuota: 2500, monthlyQuota: 50_000 });
```

## Testing

Tests live under `tests/` and cover success, failure, and rate-limit scenarios for both clients and services. Execute them via `npm run test`.

Nock-based mocks (`src/testing/mocks.ts`) facilitate deterministic responses for integration tests, including success, rate-limit, and server error cases.

## Credential Onboarding

- **Steam**: requires a Steam API key. Set `STEAM_API_KEY` in your environment and provide it to `SteamClient`.
- **Buff**: supply the API key issued by Buff (`BUFF_API_KEY`).

The service layer expects these credentials to be injected during initialization rather than via process globals.

## Rate Limit Assumptions

- **Steam**: Subject to undocumented rate limits that typically allow ~20 requests per minute. Customize `RedisRateLimiter` thresholds as needed.
- **Buff**: Buff enforces stricter quotas per API key. Adjust `QuotaTracker` limits to match contractual access volumes.

## Deployment Considerations

- Configure Redis connection pooling for production workloads.
- Externalize API credentials using a secure secret manager.
- Monitor rate limiting metrics by consuming the structured logs emitted by Pino.

## License

MIT
