'use client'

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { SupplyDemandPoint } from '@/lib/types'

type SupplyDemandChartProps = {
  data: SupplyDemandPoint[]
}

export default function SupplyDemandChart({ data }: SupplyDemandChartProps) {
  const formatted = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    supply: Math.round(point.supply),
    demand: Math.round(point.demand),
  }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Supply vs Demand</h2>
        <span className="text-sm text-slate-600 dark:text-slate-400">Live order flow</span>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#94a3b8' }} />
            <YAxis tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number, key: string) => [`${value.toLocaleString()}`, key === 'supply' ? 'Supply' : 'Demand']}
            />
            <Area type="monotone" dataKey="supply" stroke="#3b82f6" fill="url(#colorSupply)" strokeWidth={2} />
            <Area type="monotone" dataKey="demand" stroke="#f97316" fill="url(#colorDemand)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
