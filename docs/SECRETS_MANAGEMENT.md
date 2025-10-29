# Secrets Management Guide

This document provides guidance on securely managing secrets and environment variables for this project.

## Development

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values:
   - Never commit `.env` to version control
   - Store sensitive values securely (e.g., password managers, local secret vaults)
   - Request access to development credentials from your team lead

### Required Secrets

#### NEXTAUTH_SECRET
Generate a secure random string:
```bash
openssl rand -base64 32
```

#### DATABASE_URL
Format: `postgresql://username:password@host:port/database`
- Development: Use a local PostgreSQL instance or request dev database credentials
- Never use production database credentials in development

#### REDIS_URL
Format: `redis://host:port` or `rediss://host:port` (for TLS)
- Development: Use a local Redis instance (`redis://localhost:6379`)

#### STEAM_API_KEY
1. Visit [Steam Web API Key Registration](https://steamcommunity.com/dev/apikey)
2. Sign in with your Steam account
3. Register for an API key with your domain name
4. Copy the generated key to your `.env` file

#### Third-party API Keys
Replace `THIRD_PARTY_API_KEY` and `THIRD_PARTY_API_SECRET` with actual service names:
- Follow each service's documentation for API key generation
- Store keys with appropriate scopes/permissions for development

## Production

### Recommended Secrets Management Solutions

#### Vercel Environment Variables
1. Go to your project settings in Vercel
2. Navigate to the Environment Variables section
3. Add each required variable from `.env.example`
4. Set appropriate environment scopes (Production, Preview, Development)

#### Docker Secrets
For containerized deployments:
```bash
docker secret create db_password db_password.txt
docker secret create redis_password redis_password.txt
```

Then reference in your `docker-compose.yml`:
```yaml
services:
  app:
    secrets:
      - db_password
      - redis_password
```

#### Kubernetes Secrets
```bash
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=REDIS_URL="redis://..." \
  --from-literal=NEXTAUTH_SECRET="..."
```

#### HashiCorp Vault
Integrate with Vault for dynamic secrets:
```typescript
import { env } from "@/config/env";
// Vault client initialization and secret fetching
```

#### AWS Secrets Manager
Store secrets in AWS and retrieve at runtime:
```bash
aws secretsmanager create-secret \
  --name /app/production/database-url \
  --secret-string "postgresql://..."
```

### CI/CD Integration

#### GitHub Actions
Store secrets in repository settings and reference in workflows:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

#### GitLab CI
Add variables in Settings > CI/CD > Variables:
```yaml
variables:
  DATABASE_URL: $DATABASE_URL
```

## Security Best Practices

1. **Principle of Least Privilege**: Grant minimal necessary permissions to API keys and database users
2. **Rotation**: Regularly rotate secrets, especially after team member departures
3. **Separation**: Use different credentials for each environment (dev, staging, prod)
4. **Monitoring**: Enable audit logging for secret access
5. **Encryption**: Always use TLS/SSL for database and Redis connections in production
6. **No Commits**: Add `.env` to `.gitignore` (already configured)
7. **Code Reviews**: Never merge commits containing hardcoded secrets

## Troubleshooting

### Environment Variables Not Loading
- Ensure `.env` file exists in the project root
- Restart your development server after changing environment variables
- Check file permissions: `.env` should be readable by your user

### Validation Errors
The application will fail fast with descriptive error messages if:
- Required variables are missing
- Values are malformed (e.g., invalid URLs)
- Logical constraints are violated (e.g., pool max < pool min)

Review the error message and update your `.env` file accordingly.

### Edge Runtime Compatibility
Some environment variables are validated at build time for Edge Runtime compatibility. If you see Edge-related errors:
- Ensure you're not using Node.js-specific APIs in edge functions
- Verify all required variables are present at build time
- Check Next.js Edge Runtime documentation for limitations
