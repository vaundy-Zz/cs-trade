import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

const serviceName = process.env.OTEL_SERVICE_NAME || 'optimized-nextjs-app';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    environment: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new FetchInstrumentation(),
  ],
});

if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

function parseHeaders(headers?: string) {
  if (!headers) return {};
  return headers.split(',').reduce<Record<string, string>>((acc, pair) => {
    const [key, value] = pair.split('=').map((part) => part.trim());
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function register() {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return;
  }

  sdk.start().catch((error) => {
    console.error('Error starting OpenTelemetry SDK', error);
  });

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
}
