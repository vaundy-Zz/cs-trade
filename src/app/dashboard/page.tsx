"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/market", fetcher, {
    refreshInterval: 30000,
  });

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
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Skins",
      value: data?.skins?.length || 0,
      icon: Activity,
      trend: "+12%",
      positive: true,
    },
    {
      title: "Active Markets",
      value: data?.markets?.length || 0,
      icon: DollarSign,
      trend: "+5%",
      positive: true,
    },
    {
      title: "Avg Price",
      value: "$" + (data?.recentPrices?.[0]?.price || 0),
      icon: TrendingUp,
      trend: "+8%",
      positive: true,
    },
    {
      title: "Recent Updates",
      value: data?.recentPrices?.length || 0,
      icon: TrendingDown,
      trend: "-3%",
      positive: false,
    },
  ];

  const chartData =
    data?.recentPrices
      ?.slice(0, 10)
      .map(
        (item: { listing?: { skin?: { name?: string } }; price?: number }) => ({
          name: item.listing?.skin?.name?.substring(0, 20) || "Unknown",
          price: Number(item.price || 0),
        })
      ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Market Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of CS skins market data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span
                  className={`text-xs font-medium ${
                    stat.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Prices</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="price" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Popular Skins</h2>
          <div className="space-y-4">
            {data?.skins
              ?.slice(0, 5)
              .map(
                (skin: {
                  id: string;
                  name: string;
                  category?: string;
                  listings?: { price?: number }[];
                  rarityTier?: { label?: string };
                }) => (
                  <div
                    key={skin.id}
                    className="flex items-center justify-between p-3 rounded-md bg-accent/50"
                  >
                    <div>
                      <p className="font-medium">{skin.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {skin.category || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${skin.listings?.[0]?.price || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {skin.rarityTier?.label || "Common"}
                      </p>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
