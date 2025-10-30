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

    const alerts = await prisma.alert.findMany({
      where: { userId: session.user.id },
      include: {
        skin: true,
        listing: {
          include: {
            market: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
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

    const alert = await prisma.alert.create({
      data: {
        userId: session.user.id,
        skinId: body.skinId,
        skinMarketId: body.skinMarketId,
        type: body.type,
        condition: body.condition,
        targetValue: body.targetValue,
        changePercent: body.changePercent,
        lookbackWindow: body.lookbackWindow,
        deliveryChannel: body.deliveryChannel || "email",
      },
      include: {
        skin: true,
        listing: true,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
