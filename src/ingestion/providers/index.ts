import { MarketDataProvider } from "./base";
import { mockProvider } from "./mock";
import { getEnv } from "@/config/env";
import { logger } from "@/observability/logger";

export * from "./base";

export const getProvider = (): MarketDataProvider => {
  const env = getEnv();
  const providerName = env.INGESTION_PROVIDER;

  switch (providerName) {
    case "mock":
      logger.info({ provider: "mock" }, "Using mock market data provider");
      return mockProvider;
    case "coingecko":
      throw new Error("CoinGecko provider not yet implemented");
    default:
      logger.warn({ provider: providerName }, "Unknown provider, defaulting to mock");
      return mockProvider;
  }
};
