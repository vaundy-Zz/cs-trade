'use client'

import { useEffect } from 'react'

type ErrorBoundaryProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Market dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 dark:border-rose-900 dark:bg-rose-900/20">
      <div className="text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
          <svg
            className="h-8 w-8 text-rose-600 dark:text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {error.message || 'Failed to load market data'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
