'use client';

import React from 'react';
import type { ComparableSkin } from '../types/skin';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { useWatchlist } from '../context/WatchlistContext';
import { useAnalytics } from '../context/AnalyticsContext';

interface ComparableSkinsProps {
  items: ComparableSkin[];
  currency?: string;
}

export const ComparableSkins: React.FC<ComparableSkinsProps> = ({ items, currency = 'USD' }) => {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { track } = useAnalytics();

  if (!items.length) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Comparable Skins</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((skin) => {
          const watched = isInWatchlist(skin.id);
          return (
            <div
              key={skin.id}
              className="border border-gray-700 rounded-lg p-4 flex flex-col bg-gray-900/50 hover:border-primary-500 transition-colors"
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-800 mb-4">
                <img src={skin.imageUrl} alt={skin.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">{skin.weapon}</p>
                <h4 className="text-base font-semibold text-white">{skin.name}</h4>
                <p className="text-sm text-gray-400 mb-3">Rarity: {skin.rarity}</p>

                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>Current Price</span>
                  <span className="font-semibold">
                    {formatCurrency(skin.currentPrice, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">7d Trend</span>
                  <span className={skin.priceChange7d >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatPercentage(skin.priceChange7d)}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Similarity Score: {Math.round(skin.similarity * 100)}%
                </div>
              </div>

              <button
                onClick={() => {
                  if (!watched) {
                    addToWatchlist(skin.id);
                    track({ skinId: skin.id, action: 'add_comparable_to_watchlist' });
                  }
                }}
                disabled={watched}
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
                  watched
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
                }`}
              >
                {watched ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
