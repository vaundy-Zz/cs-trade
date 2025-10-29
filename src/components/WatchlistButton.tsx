'use client';

import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAnalytics } from '../context/AnalyticsContext';

interface WatchlistButtonProps {
  skinId: string;
  skinName: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({ skinId, skinName }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { track } = useAnalytics();
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const inWatchlist = isInWatchlist(skinId);

  const handleAdd = () => {
    addToWatchlist(skinId, targetPrice || undefined, notes || undefined);
    track({ skinId, action: 'add_to_watchlist', metadata: { targetPrice, notes } });
    setShowModal(false);
    setTargetPrice(0);
    setNotes('');
  };

  const handleRemove = () => {
    removeFromWatchlist(skinId);
    track({ skinId, action: 'remove_from_watchlist' });
  };

  return (
    <>
      {inWatchlist ? (
        <button
          onClick={handleRemove}
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
          <span className="hidden sm:inline">Remove from Watchlist</span>
          <span className="sm:hidden">Remove</span>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add to Watchlist</span>
          <span className="sm:hidden">Watch</span>
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Add to Watchlist</h3>
            <p className="text-gray-300 mb-4">{skinName}</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="targetPrice" className="block text-sm text-gray-400 mb-2">
                  Target Price (optional)
                </label>
                <input
                  id="targetPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetPrice || ''}
                  onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Enter target price"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm text-gray-400 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTargetPrice(0);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
