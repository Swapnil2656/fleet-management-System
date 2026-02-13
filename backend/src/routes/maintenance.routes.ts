import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { predictMaintenance, checkOverdueMaintenance, scheduleMaintenance } from '../services/maintenance.service';

const router = Router();
const prisma = new PrismaClient();

// Get all maintenance records
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, status } = req.query;

        const where: any = {};
        if (vehicleId) where.vehicleId = vehicleId;
        if (status) where.status = status;

        const maintenance = await prisma.maintenance.findMany({
            where,
            include: {
                vehicle: true,
            },
            orderBy: { scheduledDate: 'desc' },
        });

        res.json(maintenance);
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
});

// Get maintenance schedule
router.get('/schedule', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const upcoming = await prisma.maintenance.findMany({
            where: {
                status: { in: ['SCHEDULED', 'OVERDUE'] },
                scheduledDate: {
                    gte: new Date(),
                },
            },
            include: {
                vehicle: true,
            },
            orderBy: { scheduledDate: 'asc' },
        });

        res.json(upcoming);
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({ error: 'Failed to fetch maintenance schedule' });
    }
});

// Predict maintenance for a vehicle
router.post('/predict', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, currentMileage } = req.body;

        const predictions = await predictMaintenance(vehicleId, currentMileage);

        res.json(predictions);
    } catch (error) {
        console.error('Predict maintenance error:', error);
        res.status(500).json({ error: 'Failed to predict maintenance' });
    }
});

// Schedule maintenance
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, type, description, scheduledDate, estimatedCost } = req.body;

        const maintenance = await scheduleMaintenance({
            vehicleId,
            type,
            description,
            scheduledDate: new Date(scheduledDate),
            estimatedCost,
        });

        res.status(201).json(maintenance);
    } catch (error) {
        console.error('Schedule maintenance error:', error);
        res.status(500).json({ error: 'Failed to schedule maintenance' });
    }
});

// Update maintenance
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const maintenance = await prisma.maintenance.update({
            where: { id },
            data,
        });

        res.json(maintenance);
    } catch (error) {
        console.error('Update maintenance error:', error);
        res.status(500).json({ error: 'Failed to update maintenance' });
    }
});

// Complete maintenance
router.put('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cost, notes, mileage } = req.body;

        const maintenance = await prisma.maintenance.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedDate: new Date(),
                cost: cost || 0,
                notes,
                mileage,
            },
        });

        res.json(maintenance);
    } catch (error) {
        console.error('Complete maintenance error:', error);
        res.status(500).json({ error: 'Failed to complete maintenance' });
    }
});

// Check overdue maintenance
router.get('/overdue', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const overdue = await checkOverdueMaintenance();
        res.json(overdue);
    } catch (error) {
        console.error('Check overdue error:', error);
        res.status(500).json({ error: 'Failed to check overdue maintenance' });
    }
});

export default router;
