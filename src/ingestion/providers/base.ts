import {
  MarketSnapshotPayload,
  MarketAggregatePayload,
  MarketComparisonPayload,
  MarketROIPayload
} from "../types";

export interface MarketDataProvider {
  name: string;

  fetchSnapshots(symbols: string[]): Promise<MarketSnapshotPayload[]>;

  fetchAggregates(
    symbols: string[],
    granularity: "HOURLY" | "DAILY" | "WEEKLY",
    startDate: Date,
    endDate: Date
  ): Promise<MarketAggregatePayload[]>;

  fetchComparisons(symbolPairs: [string, string][]): Promise<MarketComparisonPayload[]>;

  fetchROIStats(
    symbols: string[],
    window: "ONE_HOUR" | "TWENTY_FOUR_HOUR" | "SEVEN_DAY" | "THIRTY_DAY"
  ): Promise<MarketROIPayload[]>;
}
