import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all drivers
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const drivers = await prisma.driver.findMany({
            include: {
                vehicles: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(drivers);
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});

// Get driver by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const driver = await prisma.driver.findUnique({
            where: { id },
            include: {
                vehicles: true,
                trips: {
                    orderBy: { startTime: 'desc' },
                    take: 20,
                },
            },
        });

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({ error: 'Failed to fetch driver' });
    }
});

// Create driver
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, licenseNumber, email, phone } = req.body;

        const driver = await prisma.driver.create({
            data: {
                name,
                licenseNumber,
                email,
                phone,
            },
        });

        res.status(201).json(driver);
    } catch (error) {
        console.error('Create driver error:', error);
        res.status(500).json({ error: 'Failed to create driver' });
    }
});

// Update driver
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const driver = await prisma.driver.update({
            where: { id },
            data,
        });

        res.json(driver);
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ error: 'Failed to update driver' });
    }
});

// Delete driver
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.driver.delete({ where: { id } });

        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({ error: 'Failed to delete driver' });
    }
});

export default router;
