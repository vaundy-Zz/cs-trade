import { subDays } from "date-fns";
import prisma from "@/db/client";
import { getCache, invalidateCacheKeys } from "@/cache/cache";
import { getEnv, getMarketList } from "@/config/env";
import { getProvider } from "@/ingestion/providers";
import {
  IngestionResult,
  MarketAggregatePayload,
  MarketComparisonPayload,
  MarketROIPayload,
  MarketSnapshotPayload
} from "@/ingestion/types";
import { logger } from "@/observability/logger";
import { metrics, trackIngestionDuration } from "@/observability/metrics";
import { raiseAlert } from "@/observability/alerts";

interface PersistInput {
  snapshots: MarketSnapshotPayload[];
  aggregates: MarketAggregatePayload[];
  comparisons: MarketComparisonPayload[];
  roiStats: MarketROIPayload[];
}

type TriggerType = "manual" | "cron" | "retry";

type IngestionOptions = {
  trigger?: TriggerType;
  symbols?: string[];
};

type MarketIdMap = Map<string, number>;

type MarketDescriptor = {
  name: string;
  baseAsset: string;
  quoteAsset: string;
  assetType?: string;
  dataSource: string;
};

const ensureMarketsExist = async (descriptors: Map<string, MarketDescriptor>) => {
  for (const [symbol, descriptor] of descriptors.entries()) {
    await prisma.market.upsert({
      where: { symbol },
      update: {
        name: descriptor.name,
        baseAsset: descriptor.baseAsset,
        quoteAsset: descriptor.quoteAsset,
        assetType: descriptor.assetType,
        dataSource: descriptor.dataSource
      },
      create: {
        symbol,
        name: descriptor.name,
        baseAsset: descriptor.baseAsset,
        quoteAsset: descriptor.quoteAsset,
        assetType: descriptor.assetType,
        dataSource: descriptor.dataSource
      }
    });
  }
};

const buildMarketMap = async (symbols: string[]): Promise<MarketIdMap> => {
  const markets = await prisma.market.findMany({ where: { symbol: { in: symbols } } });
  const map: MarketIdMap = new Map();

  markets.forEach((market) => {
    map.set(market.symbol, market.id);
  });

  return map;
};

const persistSnapshots = async (snapshots: MarketSnapshotPayload[], marketMap: MarketIdMap) => {
  let count = 0;

  for (const snapshot of snapshots) {
    const marketId = marketMap.get(snapshot.market.symbol);

    if (!marketId) {
      logger.warn({ symbol: snapshot.market.symbol }, "Skipping snapshot: market missing");
      continue;
    }

    await prisma.marketSnapshot.upsert({
      where: {
        marketId_capturedAt: {
          marketId,
          capturedAt: snapshot.capturedAt
        }
      },
      update: {
        price: snapshot.price,
        volume: snapshot.volume,
        volatility: snapshot.volatility,
        dataSource: snapshot.dataSource,
        roi1hPercent: snapshot.roi1hPercent,
        roi24hPercent: snapshot.roi24hPercent,
        roi7dPercent: snapshot.roi7dPercent
      },
      create: {
        market: {
          connect: {
            id: marketId
          }
        },
        capturedAt: snapshot.capturedAt,
        price: snapshot.price,
        volume: snapshot.volume,
        volatility: snapshot.volatility,
        dataSource: snapshot.dataSource,
        roi1hPercent: snapshot.roi1hPercent,
        roi24hPercent: snapshot.roi24hPercent,
        roi7dPercent: snapshot.roi7dPercent
      }
    });

    count += 1;
  }

  return count;
};

const persistAggregates = async (aggregates: MarketAggregatePayload[], marketMap: MarketIdMap) => {
  let count = 0;

  for (const aggregate of aggregates) {
    const marketId = marketMap.get(aggregate.market.symbol);

    if (!marketId) {
      logger.warn({ symbol: aggregate.market.symbol }, "Skipping aggregate: market missing");
      continue;
    }

    await prisma.marketAggregate.upsert({
      where: {
        marketId_granularity_windowStart_windowEnd: {
          marketId,
          granularity: aggregate.granularity,
          windowStart: aggregate.windowStart,
          windowEnd: aggregate.windowEnd
        }
      },
      update: {
        openPrice: aggregate.openPrice,
        closePrice: aggregate.closePrice,
        highPrice: aggregate.highPrice,
        lowPrice: aggregate.lowPrice,
        averagePrice: aggregate.averagePrice,
        volume: aggregate.volume,
        volatility: aggregate.volatility,
        priceChangePct: aggregate.priceChangePct,
        dataSource: aggregate.dataSource
      },
      create: {
        market: {
          connect: {
            id: marketId
          }
        },
        granularity: aggregate.granularity,
        windowStart: aggregate.windowStart,
        windowEnd: aggregate.windowEnd,
        openPrice: aggregate.openPrice,
        closePrice: aggregate.closePrice,
        highPrice: aggregate.highPrice,
        lowPrice: aggregate.lowPrice,
        averagePrice: aggregate.averagePrice,
        volume: aggregate.volume,
        volatility: aggregate.volatility,
        priceChangePct: aggregate.priceChangePct,
        dataSource: aggregate.dataSource
      }
    });

    count += 1;
  }

  return count;
};

