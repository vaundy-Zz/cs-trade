import cron from "node-cron";
import { getEnv } from "@/config/env";
import { ingestMarketData } from "@/ingestion/pipeline";
import { logger } from "@/observability/logger";

let scheduledTask: cron.ScheduledTask | null = null;

export const startScheduler = () => {
  const env = getEnv();
  const expression = env.INGESTION_CRON_EXPRESSION;

  if (!cron.validate(expression)) {
    logger.error({ expression }, "Invalid cron expression");
    throw new Error(`Invalid cron expression: ${expression}`);
  }

  if (scheduledTask) {
    logger.warn("Scheduler already running, stopping existing task");
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule(expression, async () => {
    logger.info("Scheduled ingestion triggered");

    try {
      await ingestMarketData({ trigger: "cron" });
    } catch (error) {
      logger.error({ error }, "Scheduled ingestion failed");
    }
  });

  logger.info({ expression }, "Scheduler started");
};

export const stopScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    logger.info("Scheduler stopped");
  }
};
