import { logger } from "./logger";

export type MetricType = "counter" | "gauge" | "histogram";
export type Severity = "info" | "warning" | "critical";

interface BaseMetric {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string | number>;
}

interface CounterMetric extends BaseMetric {
  type: "counter";
}

interface GaugeMetric extends BaseMetric {
  type: "gauge";
}

interface HistogramMetric extends BaseMetric {
  type: "histogram";
  buckets?: number[];
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private maxHistorySize = 1000;

  record(metric: Metric): void {
    const key = this.getMetricKey(metric.name, metric.labels);
    const history = this.metrics.get(key) ?? [];
    history.push(metric);

    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    this.metrics.set(key, history);

    logger.debug(
      {
        metric: metric.name,
        type: metric.type,
        value: metric.value,
        labels: metric.labels
      },
      "Metric recorded"
    );
  }

  counter(name: string, value: number = 1, labels?: Record<string, string | number>): void {
    this.record({
      type: "counter",
      name,
      value,
      timestamp: new Date(),
      labels
    });
  }

  gauge(name: string, value: number, labels?: Record<string, string | number>): void {
    this.record({
      type: "gauge",
      name,
      value,
      timestamp: new Date(),
      labels
    });
  }

  histogram(name: string, value: number, labels?: Record<string, string | number>, buckets?: number[]): void {
    this.record({
      type: "histogram",
      name,
      value,
      timestamp: new Date(),
      labels,
      buckets
    });
  }

  getMetrics(name?: string): Metric[] {
    if (!name) {
      return Array.from(this.metrics.values()).flat();
    }

    const results: Metric[] = [];
    for (const [key, history] of this.metrics.entries()) {
      if (key.startsWith(`${name}:`)) {
        results.push(...history);
      }
    }

    return results;
  }

  getAggregates(name: string): { count: number; sum: number; avg: number; min: number; max: number } | null {
    const metrics = this.getMetrics(name);

    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  clear(): void {
    this.metrics.clear();
  }

  private getMetricKey(name: string, labels?: Record<string, string | number>): string {
    if (!labels) {
      return `${name}:`;
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(",");

    return `${name}:${labelStr}`;
  }
}

export const metrics = new MetricsCollector();

export const trackIngestionDuration = async <T>(
  market: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    metrics.histogram("ingestion_duration_ms", duration, { market, status: "success" });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.histogram("ingestion_duration_ms", duration, { market, status: "error" });
    throw error;
  }
};
