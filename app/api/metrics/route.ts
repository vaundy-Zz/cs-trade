import { NextResponse } from "next/server";
import { metrics } from "@/observability/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const allMetrics = metrics.getMetrics();

  const body = JSON.stringify(
    allMetrics.map((metric) => ({
      ...metric,
      timestamp: metric.timestamp.toISOString()
    })),
    null,
    2
  );

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
