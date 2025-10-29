import LeaderboardView from '@/components/LeaderboardView';
import ShareButton from '@/components/ShareButton';
import { ensureAppInitialized } from '@/lib/bootstrap';
import { listMarkets } from '@/lib/markets';
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TIME_RANGE
} from '@/lib/constants';
import type { Category, TimeRange } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const VALID_CATEGORIES: Category[] = ['price_growth', 'trading_volume', 'demand', 'rarity'];
const VALID_TIME_RANGES: TimeRange[] = ['24h', '7d', '30d'];
const PER_PAGE_OPTIONS = [5, 10];

function toSingleValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function normalizeCategory(raw?: string | string[]): Category {
  const value = toSingleValue(raw);
  if (!value || !VALID_CATEGORIES.includes(value as Category)) {
    return DEFAULT_CATEGORY;
  }
  return value as Category;
}

function normalizeTimeRange(raw?: string | string[]): TimeRange {
  const value = toSingleValue(raw);
  if (!value || !VALID_TIME_RANGES.includes(value as TimeRange)) {
    return DEFAULT_TIME_RANGE;
  }
  return value as TimeRange;
}

function normalizePage(raw?: string | string[]): number {
  const value = Number(toSingleValue(raw));
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }
  return Math.floor(value);
}

function normalizePerPage(raw?: string | string[]): number {
  const value = Number(toSingleValue(raw));
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }
  if (PER_PAGE_OPTIONS.includes(value)) {
    return value;
  }
  return DEFAULT_PAGE_SIZE;
}

function normalizeMarket(
  raw: string | string[] | undefined,
  markets: Array<{ slug: string; name: string }>
): string {
  const value = toSingleValue(raw);
  if (value && markets.some((market) => market.slug === value)) {
    return value;
  }
  return markets[0]?.slug ?? '';
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${base}${path}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  await ensureAppInitialized();
  const markets = await listMarkets();

  const category = normalizeCategory(searchParams?.category);
  const timeRange = normalizeTimeRange(searchParams?.timeRange);
  const market = normalizeMarket(searchParams?.market, markets);

  const title = `${CATEGORY_CONFIG[category].label} | CS Skins Leaderboard`;
  const description = CATEGORY_CONFIG[category].description;
  const url = absoluteUrl(`/leaderboards${buildQueryString({ category, timeRange, market })}`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: ['https://dummyimage.com/1200x630/0f172a/38bdf8&text=CS+Skins+Leaderboard']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  await ensureAppInitialized();
  const markets = await listMarkets();

  const category = normalizeCategory(searchParams?.category);
  const timeRange = normalizeTimeRange(searchParams?.timeRange);
  const perPage = normalizePerPage(searchParams?.perPage);
  const page = normalizePage(searchParams?.page);
  const market = normalizeMarket(searchParams?.market, markets);

  const shareQuery = buildQueryString({
    category,
    timeRange,
    market,
    ...(perPage !== DEFAULT_PAGE_SIZE ? { perPage: String(perPage) } : {}),
    ...(page !== 1 ? { page: String(page) } : {})
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              CS Skins Leaderboards
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Discover the most sought-after skins ranked by price growth, trading volume, demand, and rarity across leading marketplaces.
            </p>
          </div>
          <ShareButton
            url={absoluteUrl(`/leaderboards${shareQuery}`)}
            title={`${CATEGORY_CONFIG[category].label} - CS Skins Leaderboard`}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <LeaderboardView
          initialCategory={category}
          initialMarketSlug={market}
          initialTimeRange={timeRange}
          initialPage={page}
          initialPerPage={perPage}
          markets={markets}
        />
      </main>
    </div>
  );
}
