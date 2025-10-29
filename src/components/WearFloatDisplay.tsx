'use client';

import React from 'react';
import type { WearData, WearCondition } from '../types/skin';
import { formatFloat } from '../utils/formatters';

interface WearFloatDisplayProps {
  wearData: WearData;
}

const getWearConditionColor = (condition: WearCondition): string => {
  const colors: Record<WearCondition, string> = {
    'Factory New': 'text-green-400',
    'Minimal Wear': 'text-blue-400',
    'Field-Tested': 'text-yellow-400',
    'Well-Worn': 'text-orange-400',
    'Battle-Scarred': 'text-red-400',
  };
  return colors[condition];
};

export const WearFloatDisplay: React.FC<WearFloatDisplayProps> = ({ wearData }) => {
  const { condition, floatValue, minFloat, maxFloat, paintSeed, patternIndex } = wearData;
  const percentage = ((floatValue - minFloat) / (maxFloat - minFloat)) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Wear & Float</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Condition</span>
            <span className={`font-semibold ${getWearConditionColor(condition)}`}>
              {condition}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Float Value</span>
              <span className="text-white font-mono text-sm">{formatFloat(floatValue)}</span>
            </div>
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500 text-xs">{formatFloat(minFloat)}</span>
              <span className="text-gray-500 text-xs">{formatFloat(maxFloat)}</span>
            </div>
          </div>
        </div>

        {paintSeed !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Paint Seed</span>
            <span className="text-white font-mono text-sm">{paintSeed}</span>
          </div>
        )}

        {patternIndex !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Pattern Index</span>
            <span className="text-white font-mono text-sm">{patternIndex}</span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            <p>Lower float values indicate better condition</p>
          </div>
        </div>
      </div>
    </div>
  );
};
