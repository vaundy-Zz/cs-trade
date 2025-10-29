import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string({ required_error: "DATABASE_URL is required" })
    .url("DATABASE_URL must be a valid connection string"),
  REDIS_URL: z.string().optional(),
  INGESTION_PROVIDER: z
    .enum(["mock", "coingecko"], {
      invalid_type_error: "Valid provider values are 'mock' or 'coingecko'"
    })
    .default("mock"),
  INGESTION_MARKETS: z
    .string()
    .default("BTC-USD,ETH-USD,SPX"),
  INGESTION_CRON_EXPRESSION: z.string().default("*/15 * * * *"),
  INGESTION_LOOKBACK_DAYS: z.coerce.number().default(30),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  ALERT_WEBHOOK_URL: z.string().url().optional(),
  ALERT_MIN_SEVERITY: z
    .enum(["info", "warning", "critical"])
    .default("warning"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info")
});

type EnvSchema = z.infer<typeof envSchema>;

let memoizedEnv: EnvSchema | null = null;

export const getEnv = (): EnvSchema => {
  if (!memoizedEnv) {
    memoizedEnv = envSchema.parse({
      ...process.env,
      INGESTION_MARKETS: process.env.INGESTION_MARKETS ?? "BTC-USD,ETH-USD"
    });
  }

  return memoizedEnv;
};

export const getMarketList = (): string[] =>
  getEnv()
    .INGESTION_MARKETS.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
