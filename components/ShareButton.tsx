'use client';

import { useState } from 'react';

interface Props {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setStatus('idle');
        return;
      }

      await navigator.clipboard.writeText(url);
      setStatus('copied');

      setTimeout(() => {
        setStatus('idle');
      }, 2500);
    } catch (error) {
      console.error('Share failed:', error);
      setStatus('error');

      setTimeout(() => {
        setStatus('idle');
      }, 2500);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleShare}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Share leaderboard
      </button>
      {status === 'copied' && <span className="text-sm text-green-400">Link copied!</span>}
      {status === 'error' && <span className="text-sm text-red-400">Unable to share</span>}
    </div>
  );
}
