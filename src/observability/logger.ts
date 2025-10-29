import pino from "pino";

const LOG_LEVEL = (process.env.LOG_LEVEL as pino.LevelWithSilent) ?? "info";

export const logger = pino({
  level: LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "market-data-ingestion"
  },
  formatters: {
    level(label) {
      return { level: label };
    }
  }
});
