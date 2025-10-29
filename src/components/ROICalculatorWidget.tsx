'use client';

import React from 'react';
import { useROICalculator } from '../hooks/useROICalculator';
import { useAnalytics } from '../context/AnalyticsContext';
import { formatCurrency } from '../utils/formatters';

interface ROICalculatorWidgetProps {
  currentPrice: number;
  currency?: string;
  skinId?: string;
}

export const ROICalculatorWidget: React.FC<ROICalculatorWidgetProps> = ({
  currentPrice,
  currency = 'USD',
  skinId,
}) => {
  const {
    calculation,
    purchasePrice,
    setPurchasePrice,
    purchaseDate,
    setPurchaseDate,
    calculate,
    reset,
  } = useROICalculator({ currentPrice });
  const { track } = useAnalytics();

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">ROI Calculator</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="purchasePrice" className="block text-sm text-gray-400 mb-2">
            Purchase Price
          </label>
          <input
            id="purchasePrice"
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice || ''}
            onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
            placeholder="Enter purchase price"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="purchaseDate" className="block text-sm text-gray-400 mb-2">
            Purchase Date
          </label>
          <input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              calculate();
              if (skinId && purchasePrice && purchaseDate) {
                track({
                  skinId,
                  action: 'roi_calculated',
                  metadata: {
                    purchasePrice,
                    purchaseDate,
                    currentPrice,
                  },
                });
              }
            }}
            disabled={!purchasePrice || !purchaseDate}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            Calculate ROI
          </button>
          {calculation && (
            <button
              onClick={() => {
                reset();
                if (skinId) {
                  track({ skinId, action: 'roi_reset' });
                }
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {calculation && (
          <div className="mt-6 space-y-3 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Purchase Price</span>
              <span className="text-white font-semibold">
                {formatCurrency(calculation.purchasePrice, currency)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Price</span>
              <span className="text-white font-semibold">
                {formatCurrency(calculation.currentPrice, currency)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Profit/Loss</span>
              <span
                className={`font-semibold ${
                  calculation.profit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {calculation.profit >= 0 ? '+' : ''}
                {formatCurrency(calculation.profit, currency)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">ROI</span>
              <span
                className={`text-xl font-bold ${
                  calculation.roi >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {calculation.roi >= 0 ? '+' : ''}
                {calculation.roi.toFixed(2)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Holding Period</span>
              <span className="text-white">{calculation.holdingDays} days</span>
            </div>

            {calculation.holdingDays > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Daily Return</span>
                <span className="text-gray-300">
                  {(calculation.roi / calculation.holdingDays).toFixed(3)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
