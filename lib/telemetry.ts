import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer(process.env.OTEL_SERVICE_NAME || 'optimized-nextjs-app');

export function withSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const span = tracer.startSpan(name);
  
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
}
