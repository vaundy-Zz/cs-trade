'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PricePoint } from '@/lib/types'

type PriceChartProps = {
  data: PricePoint[]
  timeframe: string
}

export default function PriceChart({ data, timeframe }: PriceChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      price: Math.round(point.price * 100) / 100,
    }))
  }, [data])

  const minPrice = useMemo(() => Math.min(...chartData.map((d) => d.price)), [chartData])
  const maxPrice = useMemo(() => Math.max(...chartData.map((d) => d.price)), [chartData])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Price Movement</h2>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Price Trend ({timeframe})</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
              axisLine={{ stroke: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice * 0.99, maxPrice * 1.01]}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
              axisLine={{ stroke: '#94a3b8' }}
              tickFormatter={(value) => `$${Math.round(value)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
