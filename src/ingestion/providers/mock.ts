import { addMinutes } from "date-fns";
import { MarketDataProvider } from "./base";
import {
  MarketSnapshotPayload,
  MarketAggregatePayload,
  MarketComparisonPayload,
  MarketROIPayload
} from "@/ingestion/types";

const SYMBOL_METADATA: Record<string, { name: string; base: string; quote: string; type?: string }> = {
  "BTC-USD": { name: "Bitcoin", base: "BTC", quote: "USD", type: "crypto" },
  "ETH-USD": { name: "Ethereum", base: "ETH", quote: "USD", type: "crypto" },
  SPX: { name: "S&P 500", base: "SPX", quote: "USD", type: "equity" }
};

const ensureSymbolMetadata = (symbol: string) => {
  if (SYMBOL_METADATA[symbol]) {
    return SYMBOL_METADATA[symbol];
  }

  return {
    name: symbol,
    base: symbol.split("-")[0] ?? symbol,
    quote: symbol.split("-")[1] ?? "USD",
    type: "unknown"
  };
};

const randomWithin = (base: number, variationPercent: number): number => {
  const delta = base * (variationPercent / 100);
  return base + (Math.random() - 0.5) * 2 * delta;
};

const toROI = (priceChangePct: number) => priceChangePct;

export class MockMarketDataProvider implements MarketDataProvider {
  name = "mock";

  async fetchSnapshots(symbols: string[]): Promise<MarketSnapshotPayload[]> {
    const now = new Date();

    return symbols.map((symbol) => {
      const meta = ensureSymbolMetadata(symbol);
      const basePrice = symbol === "BTC-USD" ? 43000 : symbol === "ETH-USD" ? 2200 : 4500;
      const price = randomWithin(basePrice, 2);
      const volume = randomWithin(1_000_000, 25);
      const volatility = randomWithin(0.05, 10);

      const roi24h = randomWithin(2, 50);

      return {
        market: {
          symbol,
          name: meta.name,
          baseAsset: meta.base,
          quoteAsset: meta.quote,
          assetType: meta.type
        },
        price,
        volume,
        volatility,
        capturedAt: now,
        dataSource: this.name,
        roi1hPercent: randomWithin(1, 50),
        roi24hPercent: roi24h,
        roi7dPercent: roi24h * 3
      } satisfies MarketSnapshotPayload;
    });
  }

  async fetchAggregates(
    symbols: string[],
    granularity: "HOURLY" | "DAILY" | "WEEKLY",
    startDate: Date,
    endDate: Date
  ): Promise<MarketAggregatePayload[]> {
    const results: MarketAggregatePayload[] = [];
    const intervalMinutes = granularity === "HOURLY" ? 60 : granularity === "DAILY" ? 1440 : 10080;

    for (const symbol of symbols) {
      const meta = ensureSymbolMetadata(symbol);
      let cursor = new Date(startDate);

      while (cursor < endDate) {
        const windowStart = new Date(cursor);
        const windowEnd = addMinutes(cursor, intervalMinutes);
        const basePrice = symbol === "BTC-USD" ? 42000 : symbol === "ETH-USD" ? 2100 : 4400;
        const open = randomWithin(basePrice, 5);
        const close = randomWithin(open, 5);
        const high = Math.max(open, close) * randomWithin(1.02, 2);
        const low = Math.min(open, close) * randomWithin(0.98, 2);
        const avg = (open + close) / 2;
        const volume = randomWithin(1_500_000, 30);
        const volatility = randomWithin(0.04, 20);
        const priceChangePct = ((close - open) / open) * 100;

        results.push({
          market: {
            symbol,
            name: meta.name,
            baseAsset: meta.base,
            quoteAsset: meta.quote,
            assetType: meta.type
          },
          granularity,
          windowStart,
          windowEnd,
          openPrice: open,
          closePrice: close,
          highPrice: high,
          lowPrice: low,
          averagePrice: avg,
          volume,
          volatility,
          priceChangePct,
          dataSource: this.name
        });

        cursor = windowEnd;
      }
    }

    return results;
  }

  async fetchComparisons(symbolPairs: [string, string][]): Promise<MarketComparisonPayload[]> {
    const now = new Date();

    return symbolPairs.map(([baseSymbol, quoteSymbol]) => {
      const baseMeta = ensureSymbolMetadata(baseSymbol);
      const quoteMeta = ensureSymbolMetadata(quoteSymbol);

      const priceRatio = randomWithin(1, 10);
      const volumeRatio = randomWithin(1, 10);
      const roiSpreadPct = randomWithin(2, 30);

      return {
        baseMarket: {
          symbol: baseSymbol,
          name: baseMeta.name,
          baseAsset: baseMeta.base,
          quoteAsset: baseMeta.quote,
          assetType: baseMeta.type
        },
        quoteMarket: {
          symbol: quoteSymbol,
          name: quoteMeta.name,
          baseAsset: quoteMeta.base,
          quoteAsset: quoteMeta.quote,
          assetType: quoteMeta.type
        },
        capturedAt: now,
        priceRatio,
        volumeRatio,
        roiSpreadPct,
        dataSource: this.name
      };
    });
  }

  async fetchROIStats(
    symbols: string[],
    window: "ONE_HOUR" | "TWENTY_FOUR_HOUR" | "SEVEN_DAY" | "THIRTY_DAY"
  ): Promise<MarketROIPayload[]> {
    const windowMultiplier =
      window === "ONE_HOUR" ? 1 : window === "TWENTY_FOUR_HOUR" ? 24 : window === "SEVEN_DAY" ? 7 * 24 : 30 * 24;
    const now = new Date();

    return symbols.map((symbol) => {
      const meta = ensureSymbolMetadata(symbol);
      const roiPercent = randomWithin(5, windowMultiplier * 2);
      const sharpeRatio = randomWithin(1.5, 20);
      const sortinoRatio = randomWithin(1.2, 20);
      const maxDrawdownPct = randomWithin(15, 10);

      return {
        market: {
          symbol,
          name: meta.name,
          baseAsset: meta.base,
          quoteAsset: meta.quote,
          assetType: meta.type
        },
        window,
        capturedAt: now,
        roiPercent: toROI(roiPercent),
        sharpeRatio,
        sortinoRatio,
        maxDrawdownPct,
        dataSource: this.name
      };
    });
  }
}

export const mockProvider = new MockMarketDataProvider();