const persistComparisons = async (comparisons: MarketComparisonPayload[], marketMap: MarketIdMap) => {
  let count = 0;

  for (const comparison of comparisons) {
    const baseMarketId = marketMap.get(comparison.baseMarket.symbol);
    const quoteMarketId = marketMap.get(comparison.quoteMarket.symbol);

    if (!baseMarketId || !quoteMarketId) {
      logger.warn({ comparison }, "Skipping comparison: market missing");
      continue;
    }

    await prisma.marketComparison.upsert({
      where: {
        baseMarketId_quoteMarketId_capturedAt: {
          baseMarketId,
          quoteMarketId,
          capturedAt: comparison.capturedAt
        }
      },
      update: {
        priceRatio: comparison.priceRatio,
        volumeRatio: comparison.volumeRatio,
        roiSpreadPct: comparison.roiSpreadPct,
        dataSource: comparison.dataSource
      },
      create: {
        baseMarket: { connect: { id: baseMarketId } },
        quoteMarket: { connect: { id: quoteMarketId } },
        capturedAt: comparison.capturedAt,
        priceRatio: comparison.priceRatio,
        volumeRatio: comparison.volumeRatio,
        roiSpreadPct: comparison.roiSpreadPct,
        dataSource: comparison.dataSource
      }
    });

    count += 1;
  }

  return count;
};

const persistROIStats = async (roiStats: MarketROIPayload[], marketMap: MarketIdMap) => {
  let count = 0;

  for (const stat of roiStats) {
    const marketId = marketMap.get(stat.market.symbol);

    if (!marketId) {
      logger.warn({ symbol: stat.market.symbol }, "Skipping ROI stat: market missing");
      continue;
    }

    await prisma.marketROIStatistic.upsert({
      where: {
        marketId_window_capturedAt: {
          marketId,
          window: stat.window,
          capturedAt: stat.capturedAt
        }
      },
      update: {
        roiPercent: stat.roiPercent,
        sharpeRatio: stat.sharpeRatio,
        sortinoRatio: stat.sortinoRatio,
        maxDrawdownPct: stat.maxDrawdownPct,
        dataSource: stat.dataSource
      },
      create: {
        market: {
          connect: {
            id: marketId
          }
        },
        window: stat.window,
        capturedAt: stat.capturedAt,
        roiPercent: stat.roiPercent,
        sharpeRatio: stat.sharpeRatio,
        sortinoRatio: stat.sortinoRatio,
        maxDrawdownPct: stat.maxDrawdownPct,
        dataSource: stat.dataSource
      }
    });

    count += 1;
  }

  return count;
};

