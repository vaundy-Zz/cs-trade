import * as React from "react";
import { ChartWrapper } from "@/components/primitives/chart-wrapper";
import { LoadingStats } from "@/components/primitives/loading-card";
import { BarChart2, PieChart, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into your product performance.
        </p>
      </div>

      <React.Suspense fallback={<LoadingStats />}>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChartWrapper
            title="User Engagement"
            description="Weekly engagement metrics"
            trend="up"
            trendLabel="+5.2%"
          >
            <BarChart2 className="h-8 w-8" aria-hidden="true" />
            <p>Chart visualization</p>
          </ChartWrapper>

          <ChartWrapper
            title="Conversion Funnel"
            description="Current conversion breakdown"
            trend="stable"
            trendLabel="0%"
          >
            <PieChart className="h-8 w-8" aria-hidden="true" />
            <p>Funnel visualization</p>
          </ChartWrapper>

          <ChartWrapper
            title="Revenue Trend"
            description="Monthly revenue patterns"
            trend="up"
            trendLabel="+12.4%"
          >
            <TrendingUp className="h-8 w-8" aria-hidden="true" />
            <p>Trend line chart</p>
          </ChartWrapper>
        </section>
      </React.Suspense>
    </>
  );
}
