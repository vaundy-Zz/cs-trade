import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache/redis";

export async function GET() {
  try {
    const cacheKey = CACHE_KEYS.MARKET_SNAPSHOT;
    const cached = await getCached<Record<string, unknown>>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const [skins, markets, recentPrices] = await Promise.all([
      prisma.skin.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          rarityTier: true,
          listings: {
            take: 1,
            include: {
              market: true,
            },
          },
        },
      }),
      prisma.market.findMany({
        where: { isPrimary: true },
      }),
      prisma.priceSnapshot.findMany({
        take: 50,
        orderBy: { capturedAt: "desc" },
        include: {
          listing: {
            include: {
              skin: true,
              market: true,
            },
          },
        },
      }),
    ]);

    const data = {
      skins,
      markets,
      recentPrices,
      timestamp: new Date().toISOString(),
    };

    await setCached(cacheKey, data, CACHE_TTL.SHORT);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
