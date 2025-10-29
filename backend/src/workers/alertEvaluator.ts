import Bull from 'bull';
import { evaluateAllAlerts } from '../services/alertEvaluationService';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

let alertQueue: Bull.Queue | null = null;

export async function startEvaluationWorker(): Promise<void> {
  try {
    alertQueue = new Bull('alert-evaluation', {
      redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });

    alertQueue.process(async (job) => {
      console.log(`Processing job ${job.id}: Alert evaluation`);
      await evaluateAllAlerts();
      return { success: true };
    });

    await alertQueue.add(
      {},
      {
        repeat: {
          every: 30000,
        },
      }
    );

    console.log('✅ Alert evaluation worker started (runs every 30 seconds)');

    alertQueue.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    alertQueue.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  } catch (error) {
    console.error('Failed to start evaluation worker:', error);
    console.log('⚠️  Alert evaluation worker disabled (Redis not available)');
    console.log('   Alerts will not be automatically evaluated.');
    console.log('   To enable: Install and run Redis, then restart the server.');
  }
}

export function getAlertQueue(): Bull.Queue | null {
  return alertQueue;
}
