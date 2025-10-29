import { CacheInstrumentation } from '../src/cache/instrumentation';

describe('CacheInstrumentation', () => {
  let instrumentation: CacheInstrumentation;

  beforeEach(() => {
    instrumentation = new CacheInstrumentation();
  });

  it('should initialize with empty metrics', () => {
    const metrics = instrumentation.snapshot();
    expect(metrics).toEqual({});
  });

  it('should record hits', () => {
    instrumentation.recordHit('marketData', 1.5);
    instrumentation.recordHit('marketData', 2.0);

    const metrics = instrumentation.snapshot();
    expect(metrics.marketData.hits).toBe(2);
    expect(metrics.marketData.misses).toBe(0);
  });

  it('should record misses', () => {
    instrumentation.recordMiss('charts', 3.5);
    instrumentation.recordMiss('charts', 4.0);

    const metrics = instrumentation.snapshot();
    expect(metrics.charts.misses).toBe(2);
    expect(metrics.charts.hits).toBe(0);
  });

  it('should record sets', () => {
    instrumentation.recordSet('apiResponses', 0.5);
    instrumentation.recordSet('apiResponses', 0.8);
    instrumentation.recordSet('apiResponses', 1.2);

    const metrics = instrumentation.snapshot();
    expect(metrics.apiResponses.sets).toBe(3);
  });

  it('should record deletes', () => {
    instrumentation.recordDelete('userPreferences', 0.3);

    const metrics = instrumentation.snapshot();
    expect(metrics.userPreferences.deletes).toBe(1);
  });

  it('should calculate hit rate correctly', () => {
    instrumentation.recordHit('marketData', 1.0);
    instrumentation.recordHit('marketData', 1.0);
    instrumentation.recordMiss('marketData', 1.0);

    const metrics = instrumentation.snapshot();
    expect(metrics.marketData.hitRate).toBeCloseTo(2 / 3, 5);
  });

  it('should handle zero hits and misses', () => {
    instrumentation.recordSet('systemConfig', 1.0);

    const metrics = instrumentation.snapshot();
    expect(metrics.systemConfig.hitRate).toBe(0);
  });

  it('should track metrics across multiple namespaces', () => {
    instrumentation.recordHit('marketData', 1.0);
    instrumentation.recordMiss('marketData', 1.0);
    instrumentation.recordSet('charts', 2.0);
    instrumentation.recordDelete('apiResponses', 0.5);

    const metrics = instrumentation.snapshot();

    expect(metrics.marketData).toBeDefined();
    expect(metrics.charts).toBeDefined();
    expect(metrics.apiResponses).toBeDefined();
    expect(metrics.marketData.hitRate).toBe(0.5);
  });

  it('should increment errors', () => {
    instrumentation.incrementError('marketData', 5.0);
    instrumentation.incrementError('marketData');

    const metrics = instrumentation.snapshot();
    expect(metrics.marketData.errors).toBe(2);
  });

  it('should handle errors without namespace', () => {
    instrumentation.incrementError();
    const metrics = instrumentation.snapshot();
    expect(Object.keys(metrics).length).toBe(0);
  });
});
