import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/leaderboards';
import { LeaderboardResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const market = searchParams.get('market');
  const timeRange = searchParams.get('timeRange');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '5', 10);

  try {
    const result = await getLeaderboard({
      category,
      market,
      timeRange,
      page,
      perPage: pageSize
    });

    const response: LeaderboardResponse = {
      category: result.category,
      market: result.market,
      timeRange: result.timeRange,
      entries: result.entries,
      updatedAt: result.updatedAt,
      pagination: {
        page: result.pagination.page,
        pageSize: result.pagination.perPage,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
