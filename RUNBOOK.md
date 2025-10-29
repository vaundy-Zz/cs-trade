# Market Data Ingestion Runbook

Operational procedures for maintaining and troubleshooting the market data ingestion pipeline.

## Table of Contents

1. [System Overview](#system-overview)
2. [On-call Responsibilities](#on-call-responsibilities)
3. [Monitoring & Observability](#monitoring--observability)
4. [Run Procedures](#run-procedures)
   - [Manual Ingestion](#manual-ingestion)
   - [Scheduled Ingestion](#scheduled-ingestion)
   - [Metrics Collection](#metrics-collection)
   - [Alerting](#alerting)
5. [Failure Scenarios](#failure-scenarios)
   - [Database Connectivity Issues](#database-connectivity-issues)
   - [Cache Failures](#cache-failures)
   - [Provider Outages](#provider-outages)
   - [High Latency or Timeouts](#high-latency-or-timeouts)
6. [Recovery Procedures](#recovery-procedures)
   - [Retry Ingestion](#retry-ingestion)
   - [Rebuild Cache](#rebuild-cache)
   - [Replay Historical Data](#replay-historical-data)
7. [Maintenance Tasks](#maintenance-tasks)
8. [Escalation Plan](#escalation-plan)
9. [Appendix](#appendix)

---

## System Overview

- **Purpose**: Collect market data (prices, volatility, aggregates, comparisons, ROI) and store in PostgreSQL.
- **Components**:
  - Next.js API routes (`/api/ingest`, `/api/cron`, `/api/metrics`)
  - Ingestion pipeline (`src/ingestion/pipeline.ts`)
  - PostgreSQL (Prisma ORM)
  - Cache abstraction (Redis or in-memory)
  - Observability (structured logging, metrics, alerting)

## On-call Responsibilities

- Ensure scheduled ingestion runs successfully
- Respond to alerts (critical severity by default)
- Monitor metrics and logs for anomalies
- Maintain service availability and data integrity

## Monitoring & Observability

- **Logs**: Structured JSON logs via Pino. Access via platform logging (e.g., Vercel, CloudWatch) or container logs.
- **Metrics**: Exposed at `/api/metrics`. Key metrics:
  - `ingestion_success_total`
  - `ingestion_failure_total`
  - `ingestion_duration_ms` (histogram)
- **Alerts**: Delivered to `ALERT_WEBHOOK_URL` with severity `warning` or higher.

## Run Procedures

### Manual Ingestion

1. Ensure environment is configured (`DATABASE_URL`, optional `REDIS_URL`).
2. Trigger ingestion:
   ```bash
   curl -X POST https://your-domain/api/ingest \
     -H "Content-Type: application/json" \
     -d '{"symbols": ["BTC-USD", "ETH-USD"]}'
   ```
3. Confirm success via HTTP 200 response and logs.

### Scheduled Ingestion

#### Self-hosted Worker

```bash
npm run scheduler:start
```

- Ensure process manager (systemd, PM2) restarts on failure.
- Scheduler uses `INGESTION_CRON_EXPRESSION`.

#### Vercel Cron

- Configure `vercel.json` crons.
- Set `CRON_SECRET` and ensure invocations include header:
  ```
  Authorization: Bearer <CRON_SECRET>
  ```

### Metrics Collection

```bash
curl https://your-domain/api/metrics | jq
```

- Inspect histogram values for duration anomalies.
- Track success/failure counters for regression.

### Alerting

- Alerts sent via webhook defined in `ALERT_WEBHOOK_URL`.
- Severity threshold configured by `ALERT_MIN_SEVERITY`.
- Alert payloads include context (trigger, provider, error message).

## Failure Scenarios

### Database Connectivity Issues

**Symptoms**:
- Errors: `ECONNREFUSED`, `timeout`, `Prisma` connection failures.
- Alerts: Critical ingestion failure.

**Diagnosis**:
1. Check PostgreSQL service status.
2. Validate network/firewall rules.
3. Review connection pool saturation.

**Mitigation**:
- Restart database service or pods.
- Temporarily scale up database resources.
- Decrease ingest frequency (`INGESTION_CRON_EXPRESSION`) if needed.

### Cache Failures

**Symptoms**:
- Logs: `Redis client error` warnings.
- Increased cache misses.

**Diagnosis**:
1. Verify Redis service availability (`redis-cli PING`).
2. Check network connectivity.
3. Inspect memory usage / eviction policies.

**Mitigation**:
- Restart cache service.
- Fall back to in-memory cache (automatic).
- Increase cache TTL or capacity.

### Provider Outages

**Symptoms**:
- Data provider errors (HTTP 5xx, timeouts).
- Missing data for specific markets.

**Diagnosis**:
1. Check provider status page.
2. Inspect logs for provider error messages.
3. Verify network connectivity to provider endpoints.

**Mitigation**:
- Switch to alternative provider (`INGESTION_PROVIDER`).
- Extend retry logic or backoff intervals (update provider implementation).
- Temporarily disable affected markets.

### High Latency or Timeouts

**Symptoms**:
- Increased `ingestion_duration_ms` metrics.
- HTTP 504 errors on API routes.

**Diagnosis**:
1. Review logs for slow queries or API calls.
2. Inspect database performance (indices, locks).
3. Check provider response times.

**Mitigation**:
- Optimize queries or add indexes.
- Increase database CPU/memory resources.
- Batch ingestion by market groups.

## Recovery Procedures

### Retry Ingestion

1. Identify failure root cause from logs.
2. Resolve underlying issue.
3. Trigger manual ingestion:
   ```bash
   curl -X POST https://your-domain/api/ingest -d '{}'
   ```
4. Confirm success via metrics/logs.

### Rebuild Cache

1. Invalidate cache keys:
   ```typescript
   import { invalidateCacheKeys } from "@/cache/cache";
   await invalidateCacheKeys(["market:*"]);
   ```
2. Trigger manual ingestion to repopulate caches.

### Replay Historical Data

1. Adjust `INGESTION_LOOKBACK_DAYS` to desired window.
2. Trigger manual ingestion with updated lookback.
3. Restore original lookback configuration after completion.

## Maintenance Tasks

- **Weekly**: Review ingestion success/failure metrics.
- **Monthly**: Test failover procedures (database outage simulation).
- **Quarterly**: Validate cron expression aligns with business requirements.
- **After Provider Changes**: Update provider implementation and test end-to-end.

## Escalation Plan

1. Triage: On-call engineer (within 15 minutes).
2. Escalate to:
   - Database administrator if persistent DB issues.
   - Platform team for infrastructure outages.
   - Data provider contacts for third-party outages.
3. Document incident in postmortem (include timeline, root cause, remediation).

## Appendix

### Useful Commands

```bash
# Prisma Studio
npm run db:studio

# Run manual ingestion script
npm run ingest:manual

# Start scheduler (self-hosted)
npm run scheduler:start

# Tail logs (self-hosted)
tail -f logs/ingestion.log
```

### References

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [node-cron](https://github.com/node-cron/node-cron)
- [Pino Logging](https://getpino.io/#/)
- [Redis Operations](https://redis.io/docs/management/)
