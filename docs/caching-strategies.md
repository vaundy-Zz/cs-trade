# Caching Strategies

This document describes the comprehensive caching strategies implemented across the application.

## Overview

Caching is implemented at multiple layers for maximum performance:

1. **CDN/Edge Caching** (via Vercel/Next.js)
2. **Redis SSR Caching** (Server-side)
3. **SWR Client-side Caching** (Browser)
4. **Database Query Caching** (Implicit via Redis)

## 1. HTTP Caching Headers

### Static Assets
```
Cache-Control: public, max-age=31536000, immutable
```
- **Applied to:** Images, CSS, JavaScript bundles
- **Rationale:** These files are content-addressed and never change
- **Location:** `next.config.js` headers configuration

### API Routes
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=30
```
- **Applied to:** `/api/posts` and other API endpoints
- **Rationale:** Allow edge caching with background revalidation
- **TTL:** 60 seconds (can be adjusted per endpoint)

### Pages
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=150
```
- **Applied to:** All pages via middleware
- **Rationale:** Cache pages at edge while allowing background updates
- **TTL:** 5 minutes with 2.5-minute stale-while-revalidate window

## 2. Redis SSR Caching

### Featured Posts
- **Key:** `posts:featured:v1`
- **TTL:** 300 seconds (5 minutes)
- **Rationale:** Featured posts change infrequently
- **Invalidation:** Manual via cache key version bump

### Recent Posts
- **Key:** `posts:recent:v1:{limit}`
- **TTL:** 120 seconds (2 minutes)
- **Rationale:** Recent posts update more frequently
- **Invalidation:** Automatic TTL expiry

### Individual Posts
- **Key:** `post:{slug}`
- **TTL:** 600 seconds (10 minutes)
- **Rationale:** Post content rarely changes after publication
- **Invalidation:** On post update via `invalidatePattern('post:*')`

### Dashboard Analytics
- **Key:** `dashboard:analytics`
- **TTL:** 60 seconds (1 minute)
- **Rationale:** Analytics should be relatively fresh
- **Invalidation:** Automatic TTL expiry

## 3. ISR (Incremental Static Regeneration)

### Post Pages
```typescript
export const revalidate = 300; // 5 minutes
```
- **Applied to:** `/posts/[slug]`
- **Rationale:** Pre-render popular posts, regenerate every 5 minutes
- **Static Params:** Top 20 posts pre-rendered at build time

### Home Page
```typescript
export const revalidate = 300; // 5 minutes
```
- **Applied to:** `/`
- **Rationale:** Home page regenerates periodically
- **Fallback:** Streaming SSR for uncached requests

## 4. SWR Client-side Caching

### Configuration
```typescript
useSWR('/api/posts', fetcher, {
  dedupingInterval: 60_000,      // 60 seconds
  revalidateOnFocus: false,      // Disable focus revalidation
  keepPreviousData: true,        // Show stale data while revalidating
})
```

### Benefits
- **Deduplication:** Multiple components can use same query without duplicate requests
- **Background Revalidation:** Data stays fresh without blocking UI
- **Optimistic Updates:** Can update UI before server responds

## 5. Cache Invalidation Strategies

### Time-based (TTL)
Most caches use TTL-based expiry:
- Automatic cleanup via Redis TTL
- No manual invalidation required
- Best for data that changes predictably

### Event-based
For critical updates:
```typescript
// After post update
await invalidatePattern('post:*');
await invalidatePattern('posts:*');
```

### Version-based
For breaking changes:
```typescript
// Change cache key version
const CACHE_KEY = 'posts:featured:v2'; // was v1
```

## 6. Cache Warming

### At Build Time
```typescript
export async function generateStaticParams() {
  const slugs = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
    take: 20,
  });
  return slugs.map(({ slug }) => ({ slug }));
}
```
- Pre-renders top 20 posts
- Reduces cold start latency

### At Runtime
```typescript
// Prime cache on first request
await withCache({
  key: 'posts:featured',
  ttl: 300,
  hydrate: () => getFeaturedPosts(),
});
```

## 7. Monitoring Cache Performance

### Cache Hit Rate
Track via OpenTelemetry:
```typescript
addSpanAttributes({
  'cache.hit': cached !== null,
  'cache.key': key,
});
```

### Cache Size
Monitor Redis memory usage:
```bash
redis-cli info memory
```

### Eviction Policy
Set Redis to LRU eviction:
```
maxmemory-policy allkeys-lru
```

## 8. Best Practices

### Do's
✅ Cache expensive operations (database queries, API calls)
✅ Use appropriate TTLs based on data volatility
✅ Version cache keys for schema changes
✅ Monitor cache hit rates
✅ Implement graceful degradation on cache failures

### Don'ts
❌ Cache personalized data at edge
❌ Use overly long TTLs for frequently updated data
❌ Cache without error handling
❌ Forget to set TTLs (causes memory leaks)
❌ Cache sensitive data without encryption

## 9. Tuning Guidelines

### High-traffic Routes
- Increase TTL to reduce database load
- Consider edge caching with Vercel
- Pre-warm cache during deployments

### Low-traffic Routes
- Shorter TTLs to keep data fresh
- On-demand ISR with `revalidate()` API
- Consider skipping cache entirely

### Real-time Data
- Very short TTLs (10-30 seconds)
- Client-side SWR with aggressive revalidation
- Consider WebSocket for true real-time

## 10. Cache Hierarchy

Request flow:

1. **Browser Cache** → Check if cached locally
2. **CDN/Edge** → Check Vercel edge cache
3. **Redis** → Check application cache
4. **Database** → Query and populate caches

This multi-layer approach ensures optimal performance across all scenarios.
