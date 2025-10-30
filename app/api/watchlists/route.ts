import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const watchlists = await prisma.watchlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(watchlists);
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, items } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        items: items?.length
          ? {
              create: items.map((item: any) => ({
                itemType: item.itemType,
                itemId: item.itemId,
                itemName: item.itemName,
                notes: item.notes,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(watchlist, { status: 201 });
  } catch (error) {
    console.error("Error creating watchlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
