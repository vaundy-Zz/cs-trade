"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Activity } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardsPage() {
  const [type, setType] = useState("price_growth");

  const { data, error, isLoading } = useSWR(
    `/api/leaderboards?type=${type}&limit=50`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const leaderboardTypes = [
    { label: "Price Growth", value: "price_growth", icon: TrendingUp },
    { label: "Volume", value: "volume", icon: Activity },
  ];

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
          <h2 className="text-2xl font-bold mb-2">
            Error Loading Leaderboards
          </h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground">
          Top performing skins across different metrics
        </p>
      </div>

      <div className="flex gap-2">
        {leaderboardTypes.map((lb) => {
          const Icon = lb.icon;
          return (
            <Button
              key={lb.value}
              variant={type === lb.value ? "default" : "outline"}
              size="sm"
              onClick={() => setType(lb.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {lb.label}
            </Button>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Skin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {type === "price_growth" ? "Growth %" : "Volume"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Current Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map(
                (
                  item: {
                    skin?: { name?: string; rarityTier?: { label?: string } };
                    market?: { name?: string };
                    growth?: number;
                    volume?: number;
                    currentPrice?: number;
                    price?: number;
                  },
                  index: number
                ) => (
                  <tr
                    key={index}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                        {index === 1 && (
                          <Trophy className="h-5 w-5 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Trophy className="h-5 w-5 text-amber-700" />
                        )}
                        <span className="font-medium">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{item.skin?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.skin?.rarityTier?.label || "Common"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.market?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {type === "price_growth" ? (
                        <span
                          className={`font-semibold ${
                            (item.growth || 0) > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.growth?.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="font-semibold">
                          {item.volume ? Number(item.volume).toFixed(2) : "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      $
                      {type === "price_growth"
                        ? Number(item.currentPrice || 0).toFixed(2)
                        : Number(item.price || 0).toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
