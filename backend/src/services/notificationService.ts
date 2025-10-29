import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const notificationEventEmitter = new EventEmitter();

export interface Notification {
  userId: string;
  alertId: string;
  alertName: string;
  type: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export async function sendNotification(notification: Notification): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentNotifications = await prisma.notificationLog.count({
      where: {
        userId: notification.userId,
        sentAt: { gte: oneHourAgo },
      },
    });

    const maxNotificationsPerHour = parseInt(
      process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '50'
    );

    if (recentNotifications >= maxNotificationsPerHour) {
      console.log(
        `Rate limit exceeded for user ${notification.userId}, notification dropped`
      );
      return;
    }

    await prisma.notificationLog.create({
      data: {
        userId: notification.userId,
        alertId: notification.alertId,
        channel: 'sse',
        message: notification.message,
        success: true,
      },
    });

    notificationEventEmitter.emit('notification', notification);

    console.log(`Notification sent to user ${notification.userId}`);
  } catch (error) {
    console.error('Failed to send notification:', error);

    await prisma.notificationLog.create({
      data: {
        userId: notification.userId,
        alertId: notification.alertId,
        channel: 'sse',
        message: notification.message,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function sendEmailNotification(
  userId: string,
  subject: string,
  body: string
): Promise<void> {
  console.log(`[EMAIL PLACEHOLDER] Sending email to user ${userId}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  console.log(`[PUSH PLACEHOLDER] Sending push notification to user ${userId}`);
  console.log(`Title: ${title}`);
  console.log(`Body: ${body}`);
}
