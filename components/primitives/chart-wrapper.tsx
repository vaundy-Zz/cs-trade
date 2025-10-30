import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  title: string;
  description?: string;
  trend?: "up" | "down" | "stable";
  trendLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartWrapper({
  title,
  description,
  trend,
  trendLabel,
  children,
  footer,
}: ChartWrapperProps) {
  const trendStyles = {
    up: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    down: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    stable:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  } as const;

  return (
    <Card role="group" aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle
            id={title.replace(/\s+/g, "-").toLowerCase()}
            className="text-base font-semibold"
          >
            {title}
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {trend && trendLabel ? (
          <Badge className={cn("capitalize", trendStyles[trend])}>{trendLabel}</Badge>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative h-64 w-full rounded-lg border border-dashed border-muted-foreground/40 p-4">
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            {children}
          </div>
        </div>
        {footer}
      </CardContent>
    </Card>
  );
}
