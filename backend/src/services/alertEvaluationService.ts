import { PrismaClient, AlertDefinition, ConditionOperator } from '@prisma/client';
import { getMarketData } from './marketDataService';
import { sendNotification } from './notificationService';

const prisma = new PrismaClient();

const DEDUPLICATION_WINDOW_MINUTES = 60;

export async function evaluateAlert(alert: AlertDefinition): Promise<boolean> {
  try {
    if (!alert.isActive) {
      return false;
    }

    const marketData = getMarketData(alert.symbol);

    let value: number;
    switch (alert.type) {
      case 'PRICE':
        value = marketData.price;
        break;
      case 'VOLATILITY':
        value = marketData.volatility;
        break;
      case 'ROI':
        value = marketData.roi;
        break;
      default:
        console.error(`Unknown alert type: ${alert.type}`);
        return false;
    }

    const conditionMet = evaluateCondition(value, alert.operator, alert.threshold);

    if (conditionMet) {
      const isDuplicate = await checkDuplicateTrigger(alert.id, alert.userId);
      
      if (!isDuplicate) {
        await createTrigger(alert, value);
        await sendAlertNotification(alert, value);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error evaluating alert ${alert.id}:`, error);
    return false;
  }
}

function evaluateCondition(
  value: number,
  operator: ConditionOperator,
  threshold: number
): boolean {
  switch (operator) {
    case 'ABOVE':
      return value > threshold;
    case 'BELOW':
      return value < threshold;
    case 'EQUALS':
      return Math.abs(value - threshold) < 0.01;
    case 'PERCENTAGE_CHANGE_UP':
      return value > 0 && value >= threshold;
    case 'PERCENTAGE_CHANGE_DOWN':
      return value < 0 && Math.abs(value) >= threshold;
    default:
      return false;
  }
}

async function checkDuplicateTrigger(
  alertId: string,
  userId: string
): Promise<boolean> {
  const windowStart = new Date(
    Date.now() - DEDUPLICATION_WINDOW_MINUTES * 60 * 1000
  );

  const recentTrigger = await prisma.alertTrigger.findFirst({
    where: {
      alertId,
      userId,
      triggeredAt: {
        gte: windowStart,
      },
    },
  });

  return recentTrigger !== null;
}

async function createTrigger(
  alert: AlertDefinition,
  value: number
): Promise<void> {
  await prisma.alertTrigger.create({
    data: {
      alertId: alert.id,
      userId: alert.userId,
      triggeredValue: value,
      notified: true,
      notifiedAt: new Date(),
    },
  });
}

async function sendAlertNotification(
  alert: AlertDefinition,
  value: number
): Promise<void> {
  const message = formatAlertMessage(alert, value);

  await sendNotification({
    userId: alert.userId,
    alertId: alert.id,
    alertName: alert.name,
    type: alert.type,
    message,
    value,
    threshold: alert.threshold,
    timestamp: new Date().toISOString(),
  });
}

function formatAlertMessage(alert: AlertDefinition, value: number): string {
  const operatorText = {
    ABOVE: 'above',
    BELOW: 'below',
    EQUALS: 'equals',
    PERCENTAGE_CHANGE_UP: 'increased by',
    PERCENTAGE_CHANGE_DOWN: 'decreased by',
  }[alert.operator];

  return `Alert "${alert.name}" triggered: ${alert.symbol} ${alert.type.toLowerCase()} (${value.toFixed(2)}) is ${operatorText} threshold ${alert.threshold.toFixed(2)}`;
}

export async function evaluateAllAlerts(): Promise<void> {
  try {
    const activeAlerts = await prisma.alertDefinition.findMany({
      where: { isActive: true },
    });

    console.log(`Evaluating ${activeAlerts.length} active alerts...`);

    const results = await Promise.allSettled(
      activeAlerts.map((alert) => evaluateAlert(alert))
    );

    const triggered = results.filter(
      (r) => r.status === 'fulfilled' && r.value === true
    ).length;

    console.log(`Evaluation complete: ${triggered} alerts triggered`);
  } catch (error) {
    console.error('Error evaluating alerts:', error);
  }
}
