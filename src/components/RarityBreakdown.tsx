'use client';

import React from 'react';
import type { SkinDetailData } from '../types/skin';

interface RarityBreakdownProps {
  rarity: SkinDetailData['skin']['rarity'];
  comparableSkins: SkinDetailData['comparableSkins'];
}

const rarityColors: Record<string, string> = {
  Consumer: 'text-gray-300 bg-gray-800',
  Industrial: 'text-blue-300 bg-blue-900',
  'Mil-Spec': 'text-indigo-300 bg-indigo-900',
  Restricted: 'text-purple-300 bg-purple-900',
  Classified: 'text-pink-300 bg-pink-900',
  Covert: 'text-red-300 bg-red-900',
  Contraband: 'text-orange-300 bg-orange-900',
};

export const RarityBreakdown: React.FC<RarityBreakdownProps> = ({ rarity, comparableSkins }) => {
  const rarityCount = comparableSkins.reduce<Record<string, number>>((acc, skin) => {
    acc[skin.rarity] = (acc[skin.rarity] || 0) + 1;
    return acc;
  }, { [rarity]: 1 });

  const total = Object.values(rarityCount).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Rarity Breakdown</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Primary Rarity</span>
          <span className={`font-semibold ${rarityColors[rarity] ?? 'text-white bg-gray-700'} px-3 py-1 rounded-full text-sm`}>
            {rarity}
          </span>
        </div>

        <div className="space-y-3">
          {Object.entries(rarityCount)
            .sort((a, b) => b[1] - a[1])
            .map(([rarityName, count]) => {
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={rarityName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{rarityName}</span>
                    <span className="text-gray-400">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`${rarityColors[rarityName] ?? 'bg-gray-500'} h-full rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        <div className="text-xs text-gray-500">
          Rarity distribution is calculated based on comparable skins and current item classification.
        </div>
      </div>
    </div>
  );
};
