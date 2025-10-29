import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { notificationEventEmitter } from '../services/notificationService';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/sse', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.write('data: {"type":"connected","message":"SSE connection established"}\n\n');

  const listener = (notification: any) => {
    if (notification.userId === userId) {
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  };

  notificationEventEmitter.on('notification', listener);

  req.on('close', () => {
    notificationEventEmitter.off('notification', listener);
    res.end();
  });
});

router.get('/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.notificationLog.count({
      where: { userId },
    });

    res.json({
      notifications,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

router.post('/test', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const notification = {
      userId,
      alertId: 'test',
      type: 'test',
      message: 'This is a test notification',
      timestamp: new Date().toISOString(),
    };

    notificationEventEmitter.emit('notification', notification);

    res.json({ message: 'Test notification sent', notification });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export { router as notificationsRouter };
