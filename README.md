# Environment Configuration

This project uses runtime configuration validated through [`Zod`](https://github.com/colinhacks/zod) to ensure environment variables are present and correctly formatted before the application boots.

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Copy `.env.example` to `.env` and fill in values:**
   ```bash
   cp .env.example .env
   ```

   Refer to the comments in `.env.example` for guidance. This repository requires configuration for:
   - PostgreSQL (connection URL and optional pool settings)
   - Redis (URL and password)
   - NextAuth.js (secret and app URL)
   - Steam and other third-party APIs
   - Rate limiting controls
   - Feature toggles

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

   Application start-up will validate the environment configuration and fail fast with detailed error messages if any required variables are missing or malformed.

## Environment Validation

The environment configuration is centralized in [`src/config/env.ts`](src/config/env.ts). It parses and validates the environment using Zod. Any changes to required environment variables must be reflected both in this file and in `.env.example`.

## Managing Secrets

- Never commit `.env` or sensitive credentials to version control.
- Use a secrets manager (e.g., Vercel Environment Variables, Doppler, HashiCorp Vault) to store production configuration.
- Regenerate `NEXTAUTH_SECRET` for production using:
  ```bash
  openssl rand -base64 32
  ```

## Adding New Variables

1. Add the variable to `.env.example` with a meaningful placeholder value and descriptive comment.
2. Update `src/config/env.ts` with the validation schema to ensure the variable is checked at runtime.
3. Import and use the typed configuration where needed by referencing `env.<VARIABLE>`.
