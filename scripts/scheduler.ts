import { startScheduler } from "../src/scheduler/cron";
import { logger } from "../src/observability/logger";

logger.info("Bootstrapping ingestion scheduler");
startScheduler();
