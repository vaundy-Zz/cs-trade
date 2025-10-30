import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
}: StatCardProps) {
  return (
    <Card role="group" aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          id={title.replace(/\s+/g, "-").toLowerCase()}
          className="text-sm font-medium"
        >
          {title}
        </CardTitle>
        {Icon ? (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" aria-label={`${title}: ${value}`}>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            value
          )}
        </div>
        {trend || description ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {trend ? (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
                aria-label={`${trend.isPositive ? "Up" : "Down"} ${Math.abs(
                  trend.value
                )}%`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            ) : null}
            {description}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
