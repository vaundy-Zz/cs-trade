'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import type { PriceHistory, PerformanceMetrics } from '../types/skin';
import { formatCurrency, formatDate } from '../utils/formatters';

interface HistoricalPerformanceProps {
  history: PriceHistory[];
  metrics: PerformanceMetrics;
  currency?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm">
        <p className="text-white font-semibold mb-1">{formatDate(label)}</p>
        <p className="text-gray-300">
          Average: <span className="text-white">{formatCurrency(data.averagePrice)}</span>
        </p>
        <p className="text-gray-300">
          Low: <span className="text-red-400">{formatCurrency(data.lowestPrice)}</span>
        </p>
        <p className="text-gray-300">
          High: <span className="text-green-400">{formatCurrency(data.highestPrice)}</span>
        </p>
        <p className="text-gray-400 text-xs mt-2">Volume: {data.volume}</p>
      </div>
    );
  }
  return null;
};

export const HistoricalPerformance: React.FC<HistoricalPerformanceProps> = ({ history, metrics, currency = 'USD' }) => {
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-white">Historical Performance</h3>
          <p className="text-sm text-gray-400">Price trends and trading volume over time.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-300">
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/60">
            <p className="text-gray-400 text-xs uppercase">7 Day Change</p>
            <p className={`text-lg font-semibold ${metrics.last7Days.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.last7Days.priceChange)}
            </p>
            <p className="text-xs text-gray-500">{metrics.last7Days.percentageChange.toFixed(2)}%</p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/60">
            <p className="text-gray-400 text-xs uppercase">30 Day Change</p>
            <p className={`text-lg font-semibold ${metrics.last30Days.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.last30Days.priceChange)}
            </p>
            <p className="text-xs text-gray-500">{metrics.last30Days.percentageChange.toFixed(2)}%</p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/60">
            <p className="text-gray-400 text-xs uppercase">All-Time Range</p>
            <p className="text-sm text-gray-300">
              {formatCurrency(metrics.allTime.lowestPrice)} - {formatCurrency(metrics.allTime.highestPrice)}
            </p>
            <p className="text-xs text-gray-500">Avg {formatCurrency(metrics.allTime.averagePrice)}</p>
          </div>
        </div>
      </div>

      <div className="w-full h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedHistory}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value, currency)} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="averagePrice" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPrice)" />
            <Line type="monotone" dataKey="lowestPrice" stroke="#F87171" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="highestPrice" stroke="#34D399" strokeWidth={1} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
