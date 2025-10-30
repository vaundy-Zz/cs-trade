"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TrendsPage() {
  const [interval, setInterval] = useState("DAILY");
  const [days, setDays] = useState(30);

  const { data, error, isLoading } = useSWR(
    `/api/trends?interval=${interval}&days=${days}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const intervals = [
    { label: "Hourly", value: "HOURLY" },
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
  ];

  const dayOptions = [7, 14, 30, 60, 90];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Trends</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const chartData =
    data?.series?.reduce(
      (
        acc: Array<Record<string, string | number>>,
        item: {
          bucketStart: string;
          close?: number;
          listing?: { skin?: { name?: string } };
        }
      ) => {
        const existing = acc.find(
          (d) => d.date === format(new Date(item.bucketStart), "MMM dd")
        );

        if (existing) {
          existing[item.listing?.skin?.name || "Unknown"] = Number(item.close);
        } else {
          acc.push({
            date: format(new Date(item.bucketStart), "MMM dd"),
            [item.listing?.skin?.name || "Unknown"]: Number(item.close),
          });
        }

        return acc;
      },
      []
    ) || [];

  const skinNames = Array.from(
    new Set(
      data?.series
        ?.map(
          (s: { listing?: { skin?: { name?: string } } }) =>
            s.listing?.skin?.name
        )
        .filter(Boolean)
    )
  ).slice(0, 5);

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Market Trends</h1>
        <p className="text-muted-foreground">
          Historical price data and analytics
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {intervals.map((int) => (
            <Button
              key={int.value}
              variant={interval === int.value ? "default" : "outline"}
              size="sm"
              onClick={() => setInterval(int.value)}
            >
              {int.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {dayOptions.map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Price Trends</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {skinNames.map((name, index) => (
              <Line
                key={name as string}
                type="monotone"
                dataKey={name as string}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Total Data Points
            </p>
            <p className="text-2xl font-bold">{data?.series?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Interval</p>
            <p className="text-2xl font-bold">{interval}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Time Range</p>
            <p className="text-2xl font-bold">{days} days</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="text-sm font-medium">
              {data?.timestamp
                ? format(new Date(data.timestamp), "PPp")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
