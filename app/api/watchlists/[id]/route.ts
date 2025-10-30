import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, items } = body;

    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    if (existingWatchlist.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedWatchlist = await prisma.watchlist.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        items: items
          ? {
              deleteMany: {},
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

    return NextResponse.json(updatedWatchlist);
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        id,
      },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    if (existingWatchlist.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.watchlist.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Watchlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting watchlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
