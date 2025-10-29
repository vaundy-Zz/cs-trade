import { ingestMarketData } from "../src/ingestion/pipeline";
import { logger } from "../src/observability/logger";

const main = async () => {
  try {
    logger.info("Starting manual data ingestion");
    const result = await ingestMarketData({ trigger: "manual" });
    logger.info({ result }, "Manual ingestion completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Manual ingestion failed");
    process.exit(1);
  }
};

main();
