"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cardData } from "@/data/sample-chart";

export function SampleChart() {
  return (
    <div className="h-64 w-full max-w-3xl rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-left text-lg font-semibold">
        Weekly Trading Volume
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cardData}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="day"
            className="text-xs text-muted-foreground"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs text-muted-foreground"
            stroke="currentColor"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorVolume)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
