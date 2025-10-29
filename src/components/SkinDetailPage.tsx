'use client';

import React, { useEffect } from 'react';
import { useSkinDetails } from '../hooks/useSkinDetails';
import { useAnalytics } from '../context/AnalyticsContext';
import { SkinViewer3D } from './SkinViewer3D';
import { WearFloatDisplay } from './WearFloatDisplay';
import { RarityBreakdown } from './RarityBreakdown';
import { MarketListings } from './MarketListings';
import { HistoricalPerformance } from './HistoricalPerformance';
import { ROICalculatorWidget } from './ROICalculatorWidget';
import { ComparableSkins } from './ComparableSkins';
import { WatchlistButton } from './WatchlistButton';

interface SkinDetailPageProps {
  skinId: string;
}

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-gray-800 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-96 bg-gray-800 rounded-lg"></div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-800 rounded-lg"></div>
            <div className="h-48 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Skin Details</h2>
        <p className="text-gray-400 mb-6">{error.message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export const SkinDetailPage: React.FC<SkinDetailPageProps> = ({ skinId }) => {
  const { data, isLoading, error, refetch } = useSkinDetails(skinId);
  const { track } = useAnalytics();

  useEffect(() => {
    if (data) {
      track({ skinId, action: 'view_skin_details' });
    }
  }, [skinId, data, track]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  if (!data) {
    return null;
  }

  const { skin, wearData, marketListings, priceHistory, performanceMetrics, comparableSkins } = data;
  const currentPrice = marketListings.length > 0 ? Math.min(...marketListings.map(l => l.price)) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400 uppercase mb-1">{skin.weapon}</p>
              <h1 className="text-2xl md:text-4xl font-bold text-white">{skin.name}</h1>
              <p className="text-sm text-gray-400 mt-1">{skin.collection}</p>
            </div>
            <div className="flex items-center gap-3">
              <WatchlistButton skinId={skinId} skinName={skin.name} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <SkinViewer3D
              imageUrl={skin.imageUrl}
              skinName={skin.name}
              skinId={skinId}
            />
          </div>

          <div className="space-y-6">
            <WearFloatDisplay wearData={wearData} />
            <RarityBreakdown rarity={skin.rarity} comparableSkins={comparableSkins} />
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300 leading-relaxed">{skin.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MarketListings listings={marketListings} skinId={skinId} />
          </div>
          <div>
            <ROICalculatorWidget currentPrice={currentPrice} skinId={skinId} />
          </div>
        </div>

        <div className="mb-6">
          <HistoricalPerformance history={priceHistory} metrics={performanceMetrics} />
        </div>

        <div className="mb-6">
          <ComparableSkins items={comparableSkins} />
        </div>
      </div>
    </div>
  );
};
