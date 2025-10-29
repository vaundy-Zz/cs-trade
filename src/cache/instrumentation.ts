import { CacheMetrics } from '../types';

export interface OperationDurations {
  hits: number[];
  misses: number[];
  sets: number[];
  deletes: number[];
  errors: number[];
}

type Operation = keyof OperationDurations;

type MetricsState = Record<string, {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  durations: OperationDurations;
}>;

const initialOperationDurations = (): OperationDurations => ({
  hits: [],
  misses: [],
  sets: [],
  deletes: [],
  errors: [],
});

export class CacheInstrumentation {
  private readonly metrics: MetricsState = {};

  private ensureNamespace(namespace: string): void {
    if (!this.metrics[namespace]) {
      this.metrics[namespace] = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        hitRate: 0,
        durations: initialOperationDurations(),
      };
    }
  }

  recordHit(namespace: string, latencyMs: number): void {
    this.ensureNamespace(namespace);
    this.metrics[namespace].hits += 1;
    this.metrics[namespace].durations.hits.push(latencyMs);
    this.updateHitRate(namespace);
  }

  recordMiss(namespace: string, latencyMs: number): void {
    this.ensureNamespace(namespace);
    this.metrics[namespace].misses += 1;
    this.metrics[namespace].durations.misses.push(latencyMs);
    this.updateHitRate(namespace);
  }

  recordSet(namespace: string, latencyMs: number, count = 1): void {
    this.ensureNamespace(namespace);
    this.metrics[namespace].sets += count;
    this.metrics[namespace].durations.sets.push(latencyMs);
  }

  recordDelete(namespace: string, latencyMs: number, count = 1): void {
    this.ensureNamespace(namespace);
    this.metrics[namespace].deletes += count;
    this.metrics[namespace].durations.deletes.push(latencyMs);
  }

  incrementError(namespace?: string, latencyMs?: number): void {
    if (namespace) {
      this.ensureNamespace(namespace);
      this.metrics[namespace].errors += 1;
      if (latencyMs !== undefined) {
        this.metrics[namespace].durations.errors.push(latencyMs);
      }
    }
  }

  snapshot(): Record<string, CacheMetrics> {
    return Object.entries(this.metrics).reduce<Record<string, CacheMetrics>>((acc, [namespace, metrics]) => {
      acc[namespace] = {
        hits: metrics.hits,
        misses: metrics.misses,
        sets: metrics.sets,
        deletes: metrics.deletes,
        errors: metrics.errors,
        hitRate: metrics.hitRate,
      };

      return acc;
    }, {});
  }

  private updateHitRate(namespace: string): void {
    const namespaceMetrics = this.metrics[namespace];
    const total = namespaceMetrics.hits + namespaceMetrics.misses;
    namespaceMetrics.hitRate = total === 0 ? 0 : namespaceMetrics.hits / total;
  }
}
