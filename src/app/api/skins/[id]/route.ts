import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache/redis";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: skinId } = await params;
    const cacheKey = CACHE_KEYS.SKIN_DETAILS(skinId);
    const cached = await getCached<Record<string, unknown>>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const skin = await prisma.skin.findUnique({
      where: { id: skinId },
      include: {
        rarityTier: true,
        listings: {
          include: {
            market: true,
            priceSnapshots: {
              orderBy: { capturedAt: "desc" },
              take: 100,
            },
            priceSeries: {
              where: { interval: "DAILY" },
              orderBy: { bucketStart: "desc" },
              take: 30,
            },
          },
        },
      },
    });

    if (!skin) {
      return NextResponse.json({ error: "Skin not found" }, { status: 404 });
    }

    await setCached(cacheKey, skin, CACHE_TTL.MEDIUM);

    return NextResponse.json(skin);
  } catch (error) {
    console.error("Error fetching skin details:", error);
    return NextResponse.json(
      { error: "Failed to fetch skin details" },
      { status: 500 }
    );
  }
}
