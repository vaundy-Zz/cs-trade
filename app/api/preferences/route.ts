import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { theme, notifications, emailAlerts } = body;

    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        theme: theme || "light",
        notifications: notifications ?? true,
        emailAlerts: emailAlerts ?? false,
      },
      update: {
        theme,
        notifications,
        emailAlerts,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
