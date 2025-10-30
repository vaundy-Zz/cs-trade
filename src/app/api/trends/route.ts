import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache/redis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get("interval") || "DAILY";
    const days = parseInt(searchParams.get("days") || "30");

    const cacheKey = `${CACHE_KEYS.TRENDS}:${interval}:${days}`;
    const cached = await getCached<Record<string, unknown>>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const priceSeries = await prisma.priceSeries.findMany({
      where: {
        interval: interval as
          | "HOURLY"
          | "FOUR_HOURLY"
          | "DAILY"
          | "WEEKLY"
          | "BIWEEKLY"
          | "MONTHLY"
          | "QUARTERLY",
        bucketStart: {
          gte: startDate,
        },
      },
      include: {
        listing: {
          include: {
            skin: {
              include: {
                rarityTier: true,
              },
            },
            market: true,
          },
        },
      },
      orderBy: { bucketStart: "asc" },
    });

    const data = {
      series: priceSeries,
      interval,
      days,
      timestamp: new Date().toISOString(),
    };

    await setCached(cacheKey, data, CACHE_TTL.MEDIUM);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching trends data:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends data" },
      { status: 500 }
    );
  }
}
