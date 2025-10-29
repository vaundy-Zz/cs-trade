'use client';

import React, { useState } from 'react';
import type { MarketListing } from '../types/skin';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { useAnalytics } from '../context/AnalyticsContext';

interface MarketListingsProps {
  listings: MarketListing[];
  skinId?: string;
}

export const MarketListings: React.FC<MarketListingsProps> = ({ listings, skinId }) => {
  const [sortBy, setSortBy] = useState<'price' | 'provider'>('price');
  const { track } = useAnalytics();

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price') {
      return a.price - b.price;
    }
    return a.provider.localeCompare(b.provider);
  });

  const lowestPrice = Math.min(...listings.map((l) => l.price));

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg md:text-xl font-semibold text-white">Market Listings</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'provider')}
            className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600 focus:outline-none focus:border-primary-500"
          >
            <option value="price">Price</option>
            <option value="provider">Provider</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {sortedListings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No listings available</div>
        ) : (
          sortedListings.map((listing, index) => (
            <div
              key={`${listing.provider}-${index}`}
              className={`border rounded-lg p-4 transition-all hover:border-primary-500 ${
                listing.price === lowestPrice
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{listing.provider}</span>
                    {listing.price === lowestPrice && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        Best Price
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span>Qty: {listing.availableQuantity}</span>
                    <span>Updated {formatRelativeTime(listing.lastUpdated)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(listing.price, listing.currency)}
                    </div>
                  </div>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (skinId) {
                        track({
                          skinId,
                          action: 'click_market_listing',
                          metadata: {
                            provider: listing.provider,
                            price: listing.price,
                            currency: listing.currency,
                          },
                        });
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Prices are updated in real-time from multiple marketplaces. Click &quot;View&quot; to visit the provider&apos;s website.
      </div>
    </div>
  );
};
