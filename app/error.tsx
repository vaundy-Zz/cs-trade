"use client";

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-bold text-red-300">Something went wrong!</h2>
        <p className="mt-4 text-slate-300">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-8 rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white transition hover:bg-emerald-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
