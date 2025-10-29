import { logger } from "./logger";
import { getEnv } from "@/config/env";

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertPayload {
  severity: AlertSeverity;
  message: string;
  context?: Record<string, unknown>;
}

type WebhookResult = {
  ok: boolean;
  status: number;
  statusText: string;
  body?: unknown;
};

const shouldSendAlert = (severity: AlertSeverity): boolean => {
  const env = getEnv();
  const severityLevels: Record<AlertSeverity, number> = {
    info: 0,
    warning: 1,
    critical: 2
  };

  return severityLevels[severity] >= severityLevels[env.ALERT_MIN_SEVERITY];
};

const sendWebhookAlert = async (payload: AlertPayload): Promise<WebhookResult> => {
  const env = getEnv();

  if (!env.ALERT_WEBHOOK_URL) {
    return {
      ok: false,
      status: 0,
      statusText: "Webhook not configured"
    };
  }

  try {
    const response = await fetch(env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        severity: payload.severity,
        message: payload.message,
        context: payload.context ?? {},
        service: "market-data-ingestion",
        timestamp: new Date().toISOString()
      })
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    logger.error({ error }, "Failed to deliver alert webhook");
    return {
      ok: false,
      status: 500,
      statusText: "Exception"
    };
  }
};

export const raiseAlert = async (payload: AlertPayload): Promise<void> => {
  if (!shouldSendAlert(payload.severity)) {
    logger.debug({ payload }, "Alert suppressed by severity threshold");
    return;
  }

  logger.warn({ payload }, "Alert raised");
  const webhookResult = await sendWebhookAlert(payload);

  if (!webhookResult.ok) {
    logger.error({ webhookResult }, "Alert webhook delivery failed");
  }
};
