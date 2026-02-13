import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all vehicles
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: {
                assignedDriver: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(vehicles);
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

// Get vehicle by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                assignedDriver: true,
                routes: {
                    orderBy: { startTime: 'desc' },
                    take: 10,
                },
                maintenance: {
                    orderBy: { scheduledDate: 'desc' },
                    take: 10,
                },
                alerts: {
                    where: { status: 'ACTIVE' },
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json(vehicle);
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
});

// Create vehicle
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { registrationNumber, make, model, year, vin, fuelType, capacity, assignedDriverId } = req.body;

        const vehicle = await prisma.vehicle.create({
            data: {
                registrationNumber,
                make,
                model,
                year: parseInt(year),
                vin,
                fuelType,
                capacity: capacity ? parseFloat(capacity) : undefined,
                assignedDriverId,
            },
        });

        res.status(201).json(vehicle);
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({ error: 'Failed to create vehicle' });
    }
});

// Update vehicle
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data,
        });

        res.json(vehicle);
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ error: 'Failed to update vehicle' });
    }
});

// Delete vehicle
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.vehicle.delete({ where: { id } });

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
});

export default router;
