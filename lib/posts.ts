import { prisma } from './db';
import { withCache } from './cache';
import { addSpanAttributes, withSpan } from './telemetry';

const FEATURED_POSTS_CACHE_KEY = 'posts:featured:v1';
const RECENT_POSTS_CACHE_KEY = 'posts:recent:v1';

export async function getFeaturedPosts() {
  return withSpan('db.getFeaturedPosts', async () =>
    withCache({
      key: FEATURED_POSTS_CACHE_KEY,
      ttl: 60 * 5,
      hydrate: async () => {
        const posts = await prisma.post.findMany({
          where: {
            published: true,
            featured: true,
          },
          take: 6,
          orderBy: {
            publishedAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        });
        addSpanAttributes({ 'db.featured.count': posts.length });
        return posts;
      },
    })
  );
}

export async function getRecentPosts(limit = 10) {
  return withSpan('db.getRecentPosts', async () =>
    withCache({
      key: `${RECENT_POSTS_CACHE_KEY}:${limit}`,
      ttl: 60 * 2,
      hydrate: async () => {
        const posts = await prisma.post.findMany({
          where: {
            published: true,
          },
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        });
        addSpanAttributes({ 'db.recent.count': posts.length });
        return posts;
      },
    })
  );
}

export async function incrementPostViews(slug: string) {
  return withSpan('db.incrementPostViews', async () =>
    prisma.post.update({
      where: { slug },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
      },
    })
  );
}

export async function getPostBySlug(slug: string) {
  return withSpan('db.getPostBySlug', async () =>
    prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        publishedAt: true,
        views: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    })
  );
}