const persistData = async ({ snapshots, aggregates, comparisons, roiStats }: PersistInput) => {
  const descriptors = new Map<string, MarketDescriptor>();

  snapshots.forEach((s) => {
    descriptors.set(s.market.symbol, {
      name: s.market.name,
      baseAsset: s.market.baseAsset,
      quoteAsset: s.market.quoteAsset,
      assetType: s.market.assetType,
      dataSource: s.dataSource
    });
  });

  aggregates.forEach((a) => {
    if (!descriptors.has(a.market.symbol)) {
      descriptors.set(a.market.symbol, {
        name: a.market.name,
        baseAsset: a.market.baseAsset,
        quoteAsset: a.market.quoteAsset,
        assetType: a.market.assetType,
        dataSource: a.dataSource
      });
    }
  });

  comparisons.forEach((c) => {
    if (!descriptors.has(c.baseMarket.symbol)) {
      descriptors.set(c.baseMarket.symbol, {
        name: c.baseMarket.name,
        baseAsset: c.baseMarket.baseAsset,
        quoteAsset: c.baseMarket.quoteAsset,
        assetType: c.baseMarket.assetType,
        dataSource: c.dataSource
      });
    }

    if (!descriptors.has(c.quoteMarket.symbol)) {
      descriptors.set(c.quoteMarket.symbol, {
        name: c.quoteMarket.name,
        baseAsset: c.quoteMarket.baseAsset,
        quoteAsset: c.quoteMarket.quoteAsset,
        assetType: c.quoteMarket.assetType,
        dataSource: c.dataSource
      });
    }
  });

  roiStats.forEach((r) => {
    if (!descriptors.has(r.market.symbol)) {
      descriptors.set(r.market.symbol, {
        name: r.market.name,
        baseAsset: r.market.baseAsset,
        quoteAsset: r.market.quoteAsset,
        assetType: r.market.assetType,
        dataSource: r.dataSource
      });
    }
  });

  await ensureMarketsExist(descriptors);
  
  const symbols = Array.from(descriptors.keys());
  const marketMap = await buildMarketMap(symbols);

  const [snapshotCount, aggregateCount, comparisonCount, roiCount] = await Promise.all([
    persistSnapshots(snapshots, marketMap),
    persistAggregates(aggregates, marketMap),
    persistComparisons(comparisons, marketMap),
    persistROIStats(roiStats, marketMap)
  ]);

  return {
    snapshotCount,
    aggregateCount,
    comparisonCount,
    roiCount
  };
};

const refreshCaches = async (symbols: string[]) => {
  const env = getEnv();
  const cache = await getCache();

  await Promise.all(
    symbols.map(async (symbol) => {
      const latestSnapshot = await prisma.marketSnapshot.findFirst({
        where: { market: { symbol } },
        orderBy: { capturedAt: "desc" }
      });

      if (!latestSnapshot) {
        return;
      }

      await cache.set(
        `market:${symbol}:latest`,
        JSON.stringify(latestSnapshot),
        env.CACHE_TTL_SECONDS
      );
    })
  );

  await invalidateCacheKeys(["market:*:aggregates", "market:*:roi"]);
};

export const ingestMarketData = async (options: IngestionOptions = {}): Promise<IngestionResult> => {
  const env = getEnv();
  const provider = getProvider();
  const trigger: TriggerType = options.trigger ?? "manual";
  const symbols = options.symbols?.length ? options.symbols : getMarketList();
  const startedAt = new Date();

  logger.info({ symbols, trigger, provider: provider.name }, "Starting market data ingestion");

  return trackIngestionDuration("pipeline", async () => {
    try {
      const lookbackDays = env.INGESTION_LOOKBACK_DAYS;
      const lookbackStart = subDays(startedAt, lookbackDays);

      const [snapshots, hourlyAggregates, dailyAggregates, weeklyAggregates, comparisons, roi24hStats] =
        await Promise.all([
          provider.fetchSnapshots(symbols),
          provider.fetchAggregates(symbols, "HOURLY", lookbackStart, startedAt),
          provider.fetchAggregates(symbols, "DAILY", lookbackStart, startedAt),
          provider.fetchAggregates(symbols, "WEEKLY", lookbackStart, startedAt),
          provider.fetchComparisons(symbols.flatMap((s) => symbols.map((t) => [s, t] as [string, string])).filter(([s, t]) => s !== t)),
          provider.fetchROIStats(symbols, "TWENTY_FOUR_HOUR")
        ]);

      const aggregates = [...hourlyAggregates, ...dailyAggregates, ...weeklyAggregates];

      const result = await persistData({
        snapshots,
        aggregates,
        comparisons,
        roiStats: roi24hStats
      });

      await refreshCaches(symbols);

      const completedAt = new Date();

      metrics.counter("ingestion_success_total", 1, { trigger, provider: provider.name });

      logger.info(
        {
          trigger,
          provider: provider.name,
          durations: {
            totalMs: completedAt.getTime() - startedAt.getTime()
          },
          counts: result
        },
        "Market data ingestion completed"
      );

      return {
        marketsIngested: symbols.length,
        snapshotsIngested: result.snapshotCount,
        aggregatesIngested: result.aggregateCount,
        comparisonsIngested: result.comparisonCount,
        roiStatsIngested: result.roiCount,
        startedAt,
        completedAt,
        trigger
      } satisfies IngestionResult;
    } catch (error) {
      metrics.counter("ingestion_failure_total", 1, { trigger, provider: provider.name });

      await raiseAlert({
        severity: "critical",
        message: "Market data ingestion failed",
        context: {
          trigger,
          provider: provider.name,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      logger.error({ error }, "Market data ingestion failed");
      throw error;
    }
  });
};
