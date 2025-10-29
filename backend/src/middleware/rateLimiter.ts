import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const notificationRateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const maxNotificationsPerHour = parseInt(
      process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '50'
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentNotifications = await prisma.notificationLog.count({
      where: {
        userId,
        sentAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentNotifications >= maxNotificationsPerHour) {
      return res.status(429).json({
        error: 'Notification rate limit exceeded',
        message: `Maximum ${maxNotificationsPerHour} notifications per hour allowed`,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
};
