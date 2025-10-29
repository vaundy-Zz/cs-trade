# Deployment Checklist: Vercel + Managed Postgres/Redis

Use this checklist to ensure the optimized Next.js application is production ready when deploying to Vercel with managed Postgres and Redis services.

## 1. Infrastructure
- [ ] Provision Vercel project and connect the Git repository.
- [ ] Create managed Postgres database (e.g., Vercel Postgres, Neon, Supabase) and obtain `DATABASE_URL`.
- [ ] Create managed Redis instance (e.g., Upstash, Redis Enterprise) and obtain `REDIS_URL`.
- [ ] Configure Vercel environment variables:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `OTEL_EXPORTER_OTLP_ENDPOINT`
  - `OTEL_EXPORTER_OTLP_HEADERS`
  - `OTEL_SERVICE_NAME`
  - `CACHE_TTL_SECONDS`
- [ ] Add Vercel environment protection for production secrets.

## 2. Database
- [ ] Run `npx prisma migrate deploy` on build to apply schema.
- [ ] Seed initial content with `npx prisma db seed` (optional).
- [ ] Validate indexes using `EXPLAIN ANALYZE` for critical queries:
  - Featured posts query
  - Recent posts query
  - Post by slug lookup
- [ ] Configure automated nightly vacuum/analyze jobs for Postgres.

## 3. Redis Caching
- [ ] Verify Redis connectivity from Vercel build logs.
- [ ] Confirm SSR/ISR cache keys are warming via request logs.
- [ ] Configure TTL thresholds per route in `lib/redis.ts` if adjustments are needed.

## 4. Next.js Configuration
- [ ] Ensure `NEXT_RUNTIME=experimental-edge` is set for edge middleware if required.
- [ ] Validate streaming SSR by inspecting waterfall in Lighthouse.
- [ ] Confirm dynamic routes have `generateStaticParams` for ISR coverage.
- [ ] Enable Vercel image optimization (automatic).

## 5. Telemetry & Monitoring
- [ ] Point OTLP exporter to production collector (e.g., Honeycomb, Datadog, Grafana Tempo).
- [ ] Validate traces appear with route, cache, and database spans.
- [ ] Configure alerts for p95 latency > 2s and error rate > 1%.

## 6. Performance Budgets
- [ ] Run Lighthouse on Vercel preview URLs for core pages; ensure performance score ≥ 90.
- [ ] Run `npm run test:load` (k6) against staging environment and store results in `/scripts/results`.
- [ ] Document baseline metrics in `docs/performance-report.md`.
- [ ] Set up synthetic monitoring (Vercel Observability, Pingdom, etc.) for home + post pages.

## 7. Operational Readiness
- [ ] Configure error notifications (Sentry, Vercel Monitoring, etc.).
- [ ] Verify fallback UI/error boundaries render correctly in failure scenarios.
- [ ] Set up log drains to centralized logging if required.
- [ ] Document runbook for cache invalidation and database migrations.

## 8. Post-Deployment
- [ ] Conduct smoke tests on production.
- [ ] Re-run Lighthouse and k6 to confirm production performance.
- [ ] Monitor telemetry dashboards for 24 hours.
- [ ] Schedule regular dependency updates and security scans.
