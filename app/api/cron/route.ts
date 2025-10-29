import { NextRequest, NextResponse } from "next/server";
import { ingestMarketData } from "@/ingestion/pipeline";
import { logger } from "@/observability/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedAuth = process.env.CRON_SECRET;

    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      logger.warn("Unauthorized cron request");
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    logger.info("Received cron ingestion request");

    const result = await ingestMarketData({ trigger: "cron" });

    return NextResponse.json(
      {
        status: "success",
        result
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, "Cron ingestion request failed");

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
