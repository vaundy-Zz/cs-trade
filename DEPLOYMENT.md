# Deployment Guide

This guide covers deployment options for the Market Data Ingestion Pipeline.

## Vercel Deployment (Recommended for Next.js)

### Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
- Redis instance (Upstash, Redis Cloud, etc.) - optional

### Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Environment Variables**
   
   In Vercel dashboard or via CLI, set:
   ```bash
   vercel env add DATABASE_URL
   vercel env add REDIS_URL
   vercel env add CRON_SECRET
   # ... add all other environment variables from .env.example
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set up Vercel Cron**
   
   The `vercel.json` file is already configured with a cron schedule. Vercel will automatically:
   - Call `/api/cron` every 15 minutes
   - Include `Authorization: Bearer <CRON_SECRET>` header
   
   Ensure `CRON_SECRET` is configured in your environment variables.

5. **Verify Deployment**
   ```bash
   curl https://your-app.vercel.app/api/ingest -X POST
   ```

### Vercel Postgres Setup

```bash
vercel postgres create
vercel postgres attach
```

This will automatically configure `DATABASE_URL` for you.

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run db:generate
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/market_data
      REDIS_URL: redis://redis:6379
      INGESTION_PROVIDER: mock
    depends_on:
      - postgres
      - redis

  scheduler:
    build: .
    command: npm run scheduler:start
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/market_data
      REDIS_URL: redis://redis:6379
      INGESTION_PROVIDER: mock
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: market_data
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Running with Docker Compose

```bash
docker-compose up -d
docker-compose logs -f app
```

---

## Self-Hosted (VM/Bare Metal)

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis (optional)
- Process manager (PM2, systemd)

### Steps

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd market-data-ingestion
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Set up Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   
   Create `ecosystem.config.cjs`:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'market-data-api',
         script: 'npm',
         args: 'start',
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
         env: {
           NODE_ENV: 'production',
           PORT: 3000
         }
       },
       {
         name: 'market-data-scheduler',
         script: 'npm',
         args: 'run scheduler:start',
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '512M',
         env: {
           NODE_ENV: 'production'
         }
       }
     ]
   };
   ```

   Start:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

---

## Systemd Service (Linux)

Create `/etc/systemd/system/market-data-api.service`:

```ini
[Unit]
Description=Market Data Ingestion API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/market-data-ingestion
EnvironmentFile=/opt/market-data-ingestion/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/market-data-scheduler.service`:

```ini
[Unit]
Description=Market Data Ingestion Scheduler
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/market-data-ingestion
EnvironmentFile=/opt/market-data-ingestion/.env
ExecStart=/usr/bin/npm run scheduler:start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable market-data-api
sudo systemctl enable market-data-scheduler
sudo systemctl start market-data-api
sudo systemctl start market-data-scheduler
```

---

## Kubernetes Deployment

### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: market-data-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: market-data-api
  template:
    metadata:
      labels:
        app: market-data-api
    spec:
      containers:
      - name: api
        image: your-registry/market-data-ingestion:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: market-data-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: market-data-api
spec:
  selector:
    app: market-data-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: market-data-ingestion
spec:
  schedule: "*/15 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: ingestion
            image: curlimages/curl:latest
            args:
            - /bin/sh
            - -c
            - |
              curl -X GET http://market-data-api/api/cron \
                -H "Authorization: Bearer $CRON_SECRET"
            envFrom:
            - secretRef:
                name: market-data-secrets
          restartPolicy: OnFailure
```

---

## Environment-Specific Configuration

### Production Checklist

- [ ] Use strong `CRON_SECRET`
- [ ] Enable SSL/TLS for database connections
- [ ] Use managed PostgreSQL (AWS RDS, GCP Cloud SQL, etc.)
- [ ] Use managed Redis (ElastiCache, MemoryStore, Upstash)
- [ ] Set `LOG_LEVEL` to `info` or `warn`
- [ ] Configure `ALERT_WEBHOOK_URL` for monitoring
- [ ] Set up database backups
- [ ] Enable connection pooling (pgBouncer)
- [ ] Configure rate limiting on API routes
- [ ] Set up monitoring (Datadog, New Relic, etc.)

### Staging Configuration

```bash
INGESTION_PROVIDER=mock
INGESTION_CRON_EXPRESSION="0 * * * *"  # Hourly
LOG_LEVEL=debug
ALERT_MIN_SEVERITY=info
```

### Development Configuration

```bash
DATABASE_URL=postgresql://localhost:5432/market_data_dev
REDIS_URL=redis://localhost:6379
INGESTION_PROVIDER=mock
LOG_LEVEL=debug
```

---

## Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://your-domain.com/api/ingest
   ```

2. **Manual Ingestion Test**
   ```bash
   curl -X POST https://your-domain.com/api/ingest
   ```

3. **Verify Database**
   ```bash
   npm run db:studio
   ```

4. **Check Metrics**
   ```bash
   curl https://your-domain.com/api/metrics | jq
   ```

5. **Verify Cron Job**
   
   Wait for scheduled execution and check logs.

---

## Rollback Procedures

### Vercel

```bash
vercel rollback
```

### Docker

```bash
docker-compose down
docker-compose pull <previous-version>
docker-compose up -d
```

### Kubernetes

```bash
kubectl rollout undo deployment/market-data-api
```

---

## Monitoring Setup

### Datadog Integration

Add to your application:

```javascript
import { StatsD } from 'node-dogstatsd';

const statsd = new StatsD();

metrics.counter('ingestion_success_total', 1);
statsd.increment('market_data.ingestion.success');
```

### Prometheus Metrics Endpoint

Implement `/api/prometheus` route handler to export metrics in Prometheus format.

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check connection pool
SELECT * FROM pg_stat_activity;
```

### Redis Connection Issues

```bash
# Test connection
redis-cli -u $REDIS_URL ping
```

### Cron Not Running

Check logs and verify:
- `CRON_SECRET` matches
- Cron endpoint is accessible
- Authorization header is properly set

---

## Security Considerations

1. **Network Security**
   - Use VPC/private networks for database connections
   - Restrict API access with IP whitelisting
   - Enable WAF for public endpoints

2. **Secrets Management**
   - Use secret managers (AWS Secrets Manager, HashiCorp Vault)
   - Rotate credentials regularly
   - Never commit secrets to version control

3. **API Security**
   - Implement rate limiting
   - Use API keys for external access
   - Enable CORS only for trusted domains

---

## Support

For deployment issues, refer to:
- [README.md](./README.md) - General documentation
- [RUNBOOK.md](./RUNBOOK.md) - Operational procedures
- GitHub Issues - Report bugs and request features
