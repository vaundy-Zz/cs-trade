import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache/redis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "price_growth";
    const limit = parseInt(searchParams.get("limit") || "50");

    const cacheKey = CACHE_KEYS.LEADERBOARDS(type);
    const cached = await getCached<Record<string, unknown>>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    let leaderboardData;

    if (type === "price_growth") {
      const skinMarkets = await prisma.skinMarket.findMany({
        where: {
          isActive: true,
        },
        include: {
          skin: {
            include: {
              rarityTier: true,
            },
          },
          market: true,
          priceSeries: {
            where: {
              interval: "DAILY",
            },
            orderBy: {
              bucketStart: "desc",
            },
            take: 30,
          },
        },
        take: limit,
      });

      leaderboardData = skinMarkets
        .map((sm) => {
          const series = sm.priceSeries;
          if (series.length < 2) return null;

          const latestPrice = series[0]?.close || 0;
          const oldestPrice = series[series.length - 1]?.open || 1;
          const growth =
            ((Number(latestPrice) - Number(oldestPrice)) /
              Number(oldestPrice)) *
            100;

          return {
            skin: sm.skin,
            market: sm.market,
            currentPrice: latestPrice,
            growth,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (b?.growth || 0) - (a?.growth || 0));
    } else if (type === "volume") {
      const snapshots = await prisma.priceSnapshot.findMany({
        where: {
          volume: { not: null },
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
        orderBy: {
          volume: "desc",
        },
        take: limit,
      });

      leaderboardData = snapshots.map((snapshot) => ({
        skin: snapshot.listing.skin,
        market: snapshot.listing.market,
        volume: snapshot.volume,
        price: snapshot.price,
        capturedAt: snapshot.capturedAt,
      }));
    } else {
      return NextResponse.json(
        { error: "Invalid leaderboard type" },
        { status: 400 }
      );
    }

    const data = {
      type,
      items: leaderboardData,
      timestamp: new Date().toISOString(),
    };

    await setCached(cacheKey, data, CACHE_TTL.LONG);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboards" },
      { status: 500 }
    );
  }
}
