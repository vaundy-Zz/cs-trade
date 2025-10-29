import { Suspense } from 'react';
import { Hero } from '@/components/Hero';
import { PostList } from '@/components/PostList';
import { ClientPosts } from '@/components/ClientPosts';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getFeaturedPosts, getRecentPosts } from '@/lib/posts';

export const revalidate = 300;

async function FeaturedPostsSection() {
  const posts = await getFeaturedPosts();
  return <PostList title="Featured Posts" posts={posts} />;
}

async function RecentPostsSection() {
  const posts = await getRecentPosts(5);
  return <PostList title="Recent Posts" posts={posts} />;
}

function LoadingSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-slate-800/40 p-4">
            <div className="h-4 w-3/4 rounded bg-slate-700/50" />
            <div className="mt-2 h-3 w-full rounded bg-slate-700/30" />
            <div className="mt-1 h-3 w-5/6 rounded bg-slate-700/30" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Optimized App</h1>
            <div className="flex gap-4 text-sm text-slate-300">
              <a href="#home" className="hover:text-emerald-300">Home</a>
              <a href="#about" className="hover:text-emerald-300">About</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          <Hero />

          <div className="grid gap-6 lg:grid-cols-2">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton title="Featured Posts" />}>
                <FeaturedPostsSection />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton title="Recent Posts" />}>
                <RecentPostsSection />
              </Suspense>
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            <ClientPosts />
          </ErrorBoundary>

          <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8">
            <h2 className="text-2xl font-semibold text-white">Performance Features</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              <FeatureItem title="Streaming SSR" description="React 18 Suspense for granular loading states" />
              <FeatureItem title="Redis Caching" description="SSR/ISR caching with Redis for high-traffic routes" />
              <FeatureItem title="Code Splitting" description="Automatic route-based and dynamic imports" />
              <FeatureItem title="Image Optimization" description="Next.js Image with AVIF/WebP formats" />
              <FeatureItem title="OpenTelemetry" description="Request-level tracing and monitoring" />
              <FeatureItem title="Database Indexes" description="Optimized Postgres queries with proper indexing" />
              <FeatureItem title="SWR Caching" description="Client-side data fetching with automatic revalidation" />
              <FeatureItem title="Error Boundaries" description="Graceful error handling with fallbacks" />
            </ul>
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
          Performance-optimized Next.js application
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <h3 className="font-medium text-emerald-300">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </li>
  );
}
