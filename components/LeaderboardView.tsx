'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, LeaderboardResponse, TimeRange } from '@/lib/types';
import {
  CATEGORY_CONFIG,
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY,
  DEFAULT_TIME_RANGE,
  DEFAULT_PAGE_SIZE,
  TIME_RANGE_OPTIONS
} from '@/lib/constants';
import LeaderboardList from './LeaderboardList';
import Pagination from './Pagination';

interface MarketOption {
  slug: string;
  name: string;
}

interface LeaderboardViewProps {
  initialCategory: Category;
  initialMarketSlug: string;
  initialTimeRange: TimeRange;
  initialPage: number;
  initialPerPage: number;
  markets: MarketOption[];
}

const PER_PAGE_OPTIONS = [5, 10];

function formatUpdatedAt(updatedAt: string | null): string {
  if (!updatedAt) {
    return 'Awaiting first computation';
  }
  const date = new Date(updatedAt);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export default function LeaderboardView({
  initialCategory,
  initialMarketSlug,
  initialTimeRange,
  initialPage,
  initialPerPage,
  markets
}: LeaderboardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const marketFallback = useMemo(() => {
    if (initialMarketSlug) return initialMarketSlug;
    return markets[0]?.slug ?? '';
  }, [initialMarketSlug, markets]);

  const [category, setCategory] = useState<Category>(initialCategory);
  const [market, setMarket] = useState<string>(marketFallback);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [perPage, setPerPage] = useState<number>(
    PER_PAGE_OPTIONS.includes(initialPerPage) ? initialPerPage : DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useState<number>(initialPage);

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setTimeRange(initialTimeRange);
  }, [initialTimeRange]);

  useEffect(() => {
    setMarket(marketFallback);
  }, [marketFallback]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    setPerPage(PER_PAGE_OPTIONS.includes(initialPerPage) ? initialPerPage : DEFAULT_PAGE_SIZE);
  }, [initialPerPage]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeaderboard() {
      if (!market) {
        return;
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        category,
        market,
        timeRange,
        page: String(page),
        pageSize: String(perPage)
      });

      try {
        const response = await fetch(`/api/leaderboards?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to load leaderboard (${response.status})`);
        }

        const json = (await response.json()) as LeaderboardResponse;
        setData(json);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();

    return () => controller.abort();
  }, [category, market, timeRange, page, perPage]);

  const updateQuery = (next: {
    category?: Category;
    market?: string;
    timeRange?: TimeRange;
    page?: number;
    perPage?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', (next.category ?? category) as string);
    params.set('market', next.market ?? market);
    params.set('timeRange', (next.timeRange ?? timeRange) as string);
    params.set('page', String(next.page ?? page));
    params.set('perPage', String(next.perPage ?? perPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (value: Category) => {
    setCategory(value);
    setPage(1);
    updateQuery({ category: value, page: 1 });
  };

  const handleMarketChange = (value: string) => {
    setMarket(value);
    setPage(1);
    updateQuery({ market: value, page: 1 });
  };

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    setPage(1);
    updateQuery({ timeRange: value, page: 1 });
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(1);
    updateQuery({ perPage: value, page: 1 });
  };

  const handlePageChange = (value: number) => {
    setPage(value);
    updateQuery({ page: value });
  };

  const categoryConfig = CATEGORY_CONFIG[category ?? DEFAULT_CATEGORY];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="leaderboard-market" className="text-sm font-medium text-slate-300">
              Market
            </label>
            <select
              id="leaderboard-market"
              value={market}
              onChange={(event) => handleMarketChange(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {markets.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="leaderboard-category" className="text-sm font-medium text-slate-300">
              Category
            </label>
            <select
              id="leaderboard-category"
              value={category}
              onChange={(event) => handleCategoryChange(event.target.value as Category)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="leaderboard-time-range" className="text-sm font-medium text-slate-300">
              Time Range
            </label>
            <select
              id="leaderboard-time-range"
              value={timeRange}
              onChange={(event) => handleTimeRangeChange(event.target.value as TimeRange)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="leaderboard-per-page" className="text-sm font-medium text-slate-300">
              Rows per page
            </label>
            <select
              id="leaderboard-per-page"
              value={perPage}
              onChange={(event) => handlePerPageChange(Number(event.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{categoryConfig.label}</h2>
              <p className="text-sm text-slate-400">{categoryConfig.description}</p>
              {data?.market && (
                <p className="text-xs text-slate-500">{data.market.name}</p>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {data?.updatedAt ? `Updated ${formatUpdatedAt(data.updatedAt)}` : 'Preparing rankings...'}
            </div>
          </div>

          {loading && (
            <div className="mt-10 flex flex-col items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
              Fetching leaderboard data...
            </div>
          )}

          {error && !loading && (
            <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <p className="font-semibold">Unable to load leaderboard</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <div className="mt-6 space-y-6">
              <LeaderboardList entries={data.entries} category={category} />

              <div className="flex flex-col gap-4 border-t border-slate-800 pt-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Showing
                  <span className="mx-1 font-semibold text-slate-200">{data.entries.length}</span>
                  of
                  <span className="mx-1 font-semibold text-slate-200">
                    {data.pagination.total.toLocaleString()}
                  </span>
                  skins
                </div>

                {data.pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
