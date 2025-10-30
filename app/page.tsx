import { Suspense } from 'react'
import { getInitialMarketSnapshot, DEFAULT_FILTERS } from '@/lib/get-market-snapshot'
import DashboardClient from '@/components/dashboard-client'

function LoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}

async function Dashboard() {
  const initialSnapshot = await getInitialMarketSnapshot(DEFAULT_FILTERS)
  return <DashboardClient initialSnapshot={initialSnapshot} />
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Market Intelligence Dashboard
              </h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                Real-time market analytics, trends, and insights
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 dark:bg-emerald-900/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Live
              </span>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingState />}>
          <Dashboard />
        </Suspense>
      </div>
    </main>
  )
}
