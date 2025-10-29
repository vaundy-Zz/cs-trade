import { NextRequest, NextResponse } from "next/server";
import { ingestMarketData } from "@/ingestion/pipeline";
import { logger } from "@/observability/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const symbols = body.symbols ?? undefined;

    logger.info({ trigger: "manual", symbols }, "Received manual ingestion request");

    const result = await ingestMarketData({ trigger: "manual", symbols });

    return NextResponse.json(
      {
        status: "success",
        result
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, "Manual ingestion request failed");

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ready",
      message: "Use POST to trigger manual data ingestion"
    },
    { status: 200 }
  );
}
