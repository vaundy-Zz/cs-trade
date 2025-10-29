import { Router } from 'express';
import { PrismaClient, AlertType, ConditionOperator } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(apiLimiter);

const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['PRICE', 'VOLATILITY', 'ROI']),
  symbol: z.string().min(1).max(20),
  operator: z.enum([
    'ABOVE',
    'BELOW',
    'EQUALS',
    'PERCENTAGE_CHANGE_UP',
    'PERCENTAGE_CHANGE_DOWN',
  ]),
  threshold: z.number(),
});

const updateAlertSchema = createAlertSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const alerts = await prisma.alertDefinition.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        triggers: {
          orderBy: { triggeredAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const alert = await prisma.alertDefinition.findFirst({
      where: { id, userId },
      include: {
        triggers: {
          orderBy: { triggeredAt: 'desc' },
        },
      },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const data = createAlertSchema.parse(req.body);

    const alert = await prisma.alertDefinition.create({
      data: {
        ...data,
        userId,
        type: data.type as AlertType,
        operator: data.operator as ConditionOperator,
      },
    });

    res.status(201).json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const data = updateAlertSchema.parse(req.body);

    const existingAlert = await prisma.alertDefinition.findFirst({
      where: { id, userId },
    });

    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updatedData: any = { ...data };
    if (data.type) {
      updatedData.type = data.type as AlertType;
    }
    if (data.operator) {
      updatedData.operator = data.operator as ConditionOperator;
    }

    const alert = await prisma.alertDefinition.update({
      where: { id },
      data: updatedData,
    });

    res.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existingAlert = await prisma.alertDefinition.findFirst({
      where: { id, userId },
    });

    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await prisma.alertDefinition.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

router.get('/:id/triggers', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const alert = await prisma.alertDefinition.findFirst({
      where: { id, userId },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const triggers = await prisma.alertTrigger.findMany({
      where: { alertId: id },
      orderBy: { triggeredAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.alertTrigger.count({
      where: { alertId: id },
    });

    res.json({
      triggers,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get triggers error:', error);
    res.status(500).json({ error: 'Failed to fetch triggers' });
  }
});

export { router as alertsRouter };
