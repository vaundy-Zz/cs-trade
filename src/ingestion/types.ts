export interface MarketIdentifier {
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  assetType?: string;
}

export interface MarketSnapshotPayload {
  market: MarketIdentifier;
  price: number;
  volume: number;
  volatility: number;
  capturedAt: Date;
  dataSource: string;
  roi1hPercent: number;
  roi24hPercent: number;
  roi7dPercent: number;
}

export interface MarketAggregatePayload {
  market: MarketIdentifier;
  granularity: "HOURLY" | "DAILY" | "WEEKLY";
  windowStart: Date;
  windowEnd: Date;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  averagePrice: number;
  volume: number;
  volatility: number;
  priceChangePct: number;
  dataSource: string;
}

export interface MarketComparisonPayload {
  baseMarket: MarketIdentifier;
  quoteMarket: MarketIdentifier;
  capturedAt: Date;
  priceRatio: number;
  volumeRatio: number;
  roiSpreadPct: number;
  dataSource: string;
}

export interface MarketROIPayload {
  market: MarketIdentifier;
  window: "ONE_HOUR" | "TWENTY_FOUR_HOUR" | "SEVEN_DAY" | "THIRTY_DAY";
  capturedAt: Date;
  roiPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPct: number;
  dataSource: string;
}

export interface IngestionResult {
  marketsIngested: number;
  snapshotsIngested: number;
  aggregatesIngested: number;
  comparisonsIngested: number;
  roiStatsIngested: number;
  startedAt: Date;
  completedAt: Date;
  trigger: "manual" | "cron" | "retry";
}
