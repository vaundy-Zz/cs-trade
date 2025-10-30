import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const watchlists = await prisma.watchlist.findMany({
      where: { userId: session.user.id },
      include: {
        entries: {
          include: {
            skin: {
              include: {
                rarityTier: true,
              },
            },
            listing: {
              include: {
                market: true,
                priceSnapshots: {
                  orderBy: { capturedAt: "desc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(watchlists);
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlists" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const watchlist = await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        name: body.name,
        slug: body.name.toLowerCase().replace(/\s+/g, "-"),
        description: body.description,
      },
    });

    return NextResponse.json(watchlist, { status: 201 });
  } catch (error) {
    console.error("Error creating watchlist:", error);
    return NextResponse.json(
      { error: "Failed to create watchlist" },
      { status: 500 }
    );
  }
}
