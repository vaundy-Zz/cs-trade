import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'performance' },
    update: {},
    create: {
      name: 'Performance',
      slug: 'performance',
    },
  });

  const posts = [
    {
      title: 'Optimizing Next.js for Production',
      slug: 'optimizing-nextjs',
      content: `Next.js is a powerful React framework that provides excellent performance out of the box. However, there are several optimization techniques you can apply to make your application even faster.

1. Enable Image Optimization: Use the Next.js Image component to automatically optimize images.
2. Implement Code Splitting: Break your bundle into smaller chunks for faster initial load.
3. Use Streaming SSR: Leverage React 18's streaming capabilities for progressive rendering.
4. Add Redis Caching: Cache expensive operations with Redis to reduce database load.
5. Optimize Database Queries: Use indexes and minimize the data you fetch.

These optimizations can dramatically improve your Core Web Vitals scores and provide a better user experience.`,
      excerpt: 'Learn how to optimize Next.js applications for production with streaming SSR, code splitting, and caching strategies.',
      published: true,
      featured: true,
      publishedAt: new Date('2024-01-15'),
      authorId: user.id,
      categoryId: category.id,
    },
    {
      title: 'Redis Caching Strategies for SSR',
      slug: 'redis-caching-ssr',
      content: `Server-side rendering can be expensive when dealing with dynamic content. Redis provides an excellent solution for caching SSR output.

Key strategies:
- Cache frequently accessed pages with appropriate TTLs
- Implement cache invalidation patterns for data updates
- Use Redis for session storage to reduce database queries
- Leverage Redis pub/sub for real-time cache invalidation across servers

By implementing these patterns, you can serve most requests from cache while keeping data fresh.`,
      excerpt: 'Discover effective Redis caching strategies to speed up server-side rendering and reduce database load.',
      published: true,
      featured: true,
      publishedAt: new Date('2024-01-10'),
      authorId: user.id,
      categoryId: category.id,
    },
    {
      title: 'Database Optimization with Prisma',
      slug: 'database-optimization-prisma',
      content: `Prisma makes database access type-safe and ergonomic, but it's important to optimize your queries for production.

Best practices:
- Always add indexes for frequently queried fields
- Use select to fetch only the fields you need
- Implement connection pooling for better resource utilization
- Use EXPLAIN ANALYZE to understand query performance
- Consider read replicas for read-heavy workloads

These practices ensure your database can scale with your application.`,
      excerpt: 'Master database optimization techniques with Prisma ORM for high-performance applications.',
      published: true,
      featured: false,
      publishedAt: new Date('2024-01-05'),
      authorId: user.id,
      categoryId: category.id,
    },
    {
      title: 'Monitoring with OpenTelemetry',
      slug: 'monitoring-opentelemetry',
      content: `OpenTelemetry provides vendor-neutral observability for modern applications.

Key benefits:
- Distributed tracing across your entire stack
- Automatic instrumentation for popular frameworks
- Flexible exporters for any monitoring backend
- Correlation between logs, traces, and metrics

Implementing OpenTelemetry early in your project helps you understand performance bottlenecks and debug issues in production.`,
      excerpt: 'Learn how to implement comprehensive monitoring with OpenTelemetry for Next.js applications.',
      published: true,
      featured: false,
      publishedAt: new Date('2024-01-01'),
      authorId: user.id,
      categoryId: category.id,
    },
    {
      title: 'Load Testing with k6',
      slug: 'load-testing-k6',
      content: `k6 is a modern load testing tool designed for developers.

Why k6?
- Write tests in JavaScript
- Cloud-native and CI/CD friendly
- Excellent reporting and analytics
- Support for complex scenarios

Regular load testing helps you understand your application's performance characteristics and plan for scale.`,
      excerpt: 'Implement effective load testing strategies with k6 to ensure your application can handle production traffic.',
      published: true,
      featured: false,
      publishedAt: new Date('2023-12-28'),
      authorId: user.id,
      categoryId: category.id,
    },
    {
      title: 'Core Web Vitals Deep Dive',
      slug: 'core-web-vitals',
      content: `Core Web Vitals are essential metrics for understanding user experience.

The three key metrics:
- LCP (Largest Contentful Paint): Loading performance
- FID (First Input Delay): Interactivity
- CLS (Cumulative Layout Shift): Visual stability

Optimizing these metrics improves both user experience and SEO rankings.`,
      excerpt: 'Understanding and optimizing Core Web Vitals for better user experience and SEO.',
      published: true,
      featured: true,
      publishedAt: new Date('2023-12-25'),
      authorId: user.id,
      categoryId: category.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log('Seeding complete!');
  console.log(`Created/updated ${posts.length} posts for user: ${user.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
