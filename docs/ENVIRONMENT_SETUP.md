# Environment Setup Guide

This guide walks you through setting up your environment variables for local development and production deployments.

## Overview

This application uses a centralized, type-safe environment configuration system built with [Zod](https://github.com/colinhacks/zod). All environment variables are validated at application startup, ensuring the app **fails fast** with clear error messages if configuration is missing or incorrect.

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in required values** (see sections below for details on each variable)

3. **Start the application:**
   ```bash
   pnpm dev
   ```

If any required environment variables are missing or malformed, the application will immediately exit with a descriptive error message pointing to the specific issues.

## Environment Variables Reference

### Application Settings

#### `NODE_ENV`
- **Type:** `"development" | "production" | "test"`
- **Default:** `"development"`
- **Description:** Application environment mode

#### `APP_URL`
- **Type:** URL string
- **Required:** Yes
- **Example:** `http://localhost:3000`
- **Description:** Base URL of the application

### Database Configuration

#### `DATABASE_URL`
- **Type:** PostgreSQL connection URL
- **Required:** Yes
- **Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Example:** `postgresql://admin:secret@localhost:5432/myapp`
- **Description:** PostgreSQL database connection string

#### `DATABASE_POOL_MIN`
- **Type:** Non-negative integer
- **Default:** `0`
- **Description:** Minimum number of database connections in the pool

#### `DATABASE_POOL_MAX`
- **Type:** Positive integer
- **Default:** `10`
- **Description:** Maximum number of database connections in the pool

### Cache Configuration

#### `REDIS_URL`
- **Type:** Redis connection URL
- **Required:** Yes
- **Format:** `redis://[host]:[port]` or `rediss://[host]:[port]` (TLS)
- **Example:** `redis://localhost:6379`
- **Description:** Redis cache server connection string

#### `REDIS_PASSWORD`
- **Type:** String
- **Optional:** Yes
- **Description:** Password for Redis authentication (if required)

### Authentication (NextAuth.js)

#### `NEXTAUTH_SECRET`
- **Type:** String (min 32 characters recommended)
- **Required:** Yes
- **Generate:** `openssl rand -base64 32`
- **Description:** Secret key used to encrypt JWT tokens and session data

#### `NEXTAUTH_URL`
- **Type:** URL string
- **Required:** Yes
- **Example:** `http://localhost:3000`
- **Description:** Canonical URL of the application for NextAuth callbacks

### Third-Party Integrations

#### `STEAM_API_KEY`
- **Type:** String
- **Required:** Yes
- **How to get:** Register at [Steam Web API](https://steamcommunity.com/dev/apikey)
- **Description:** API key for Steam integration

#### `STEAM_CALLBACK_URL`
- **Type:** URL string
- **Required:** Yes
- **Example:** `http://localhost:3000/api/auth/callback/steam`
- **Description:** OAuth callback URL for Steam authentication

#### `THIRD_PARTY_API_KEY`
- **Type:** String
- **Required:** Yes
- **Description:** API key for third-party service integrations

#### `THIRD_PARTY_API_SECRET`
- **Type:** String
- **Required:** Yes
- **Description:** API secret for third-party service integrations

### Rate Limiting

#### `RATE_LIMIT_ENABLED`
- **Type:** Boolean
- **Default:** `true`
- **Description:** Enable/disable rate limiting

#### `RATE_LIMIT_MAX_REQUESTS`
- **Type:** Positive integer
- **Required:** Yes
- **Example:** `100`
- **Description:** Maximum number of requests allowed per window

#### `RATE_LIMIT_WINDOW_MS`
- **Type:** Positive integer (milliseconds)
- **Required:** Yes
- **Example:** `60000` (1 minute)
- **Description:** Time window for rate limiting

#### `RATE_LIMIT_REDIS_ENABLED`
- **Type:** Boolean
- **Default:** `true`
- **Description:** Use Redis for distributed rate limiting across instances

### Feature Toggles

#### `FEATURE_STEAM_INTEGRATION`
- **Type:** Boolean
- **Default:** `true`
- **Description:** Enable Steam integration features

#### `FEATURE_ANALYTICS`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Enable analytics tracking

#### `FEATURE_MAINTENANCE_MODE`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Put application in maintenance mode

#### `FEATURE_NEW_UI`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Enable new UI features (feature flag)

### Logging

#### `LOG_LEVEL`
- **Type:** `"debug" | "info" | "warn" | "error"`
- **Default:** `"info"`
- **Description:** Minimum log level to output

#### `LOG_FORMAT`
- **Type:** `"json" | "pretty"`
- **Default:** `"json"`
- **Description:** Log output format

### Security

#### `CORS_ALLOWED_ORIGINS`
- **Type:** Comma-separated string
- **Required:** Yes
- **Example:** `http://localhost:3000,https://example.com`
- **Description:** Allowed CORS origins

#### `SESSION_MAX_AGE`
- **Type:** Positive integer (seconds)
- **Required:** Yes
- **Example:** `2592000` (30 days)
- **Description:** Maximum session age in seconds

### Optional Monitoring

#### `SENTRY_DSN`
- **Type:** String
- **Optional:** Yes
- **Description:** Sentry DSN for error tracking

#### `ANALYTICS_ID`
- **Type:** String
- **Optional:** Yes
- **Description:** Analytics service tracking ID

## Validation and Error Handling

### Fail-Fast Behavior

The application validates all environment variables on startup. If validation fails, the app will:

1. **Stop immediately** before starting the server
2. **Display clear error messages** showing which variables are problematic
3. **Provide guidance** on what format is expected

Example error output:
```
Invalid environment configuration. Please fix the following:
DATABASE_URL: Invalid url
NEXTAUTH_SECRET: NEXTAUTH_SECRET is required.
RATE_LIMIT_MAX_REQUESTS: Expected number, received nan
```

### Type Safety

All environment variables are fully typed through TypeScript. Import and use them like:

```typescript
import { env } from "@/config/env";

console.log(env.DATABASE_URL); // Fully typed!
console.log(env.FEATURE_STEAM_INTEGRATION); // boolean
```

### Edge Runtime Compatibility

The configuration module is designed to be Edge Runtime safe. All validation occurs using standard JavaScript without Node.js-specific APIs, making it compatible with:

- Next.js Edge Runtime
- Cloudflare Workers
- Vercel Edge Functions
- Other serverless edge platforms

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dev_db
REDIS_URL=redis://localhost:6379
```

### Production
```bash
NODE_ENV=production
APP_URL=https://yourapp.com
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/prod_db
REDIS_URL=rediss://prod-redis.example.com:6380
```

### Testing
```bash
NODE_ENV=test
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/test_db
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### Application Won't Start

**Error:** `Invalid environment configuration`
- **Solution:** Check the error message for specific missing or malformed variables
- **Action:** Update your `.env` file with the correct values

**Error:** `DATABASE_POOL_MAX cannot be less than DATABASE_POOL_MIN`
- **Solution:** Ensure `DATABASE_POOL_MAX` is greater than or equal to `DATABASE_POOL_MIN`

### Variables Not Loading

1. Ensure `.env` file is in the project root
2. Restart the development server after making changes
3. Check that variable names match exactly (case-sensitive)
4. Verify no syntax errors in `.env` file (no quotes around values unless needed)

### Edge Runtime Issues

If deploying to edge environments:
- Ensure all required variables are available at build time
- Some platforms require explicit environment variable declarations
- Check platform-specific documentation for environment variable handling

## Adding New Environment Variables

1. **Add to `.env.example`** with a descriptive comment
2. **Update `src/config/env.ts`** to include validation schema
3. **Document in this guide** with type, default, and description
4. **Update production secrets** in your deployment platform

## See Also

- [Secrets Management Guide](./SECRETS_MANAGEMENT.md)
- [Main README](../README.md)
- [Zod Documentation](https://zod.dev)
