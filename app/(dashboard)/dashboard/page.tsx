import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { withCache } from '@/lib/cache';
import { addSpanAttributes, withSpan } from '@/lib/telemetry';

export const dynamic = 'force-dynamic';

async function getAnalytics() {
  return withSpan('dashboard.analytics', async () =>
    withCache({
      key: 'dashboard:analytics',
      ttl: 60,
      hydrate: async () => {
        const [views, posts] = await Promise.all([
          prisma.analytics.aggregate({
            _sum: { views: true },
          }),
          prisma.post.count({ where: { published: true } }),
        ]);

        const totalViews = views._sum.views || 0;
        addSpanAttributes({ 'dashboard.views': totalViews, 'dashboard.posts': posts });

        return {
          totalViews,
          posts,
        };
      },
    })
  );
}

async function AnalyticsPanel() {
  const data = await getAnalytics();
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
      <h2 className="text-xl font-semibold text-white">Real-time Analytics</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Stat label="Total Views" value={data.totalViews.toLocaleString()} />
        <Stat label="Published Posts" value={data.posts.toString()} />
      </dl>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Performance Dashboard</h1>
      <p className="mt-2 text-slate-300">Request-level telemetry and cached metrics for critical KPIs.</p>

      <div className="mt-8 grid gap-6">
        <Suspense fallback={<Skeleton title="Real-time Analytics" />}>
          <AnalyticsPanel />
        </Suspense>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <dt className="text-sm uppercase tracking-wide text-slate-300">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-white">{value}</dd>
    </div>
  );
}

function Skeleton({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-800/50" />
        ))}
      </div>
    </div>
  );
}
