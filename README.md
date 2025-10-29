# Optimized Next.js Application

A production-ready Next.js application showcasing comprehensive performance optimizations, including streaming SSR, Redis-backed caching, database query optimization, OpenTelemetry monitoring, and k6 load testing.

## 🚀 Performance Features

### 1. **Lighthouse/Core Web Vitals Optimizations**
- **Code Splitting:** Automatic route-based splitting + dynamic imports
- **Image Optimization:** Next.js Image component with AVIF/WebP formats
- **Streaming SSR:** React 18 Suspense for progressive rendering
- **HTTP Caching Headers:** Aggressive caching for static assets, smart caching for dynamic content

### 2. **Redis-backed Caching**
- **SSR Caching:** Featured posts (5 min), recent posts (2 min), individual posts (10 min)
- **ISR Strategy:** Incremental Static Regeneration with on-demand revalidation
- **SWR Client-side:** Smart client-side caching with automatic revalidation

### 3. **Database Optimization**
- **Prisma ORM:** Type-safe database queries with minimal payloads
- **Strategic Indexes:** Composite indexes for common query patterns
- **Query Analysis:** EXPLAIN ANALYZE guidance for production queries
- **Minimal Selects:** Only fetch required fields to reduce payload size

### 4. **Request-level Monitoring**
- **OpenTelemetry Integration:** Full-stack tracing from browser to database
- **Instrumentation:** HTTP, fetch, and custom spans for critical paths
- **Error Boundaries:** Graceful degradation with fallback UI

### 5. **Load Testing**
- **k6 Scripts:** Automated load testing with configurable VUs and duration
- **Baseline Metrics:** Document performance improvements over time
- **Threshold Enforcement:** p50 < 2s, p90 < 3s, error rate < 1%

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **React 18** (Streaming SSR with Suspense)
- **TypeScript**
- **Prisma** (PostgreSQL ORM)
- **Redis** (ioredis)
- **OpenTelemetry** (Observability)
- **SWR** (Client-side data fetching)
- **Tailwind CSS** (Styling)
- **k6** (Load testing)

## 🏁 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - Postgres connection string
- `REDIS_URL` - Redis connection string
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OpenTelemetry collector URL (optional)

### 3. Initialize Database

```bash
npx prisma migrate dev
npx prisma db seed  # Optional: seed with sample data
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Load Testing

### Run k6 Load Tests

```bash
npm run test:load
```

### Save Baseline Metrics

```bash
npm run test:load-baseline
```

Results will be saved to `scripts/results/baseline.json`.

### Custom k6 Configuration

Edit `scripts/load-test.js` to adjust:
- Virtual users (VUs)
- Test duration
- Thresholds
- Target routes

## 📊 Performance Metrics

### Target Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Home Page Load (p50) | < 2s | ✅ |
| Post Page Load (p50) | < 2s | ✅ |
| Lighthouse Performance | ≥ 90 | ✅ |
| Largest Contentful Paint | < 2.5s | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |
| Error Rate | < 1% | ✅ |

See `docs/performance-report.md` for detailed metrics.

## 📚 Documentation

- **[Deployment Checklist](docs/deployment-checklist.md)** - Production deployment guide
- **[Performance Report](docs/performance-report.md)** - Baseline metrics and optimizations
- **[Database Optimization](docs/database-optimization.md)** - Query optimization strategies

## 🏗️ Architecture

### Caching Strategy

```
Browser → Vercel Edge → Redis Cache → Next.js App → Postgres
           ↓                ↓              ↓
         CDN          SSR Cache     Database
```

1. **CDN:** Static assets (images, CSS, JS) cached at the edge
2. **Redis:** SSR/ISR output cached with configurable TTLs
3. **Database:** Minimal queries with strategic indexes

### Monitoring Flow

```
Request → OpenTelemetry → OTLP Exporter → Collector → Observability Platform
            ↓
       Trace Context (propagated through entire stack)
```

## 🚢 Deployment (Vercel)

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with `vercel --prod`
4. Run post-deployment checks per `docs/deployment-checklist.md`

### Required Vercel Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Managed Services

- **Database:** Vercel Postgres, Neon, or Supabase
- **Redis:** Upstash Redis or Redis Enterprise Cloud
- **Monitoring:** Vercel Analytics + OpenTelemetry collector

## 🔧 Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Database Migrations

```bash
npx prisma migrate dev --name migration_name
```

### Prisma Studio

```bash
npm run prisma:studio
```

## 📈 Continuous Optimization

### Lighthouse Audits

Run Lighthouse on key pages after each deployment:

```bash
lighthouse https://your-app.vercel.app --view
```

### Database Query Analysis

Use Prisma query logs and PostgreSQL EXPLAIN:

```typescript
// Enable query logging in lib/db.ts
const prisma = new PrismaClient({
  log: ['query'],
});
```

### Cache Hit Rate Monitoring

Monitor Redis cache hit rate via OpenTelemetry:

```typescript
addSpanAttributes({
  'cache.hit': true,
  'cache.key': key,
});
```

## 🤝 Contributing

1. Follow existing code conventions
2. Add tests for new features
3. Update documentation
4. Run type checking and linting before committing

## 📄 License

MIT

## 🙏 Acknowledgments

Built with modern web performance best practices from:
- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [OpenTelemetry Best Practices](https://opentelemetry.io/docs/)
