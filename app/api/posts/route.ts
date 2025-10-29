import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCache } from '@/lib/cache';
import { addSpanAttributes, withSpan } from '@/lib/telemetry';

export const revalidate = 60;

export async function GET() {
  return withSpan('api.posts.GET', async () => {
    const posts = await withCache({
      key: 'api:posts',
      ttl: 60,
      hydrate: async () =>
        prisma.post.findMany({
          where: { published: true },
          select: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 20,
        }),
    });

    addSpanAttributes({ 'api.posts.count': posts.length });

    return NextResponse.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  });
}
