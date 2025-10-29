# Database Optimization Guide

This document describes the database optimization strategies implemented in this application.

## Schema Design

The Prisma schema (`prisma/schema.prisma`) includes:

### Indexes

All critical query paths have appropriate indexes:

1. **User Model**
   - `email` (unique) - for authentication lookups
   - `createdAt` - for user listing/pagination

2. **Post Model**
   - `slug` (unique) - for SEO-friendly URLs
   - `authorId` - for author-based queries
   - `categoryId` - for category-based queries
   - Composite `[published, publishedAt]` - for published posts sorting
   - Composite `[published, featured]` - for featured posts
   - `views` (desc) - for popular posts
   - `createdAt` (desc) - for recent posts

3. **Category & Tag Models**
   - `slug` (unique) - for URL lookups
   - `name` (unique) - for name-based queries

4. **Analytics Model**
   - Composite unique `[path, date]` - for upsert operations
   - `path` - for path-based aggregations
   - `date` (desc) - for time-series queries

## Query Optimization

### Minimal Select Fields

All queries use explicit `select` clauses to minimize payload size:

```typescript
// ❌ BAD: Fetches all fields
const posts = await prisma.post.findMany();

// ✅ GOOD: Only fetches required fields
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
  },
});
```

### Avoid N+1 Queries

Use `include` with nested `select` to avoid N+1 problems:

```typescript
// ✅ GOOD: Single query with join
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    author: {
      select: {
        name: true,
      },
    },
  },
});
```

### EXPLAIN ANALYZE for Production

Before deploying new queries, analyze them:

```sql
EXPLAIN ANALYZE
SELECT * FROM "Post"
WHERE "published" = true
ORDER BY "publishedAt" DESC
LIMIT 10;
```

Check for:
- Sequential scans (bad) vs index scans (good)
- High execution time
- Large number of rows examined

### Connection Pooling

Prisma automatically manages connection pooling. For high-traffic scenarios:

1. Set connection pool size in `DATABASE_URL`:
   ```
   postgresql://user:pass@host:5432/db?connection_limit=10
   ```

2. Monitor active connections via Prisma logs (enabled in dev).

## Performance Monitoring

### Query Logging

In development, Prisma logs all queries:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Slow Query Identification

1. Enable Postgres slow query log:
   ```sql
   ALTER DATABASE your_db SET log_min_duration_statement = 1000;
   ```

2. Monitor logs for queries > 1s.

3. Add indexes or refactor queries as needed.

## Best Practices

1. **Always use indexes for WHERE clauses** on frequently queried fields
2. **Use composite indexes** for multi-field filters (e.g., `[published, publishedAt]`)
3. **Limit query results** with `take` to prevent large result sets
4. **Select only needed fields** to reduce network overhead
5. **Use Redis caching** for frequently accessed data
6. **Monitor query performance** with OpenTelemetry traces

## Maintenance

### Regular Tasks

1. **Vacuum:** Run `VACUUM ANALYZE` weekly to reclaim space and update statistics
2. **Index monitoring:** Check index usage with `pg_stat_user_indexes`
3. **Query analysis:** Review slow query log monthly
4. **Schema updates:** Test migrations in staging before production

### Scaling Considerations

As the application grows:

1. Consider read replicas for read-heavy workloads
2. Partition large tables by date if needed
3. Implement database-level caching (e.g., pg_bouncer)
4. Monitor connection pool exhaustion
