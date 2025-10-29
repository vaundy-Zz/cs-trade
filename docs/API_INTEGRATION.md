# API Integration Guide

This guide covers how to integrate with the Steam Community Market API and Buff.163 API using this client library.

## Table of Contents

- [Steam API Integration](#steam-api-integration)
- [Buff API Integration](#buff-api-integration)
- [Rate Limiting Configuration](#rate-limiting-configuration)
- [Error Handling](#error-handling)
- [Testing Integrations](#testing-integrations)

## Steam API Integration

### Obtaining API Credentials

1. Visit the [Steam Web API Key registration page](https://steamcommunity.com/dev/apikey)
2. Log in with your Steam account
3. Register for a Web API Key
4. Save the generated API key securely

### Configuring the Steam Client

```typescript
import { SteamClient, PinoLogger } from '@/index';

const logger = new PinoLogger();
const steamClient = new SteamClient(
  {
    apiKey: process.env.STEAM_API_KEY,
    baseURL: 'https://steamcommunity.com', // Optional, default value
  },
  logger
);
```

### Available Methods

#### getPriceOverview

Fetches pricing information for a specific item in the Steam Community Market.

```typescript
const priceData = await steamClient.getPriceOverview(
  730, // CS:GO App ID
  'AK-47 | Redline (Field-Tested)',
  1 // Currency ID (1 = USD)
);

console.log(priceData);
// {
//   appId: 730,
//   marketHashName: 'AK-47 | Redline (Field-Tested)',
//   lowestPrice: 10.50,
//   medianPrice: 11.25,
//   volume: 1234,
//   currency: 'USD',
//   updatedAt: '2024-01-15T10:30:00.000Z'
// }
```

#### getMarketListings

Fetches a paginated list of market listings for a specific game.

```typescript
const listings = await steamClient.getMarketListings(
  730, // CS:GO App ID
  0,   // Start index
  100  // Count
);
```

### Currency IDs

| Currency | ID |
|----------|---|
| USD | 1 |
| GBP | 2 |
| EUR | 3 |
| CHF | 4 |
| RUB | 5 |
| PLN | 6 |
| BRL | 7 |
| JPY | 8 |
| NOK | 9 |
| IDR | 10 |

### Rate Limits

Steam imposes rate limits on API requests:

- **Documented**: No official documentation
- **Observed**: ~20-30 requests per minute per IP
- **429 Response**: Steam may return HTTP 429 when limits are exceeded

**Best Practices**:
- Implement rate limiting at 20 requests/minute
- Use exponential backoff on retries
- Cache responses when appropriate

## Buff API Integration

### Obtaining API Credentials

1. Create an account on [Buff.163.com](https://buff.163.com)
2. Navigate to API settings in your account dashboard
3. Generate an API key
4. Note your API key and any rate limit information provided

### Configuring the Buff Client

```typescript
import { BuffClient, PinoLogger } from '@/index';

const logger = new PinoLogger();
const buffClient = new BuffClient(
  {
    apiKey: process.env.BUFF_API_KEY,
    baseURL: 'https://buff.163.com/api', // Optional, default value
  },
  logger
);
```

### Available Methods

#### getItem

Fetches detailed information about a specific item.

```typescript
const item = await buffClient.getItem('12345');

console.log(item);
// {
//   id: '12345',
//   name: 'AK-47 | Redline (Field-Tested)',
//   price: 12.50,
//   currency: 'USD',
//   quantity: 50,
//   updatedAt: '2024-01-15T10:30:00.000Z'
// }
```

#### getOrderBook

Fetches the order book (buy/sell orders) for a specific item.

```typescript
const orderBook = await buffClient.getOrderBook('12345');

console.log(orderBook);
// {
//   bids: [{ price: 11.50, quantity: 3 }, ...],
//   asks: [{ price: 12.50, quantity: 2 }, ...],
//   spread: 1.00,
//   lastUpdated: '2024-01-15T10:30:00.000Z'
// }
```

### Rate Limits

Buff enforces stricter rate limits:

- **Standard Tier**: 10 requests/minute
- **Premium Tier**: 30 requests/minute (varies by contract)
- **Quota**: Daily and monthly quotas may apply

**Best Practices**:
- Configure rate limiter according to your tier
- Monitor quota usage via `QuotaTracker`
- Implement request prioritization for critical operations

## Rate Limiting Configuration

### Basic Rate Limiting

```typescript
import Redis from 'ioredis';
import { RedisRateLimiter } from '@/index';

const redis = new Redis(process.env.REDIS_URL);

const steamLimiter = new RedisRateLimiter(redis, {
  maxRequests: 20,
  windowMs: 60_000, // 1 minute
  keyPrefix: 'steam',
});

// Check rate limit before making request
const result = await steamLimiter.checkLimit('user-id');
if (result.allowed) {
  // Make API request
}
```

### Quota Tracking

```typescript
import { QuotaTracker } from '@/index';

const quotaTracker = new QuotaTracker(redis, logger);

// Track usage
const status = await quotaTracker.trackUsage('steam', {
  dailyQuota: 2500,
  monthlyQuota: 50_000,
});

console.log(status);
// {
//   daily: {
//     used: 123,
//     limit: 2500,
//     remaining: 2377,
//     resetAt: 1705363200000
//   },
//   monthly: {
//     used: 5432,
//     limit: 50000,
//     remaining: 44568,
//     resetAt: 1706918400000
//   }
// }
```

### Using with Services

```typescript
import { MarketService } from '@/index';

const marketService = new MarketService({
  steamClient,
  buffClient,
  logger,
  rateLimiters: {
    steam: steamLimiter,
    buff: buffLimiter,
  },
  quotaTracker,
  quotaConfig: {
    steam: { dailyQuota: 2500, monthlyQuota: 50_000 },
    buff: { dailyQuota: 1000 },
  },
});

// Rate limiting is automatically applied
const quote = await marketService.getSteamQuote(730, 'AK-47 | Redline');
```

## Error Handling

### Error Types

The library provides several custom error types:

#### ApiError

Thrown when an API returns an error response.

```typescript
import { ApiError } from '@/index';

try {
  const item = await steamClient.getPriceOverview(730, 'Invalid Item');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.code);    // 'STEAM_API_ERROR'
    console.log(error.status);  // HTTP status code
    console.log(error.details); // Additional error details
  }
}
```

#### RateLimitError

Thrown when a rate limit is exceeded.

```typescript
import { RateLimitError } from '@/index';

try {
  await marketService.getSteamQuote(730, 'AK-47');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(error.retryAfter); // Milliseconds until retry allowed
  }
}
```

#### HttpError

Thrown when an HTTP request fails.

```typescript
import { HttpError } from '@/index';

try {
  await steamClient.getPriceOverview(730, 'AK-47');
} catch (error) {
  if ((error as any).isRetryable) {
    console.log('Error is retryable');
    console.log((error as any).status);
  }
}
```

### Retry Configuration

The HTTP client automatically retries failed requests:

- **Retryable Errors**: 5xx errors, 429 (rate limit), network errors
- **Non-Retryable**: 4xx errors (except 429)
- **Max Retries**: Configurable (default: 3)
- **Backoff Strategy**: Exponential with jitter

```typescript
const client = new HttpClient({
  baseURL: 'https://steamcommunity.com',
  maxRetries: 5,
  retryDelay: 250,      // Initial delay in ms
  maxRetryDelay: 8000,  // Max delay in ms
}, logger);
```

## Testing Integrations

### Using Mocks

```typescript
import { createMockSteamApi, createMockBuffApi } from '@/testing/mocks';

const steamMock = createMockSteamApi();

// Mock successful response
steamMock.mockPriceOverview(730, 'AK-47', {
  success: true,
  lowest_price: '$10.50',
  median_price: '$11.25',
  volume: '1,234',
});

// Test your code
const result = await steamClient.getPriceOverview(730, 'AK-47');
expect(result.lowestPrice).toBe(10.5);

// Clean up
steamMock.clean();
```

### Testing Rate Limits

```typescript
import RedisMock from 'ioredis-mock';

const redis = new RedisMock();
const limiter = new RedisRateLimiter(redis, {
  maxRequests: 3,
  windowMs: 1000,
});

// Test rate limiting behavior
for (let i = 0; i < 3; i++) {
  await limiter.checkLimit('user-id');
}

// This should fail
await expect(limiter.consume('user-id')).rejects.toThrow(RateLimitError);
```

### Testing Error Scenarios

```typescript
// Mock rate limit error
steamMock.mockRateLimitError(730, 'AK-47');

// Mock server error
steamMock.mockServerError(730, 'AK-47');

// Mock network error
steamMock.mockNetworkError(730, 'AK-47');
```

## Best Practices

1. **Always use rate limiting** in production environments
2. **Monitor quota usage** regularly using `QuotaTracker`
3. **Implement proper error handling** for all API calls
4. **Cache responses** when appropriate to reduce API calls
5. **Use structured logging** to track API usage patterns
6. **Test with mocks** to avoid hitting real APIs during development
7. **Configure appropriate timeouts** based on your use case
8. **Use Redis for rate limiting** in distributed systems
9. **Implement circuit breakers** for frequently failing APIs
10. **Set up monitoring and alerting** for quota exhaustion

## Support

For issues or questions:
- Check the README.md for general information
- Review test files for usage examples
- Consult API documentation for Steam and Buff
